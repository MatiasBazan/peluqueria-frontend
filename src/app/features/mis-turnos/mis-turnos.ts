import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EstadoTurno, Turno } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import { TurnoService } from '../../core/services/turno.service';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { EstadoChip } from '../../shared/estado-chip/estado-chip';
import { formatDuracion, formatFechaLarga, formatHora } from '../../shared/util/format';

/** Consulta de turnos futuros por teléfono, con cancelación mediante código. */
@Component({
  selector: 'app-mis-turnos',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    Header,
    Footer,
    EstadoChip,
  ],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.css',
})
export class MisTurnos {
  private readonly turnoService = inject(TurnoService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  protected readonly formatFechaLarga = formatFechaLarga;
  protected readonly formatHora = formatHora;
  protected readonly formatDuracion = formatDuracion;

  protected readonly buscarForm = this.fb.nonNullable.group({
    telefono: ['', [Validators.required, Validators.maxLength(30)]],
  });

  protected readonly turnos = signal<Turno[]>([]);
  protected readonly cargando = signal(false);
  protected readonly buscado = signal(false);

  protected readonly codigoControl = this.fb.nonNullable.control('', [Validators.required]);
  protected readonly cancelandoId = signal<number | null>(null);
  protected readonly procesando = signal(false);

  protected buscar(): void {
    if (this.buscarForm.invalid) {
      this.buscarForm.markAllAsTouched();
      return;
    }
    const telefono = this.buscarForm.getRawValue().telefono.trim();
    this.cargando.set(true);
    this.cancelandoId.set(null);
    this.turnoService.turnosCliente(telefono).subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.buscado.set(true);
        this.cargando.set(false);
      },
      error: () => {
        this.buscado.set(true);
        this.cargando.set(false);
      },
    });
  }

  protected esCancelable(estado: EstadoTurno): boolean {
    return estado === 'PENDIENTE' || estado === 'CONFIRMADO';
  }

  protected abrirCancelacion(turno: Turno): void {
    this.codigoControl.reset('');
    this.cancelandoId.set(turno.id);
  }

  protected cerrarCancelacion(): void {
    this.cancelandoId.set(null);
  }

  protected confirmarCancelacion(turno: Turno): void {
    if (this.codigoControl.invalid) {
      this.codigoControl.markAsTouched();
      return;
    }
    const codigo = this.codigoControl.getRawValue().trim();
    this.procesando.set(true);
    this.turnoService.cancelar(turno.id, codigo).subscribe({
      next: (actualizado) => {
        this.turnos.update((lista) =>
          lista.map((t) => (t.id === actualizado.id ? actualizado : t)),
        );
        this.procesando.set(false);
        this.cancelandoId.set(null);
        this.notify.success('Tu turno fue cancelado.');
      },
      error: () => this.procesando.set(false),
    });
  }
}
