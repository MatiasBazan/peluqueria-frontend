import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Profesional, Servicio } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EstadoError } from '../../../shared/estado-error/estado-error';
import { HorariosDialog } from './horarios-dialog';
import { ProfesionalDialog } from './profesional-dialog';

/** ABM de profesionales y gestión de sus horarios. */
@Component({
  selector: 'app-profesionales-admin',
  imports: [MatButtonModule, MatDialogModule, MatProgressSpinnerModule, EstadoError],
  templateUrl: './profesionales-admin.html',
  styleUrl: './profesionales-admin.css',
})
export class ProfesionalesAdmin {
  private readonly profesionalService = inject(ProfesionalService);
  private readonly servicioService = inject(ServicioService);
  private readonly notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  protected readonly profesionales = signal<Profesional[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);
  protected readonly procesandoId = signal<number | null>(null);
  private readonly servicios = signal<Servicio[]>([]);

  constructor() {
    this.servicioService.listarTodos().subscribe({ next: (s) => this.servicios.set(s) });
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.profesionalService.listarTodos().subscribe({
      next: (profesionales) => {
        this.profesionales.set(profesionales);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      },
    });
  }

  protected fotoDe(p: Profesional): string {
    return p.foto || `https://picsum.photos/seed/lumiere-${p.id}/80/80`;
  }

  protected nuevo(): void {
    this.dialog
      .open(ProfesionalDialog, { data: { servicios: this.servicios() }, autoFocus: false })
      .afterClosed()
      .subscribe((cambio) => {
        if (cambio) {
          this.cargar();
        }
      });
  }

  protected editar(profesional: Profesional): void {
    this.dialog
      .open(ProfesionalDialog, {
        data: { servicios: this.servicios(), profesional },
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((cambio) => {
        if (cambio) {
          this.cargar();
        }
      });
  }

  protected gestionarHorarios(profesional: Profesional): void {
    this.dialog.open(HorariosDialog, { data: { profesional }, autoFocus: false });
  }

  protected eliminar(profesional: Profesional): void {
    this.dialog
      .open(ConfirmDialog, {
        autoFocus: false,
        data: {
          titulo: 'Dar de baja profesional',
          mensaje: `¿Seguro que querés dar de baja a ${profesional.nombre} ${profesional.apellido}?`,
          textoConfirmar: 'Dar de baja',
          peligro: true,
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }
        this.procesandoId.set(profesional.id);
        this.profesionalService.eliminar(profesional.id).subscribe({
          next: () => {
            this.procesandoId.set(null);
            this.notify.success('Profesional dado de baja.');
            this.cargar();
          },
          error: () => this.procesandoId.set(null),
        });
      });
  }
}
