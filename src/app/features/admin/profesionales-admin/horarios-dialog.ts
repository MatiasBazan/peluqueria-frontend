import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { DiaSemana, Horario, HorarioRequest, Profesional } from '../../../core/models';
import { HorarioService } from '../../../core/services/horario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DIAS_SEMANA, DIA_ETIQUETA } from '../../../shared/util/format';

/** Gestión de los horarios laborales de un profesional. */
@Component({
  selector: 'app-horarios-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './horarios-dialog.html',
  styleUrl: './horarios-dialog.css',
})
export class HorariosDialog {
  private readonly fb = inject(FormBuilder);
  private readonly horarioService = inject(HorarioService);
  private readonly notify = inject(NotificationService);
  private readonly profesional = inject<{ profesional: Profesional }>(MAT_DIALOG_DATA).profesional;

  protected readonly dias = DIAS_SEMANA;
  protected readonly diaEtiqueta = DIA_ETIQUETA;
  protected readonly nombre = `${this.profesional.nombre} ${this.profesional.apellido}`;

  protected readonly horarios = signal<Horario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly procesandoId = signal<number | null>(null);

  private readonly ordenDia: Record<DiaSemana, number> = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
  };

  protected readonly form = this.fb.nonNullable.group({
    diaSemana: this.fb.control<DiaSemana | null>(null, Validators.required),
    horaInicio: ['09:00', Validators.required],
    horaFin: ['18:00', Validators.required],
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.horarioService.listarPorProfesional(this.profesional.id).subscribe({
      next: (horarios) => {
        this.horarios.set(this.ordenar(horarios));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  protected agregar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valor = this.form.getRawValue();
    if (valor.horaFin <= valor.horaInicio) {
      this.notify.error('La hora de fin debe ser posterior a la de inicio.');
      return;
    }

    const req: HorarioRequest = {
      profesionalId: this.profesional.id,
      diaSemana: valor.diaSemana as DiaSemana,
      horaInicio: valor.horaInicio,
      horaFin: valor.horaFin,
    };

    this.guardando.set(true);
    this.horarioService.crear(req).subscribe({
      next: (horario) => {
        this.horarios.update((lista) => this.ordenar([...lista, horario]));
        this.guardando.set(false);
        this.notify.success('Horario agregado.');
      },
      error: () => this.guardando.set(false),
    });
  }

  protected eliminar(horario: Horario): void {
    this.procesandoId.set(horario.id);
    this.horarioService.eliminar(horario.id).subscribe({
      next: () => {
        this.horarios.update((lista) => lista.filter((h) => h.id !== horario.id));
        this.procesandoId.set(null);
        this.notify.success('Horario eliminado.');
      },
      error: () => this.procesandoId.set(null),
    });
  }

  private ordenar(lista: Horario[]): Horario[] {
    return [...lista].sort(
      (a, b) =>
        this.ordenDia[a.diaSemana] - this.ordenDia[b.diaSemana] ||
        a.horaInicio.localeCompare(b.horaInicio),
    );
  }
}
