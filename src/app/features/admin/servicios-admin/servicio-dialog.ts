import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Servicio, ServicioRequest } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { ServicioService } from '../../../core/services/servicio.service';

/** Alta / edición de un servicio. Devuelve `true` si hubo cambios. */
@Component({
  selector: 'app-servicio-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './servicio-dialog.html',
  styles: [
    `
      .form-dialog {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: min(460px, 92vw);
        padding-top: 6px;
      }
      .row {
        display: flex;
        gap: 14px;
      }
      .row mat-form-field {
        flex: 1;
      }
      mat-form-field {
        width: 100%;
      }
      .toggle {
        margin: 6px 0 4px;
      }
    `,
  ],
})
export class ServicioDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicioService = inject(ServicioService);
  private readonly notify = inject(NotificationService);
  private readonly ref = inject(MatDialogRef<ServicioDialog>);
  private readonly data = inject<{ servicio?: Servicio }>(MAT_DIALOG_DATA);

  protected readonly esEdicion = !!this.data.servicio;
  protected readonly guardando = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: ['', [Validators.maxLength(500)]],
    duracionMinutos: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    activo: [true],
  });

  constructor() {
    const s = this.data.servicio;
    if (s) {
      this.form.patchValue({
        nombre: s.nombre,
        descripcion: s.descripcion ?? '',
        duracionMinutos: s.duracionMinutos,
        precio: s.precio,
        activo: s.activo,
      });
    }
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valor = this.form.getRawValue();
    const req: ServicioRequest = {
      nombre: valor.nombre.trim(),
      descripcion: valor.descripcion.trim() || null,
      duracionMinutos: valor.duracionMinutos,
      precio: valor.precio,
      activo: valor.activo,
    };

    this.guardando.set(true);
    const peticion = this.data.servicio
      ? this.servicioService.actualizar(this.data.servicio.id, req)
      : this.servicioService.crear(req);

    peticion.subscribe({
      next: () => {
        this.notify.success(this.esEdicion ? 'Servicio actualizado.' : 'Servicio creado.');
        this.ref.close(true);
      },
      error: () => this.guardando.set(false),
    });
  }
}
