import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Profesional, ProfesionalRequest, Servicio } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfesionalService } from '../../../core/services/profesional.service';

interface DialogData {
  servicios: Servicio[];
  profesional?: Profesional;
}

/** Alta / edición de un profesional. Devuelve `true` si hubo cambios. */
@Component({
  selector: 'app-profesional-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profesional-dialog.html',
  styles: [
    `
      .form-dialog {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: min(480px, 92vw);
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
export class ProfesionalDialog {
  private readonly fb = inject(FormBuilder);
  private readonly profesionalService = inject(ProfesionalService);
  private readonly notify = inject(NotificationService);
  private readonly ref = inject(MatDialogRef<ProfesionalDialog>);
  protected readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  protected readonly esEdicion = !!this.data.profesional;
  protected readonly guardando = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    apellido: ['', [Validators.required, Validators.maxLength(80)]],
    telefono: ['', [Validators.maxLength(30)]],
    foto: ['', [Validators.maxLength(500)]],
    activo: [true],
    servicioIds: this.fb.control<number[]>([], { nonNullable: true }),
  });

  constructor() {
    const p = this.data.profesional;
    if (p) {
      this.form.patchValue({
        nombre: p.nombre,
        apellido: p.apellido,
        telefono: p.telefono ?? '',
        foto: p.foto ?? '',
        activo: p.activo,
        servicioIds: p.servicios.map((s) => s.id),
      });
    }
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valor = this.form.getRawValue();
    const req: ProfesionalRequest = {
      nombre: valor.nombre.trim(),
      apellido: valor.apellido.trim(),
      telefono: valor.telefono.trim() || null,
      foto: valor.foto.trim() || null,
      activo: valor.activo,
      servicioIds: valor.servicioIds,
    };

    this.guardando.set(true);
    const peticion = this.data.profesional
      ? this.profesionalService.actualizar(this.data.profesional.id, req)
      : this.profesionalService.crear(req);

    peticion.subscribe({
      next: () => {
        this.notify.success(this.esEdicion ? 'Profesional actualizado.' : 'Profesional creado.');
        this.ref.close(true);
      },
      error: () => this.guardando.set(false),
    });
  }
}
