import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { EstadoTurno, FiltroTurnos, Profesional, Turno } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { TurnoService } from '../../../core/services/turno.service';
import { EstadoChip } from '../../../shared/estado-chip/estado-chip';
import { EstadoError } from '../../../shared/estado-error/estado-error';
import {
  ESTADOS_TURNO,
  ESTADO_ETIQUETA,
  formatFechaCorta,
  formatHora,
  toFechaISO,
} from '../../../shared/util/format';

interface AccionEstado {
  estado: EstadoTurno;
  etiqueta: string;
  icono: string;
}

/** Agenda de turnos con filtros y cambio de estado. */
@Component({
  selector: 'app-agenda',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    EstadoChip,
    EstadoError,
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda {
  private readonly turnoService = inject(TurnoService);
  private readonly profesionalService = inject(ProfesionalService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  protected readonly formatFechaCorta = formatFechaCorta;
  protected readonly formatHora = formatHora;
  protected readonly estados = ESTADOS_TURNO;
  protected readonly estadoEtiqueta = ESTADO_ETIQUETA;

  protected readonly turnos = signal<Turno[]>([]);
  protected readonly profesionales = signal<Profesional[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);
  protected readonly procesandoId = signal<number | null>(null);

  protected readonly filtros = this.fb.group({
    profesionalId: this.fb.control<number | null>(null),
    fecha: this.fb.control<Date | null>(null),
    estado: this.fb.control<EstadoTurno | null>(null),
  });

  protected readonly hayFiltros = computed(() => {
    const { profesionalId, fecha, estado } = this.filtrosValor();
    return profesionalId != null || fecha != null || estado != null;
  });

  // Espejo en signal de los valores del form, para `hayFiltros`.
  private readonly filtrosValor = signal(this.filtros.getRawValue());

  constructor() {
    this.profesionalService
      .listarTodos()
      .pipe(takeUntilDestroyed())
      .subscribe({ next: (p) => this.profesionales.set(p) });

    this.filtros.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.filtrosValor.set(this.filtros.getRawValue());
      this.cargar();
    });

    this.cargar();
  }

  protected cargar(): void {
    const { profesionalId, fecha, estado } = this.filtros.getRawValue();
    const filtro: FiltroTurnos = {};
    if (profesionalId != null) {
      filtro.profesionalId = profesionalId;
    }
    if (fecha) {
      filtro.fecha = toFechaISO(fecha);
    }
    if (estado) {
      filtro.estado = estado;
    }

    this.cargando.set(true);
    this.error.set(false);
    this.turnoService.listarAdmin(filtro).subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      },
    });
  }

  protected limpiarFiltros(): void {
    this.filtros.reset({ profesionalId: null, fecha: null, estado: null });
  }

  protected accionesDe(estado: EstadoTurno): AccionEstado[] {
    switch (estado) {
      case 'PENDIENTE':
        return [
          { estado: 'CONFIRMADO', etiqueta: 'Confirmar', icono: 'check_circle' },
          { estado: 'CANCELADO', etiqueta: 'Cancelar', icono: 'cancel' },
        ];
      case 'CONFIRMADO':
        return [
          { estado: 'COMPLETADO', etiqueta: 'Marcar completado', icono: 'task_alt' },
          { estado: 'CANCELADO', etiqueta: 'Cancelar', icono: 'cancel' },
        ];
      default:
        return [];
    }
  }

  protected cambiarEstado(turno: Turno, nuevo: EstadoTurno): void {
    this.procesandoId.set(turno.id);
    this.turnoService.cambiarEstado(turno.id, nuevo).subscribe({
      next: (actualizado) => {
        this.turnos.update((lista) =>
          lista.map((t) => (t.id === actualizado.id ? actualizado : t)),
        );
        this.procesandoId.set(null);
        this.notify.success(`Turno ${ESTADO_ETIQUETA[nuevo].toLowerCase()}.`);
      },
      error: () => this.procesandoId.set(null),
    });
  }
}
