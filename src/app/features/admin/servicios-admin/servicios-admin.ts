import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Servicio } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EstadoError } from '../../../shared/estado-error/estado-error';
import { formatDuracion, formatPrecio } from '../../../shared/util/format';
import { ServicioDialog } from './servicio-dialog';

/** ABM de servicios del catálogo. */
@Component({
  selector: 'app-servicios-admin',
  imports: [MatButtonModule, MatDialogModule, MatProgressSpinnerModule, EstadoError],
  templateUrl: './servicios-admin.html',
  styleUrl: './servicios-admin.css',
})
export class ServiciosAdmin {
  private readonly servicioService = inject(ServicioService);
  private readonly notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  protected readonly formatPrecio = formatPrecio;
  protected readonly formatDuracion = formatDuracion;

  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);
  protected readonly procesandoId = signal<number | null>(null);

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.servicioService.listarTodos().subscribe({
      next: (servicios) => {
        this.servicios.set(servicios);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      },
    });
  }

  protected nuevo(): void {
    this.dialog
      .open(ServicioDialog, { data: {}, autoFocus: false })
      .afterClosed()
      .subscribe((cambio) => {
        if (cambio) {
          this.cargar();
        }
      });
  }

  protected editar(servicio: Servicio): void {
    this.dialog
      .open(ServicioDialog, { data: { servicio }, autoFocus: false })
      .afterClosed()
      .subscribe((cambio) => {
        if (cambio) {
          this.cargar();
        }
      });
  }

  protected eliminar(servicio: Servicio): void {
    this.dialog
      .open(ConfirmDialog, {
        autoFocus: false,
        data: {
          titulo: 'Dar de baja servicio',
          mensaje: `¿Seguro que querés dar de baja "${servicio.nombre}"? Dejará de mostrarse en la web.`,
          textoConfirmar: 'Dar de baja',
          peligro: true,
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }
        this.procesandoId.set(servicio.id);
        this.servicioService.eliminar(servicio.id).subscribe({
          next: () => {
            this.procesandoId.set(null);
            this.notify.success('Servicio dado de baja.');
            this.cargar();
          },
          error: () => this.procesandoId.set(null),
        });
      });
  }
}
