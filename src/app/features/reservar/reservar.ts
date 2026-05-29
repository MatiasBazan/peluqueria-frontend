import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';

import { CrearTurnoRequest, Profesional, Servicio, Turno } from '../../core/models';
import { ProfesionalService } from '../../core/services/profesional.service';
import { ServicioService } from '../../core/services/servicio.service';
import { TurnoService } from '../../core/services/turno.service';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import {
  formatDuracion,
  formatFechaLarga,
  formatPrecio,
  toFechaHora,
  toFechaISO,
} from '../../shared/util/format';

/** Wizard de reserva de turnos en 4 pasos (servicio → profesional → fecha/hora → datos). */
@Component({
  selector: 'app-reservar',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    Header,
    Footer,
  ],
  templateUrl: './reservar.html',
  styleUrl: './reservar.css',
})
export class Reservar {
  private readonly servicioService = inject(ServicioService);
  private readonly profesionalService = inject(ProfesionalService);
  private readonly turnoService = inject(TurnoService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly esMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 760px)').pipe(map((res) => res.matches)),
    { initialValue: false }
  );

  protected readonly formatPrecio = formatPrecio;
  protected readonly formatDuracion = formatDuracion;
  protected readonly formatFechaLarga = formatFechaLarga;

  // --- Datos del backend ---
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly profesionales = signal<Profesional[]>([]);
  protected readonly cargandoDatos = signal(true);

  // --- Selección del usuario ---
  protected readonly servicioSeleccionado = signal<Servicio | null>(null);
  protected readonly profesionalSeleccionado = signal<Profesional | null>(null);
  protected readonly fecha = signal<Date | null>(null);
  protected readonly horaSeleccionada = signal<string | null>(null);

  // --- Disponibilidad ---
  protected readonly slots = signal<string[]>([]);
  protected readonly cargandoSlots = signal(false);
  protected readonly disponibilidadConsultada = signal(false);
  protected readonly errorSlots = signal(false);

  // --- Envío / resultado ---
  protected readonly enviando = signal(false);
  protected readonly turnoConfirmado = signal<Turno | null>(null);

  protected readonly minFecha = new Date();
  protected readonly pasoInicial = signal(0);

  protected readonly datosForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    telefono: ['', [Validators.required, Validators.maxLength(30)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
  });

  /** Fecha elegida formateada para el resumen (a partir del Date, sin corrimiento de zona). */
  protected readonly fechaTextoResumen = computed(() => {
    const fecha = this.fecha();
    if (!fecha) {
      return '—';
    }
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(fecha);
  });

  /** Profesionales que ofrecen el servicio elegido. */
  protected readonly profesionalesFiltrados = computed(() => {
    const servicio = this.servicioSeleccionado();
    if (!servicio) {
      return [];
    }
    return this.profesionales().filter((p) => p.servicios.some((s) => s.id === servicio.id));
  });

  constructor() {
    this.servicioService
      .listarPublicos()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (servicios) => {
          this.servicios.set(servicios);
          this.intentarPreseleccion();
        },
      });

    this.profesionalService
      .listarPublicos()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (profesionales) => {
          this.profesionales.set(profesionales);
          this.cargandoDatos.set(false);
          this.intentarPreseleccion();
        },
        error: () => this.cargandoDatos.set(false),
      });
  }

  // --- Selección ---
  protected seleccionarServicio(servicio: Servicio): void {
    if (this.servicioSeleccionado()?.id === servicio.id) {
      return;
    }
    this.servicioSeleccionado.set(servicio);
    const prof = this.profesionalSeleccionado();
    if (prof && !prof.servicios.some((s) => s.id === servicio.id)) {
      this.profesionalSeleccionado.set(null);
    }
    this.reiniciarDisponibilidad();
    this.cargarDisponibilidad();
  }

  protected seleccionarProfesional(profesional: Profesional): void {
    this.profesionalSeleccionado.set(profesional);
    this.reiniciarDisponibilidad();
    this.cargarDisponibilidad();
  }

  protected onFechaChange(evento: MatDatepickerInputEvent<Date>): void {
    this.fecha.set(evento.value);
    this.reiniciarDisponibilidad();
    this.cargarDisponibilidad();
  }

  protected seleccionarHora(slot: string): void {
    this.horaSeleccionada.set(slot);
  }

  // --- Disponibilidad ---
  protected reintentarDisponibilidad(): void {
    this.cargarDisponibilidad();
  }

  private cargarDisponibilidad(): void {
    const servicio = this.servicioSeleccionado();
    const profesional = this.profesionalSeleccionado();
    const fecha = this.fecha();
    if (!servicio || !profesional || !fecha) {
      return;
    }
    this.cargandoSlots.set(true);
    this.errorSlots.set(false);
    this.disponibilidadConsultada.set(false);
    this.turnoService
      .disponibilidad(profesional.id, servicio.id, toFechaISO(fecha))
      .subscribe({
        next: (disp) => {
          this.slots.set(disp.slots);
          this.cargandoSlots.set(false);
          this.disponibilidadConsultada.set(true);
        },
        error: () => {
          this.cargandoSlots.set(false);
          this.errorSlots.set(true);
        },
      });
  }

  private reiniciarDisponibilidad(): void {
    this.horaSeleccionada.set(null);
    this.slots.set([]);
    this.disponibilidadConsultada.set(false);
    this.errorSlots.set(false);
  }

  // --- Confirmación ---
  protected confirmar(): void {
    const servicio = this.servicioSeleccionado();
    const profesional = this.profesionalSeleccionado();
    const fecha = this.fecha();
    const hora = this.horaSeleccionada();
    if (!servicio || !profesional || !fecha || !hora || this.datosForm.invalid) {
      this.datosForm.markAllAsTouched();
      return;
    }

    const { nombre, telefono, email } = this.datosForm.getRawValue();
    const req: CrearTurnoRequest = {
      profesionalId: profesional.id,
      servicioId: servicio.id,
      fechaHora: toFechaHora(fecha, hora),
      nombreCliente: nombre.trim(),
      telefonoCliente: telefono.trim(),
      emailCliente: email.trim() || undefined,
    };

    this.enviando.set(true);
    this.turnoService.crear(req).subscribe({
      next: (turno) => {
        this.turnoConfirmado.set(turno);
        this.enviando.set(false);
      },
      error: () => this.enviando.set(false),
    });
  }

  protected reservarOtro(): void {
    this.turnoConfirmado.set(null);
    this.servicioSeleccionado.set(null);
    this.profesionalSeleccionado.set(null);
    this.fecha.set(null);
    this.reiniciarDisponibilidad();
    this.datosForm.reset();
    this.pasoInicial.set(0);
  }

  private intentarPreseleccion(): void {
    if (this.servicios().length === 0 || this.profesionales().length === 0) {
      return;
    }
    const params = this.route.snapshot.queryParamMap;
    const profId = Number(params.get('profesional'));
    const servId = Number(params.get('servicio'));

    if (profId) {
      const prof = this.profesionales().find((p) => p.id === profId);
      if (prof) {
        const serv =
          prof.servicios.find((s) => s.id === servId) ?? prof.servicios[0] ?? null;
        if (serv) {
          this.servicioSeleccionado.set(this.servicios().find((s) => s.id === serv.id) ?? serv);
        }
        this.profesionalSeleccionado.set(prof);
        this.cargarDisponibilidad();
        this.pasoInicial.set(2);
        return;
      }
    }

    if (servId) {
      const serv = this.servicios().find((s) => s.id === servId);
      if (serv) {
        this.servicioSeleccionado.set(serv);
        this.pasoInicial.set(1);
      }
    }
  }
}
