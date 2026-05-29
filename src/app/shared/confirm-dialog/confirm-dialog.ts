import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  peligro?: boolean;
}

/** Diálogo genérico de confirmación (sí / no). */
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <p>{{ data.mensaje }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" class="btn btn-ghost btn-sm" (click)="cerrar(false)">Cancelar</button>
      <button
        type="button"
        class="btn btn-sm"
        [class.btn-danger]="data.peligro"
        [class.btn-primary]="!data.peligro"
        (click)="cerrar(true)"
      >
        {{ data.textoConfirmar ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ConfirmDialog>);

  protected cerrar(resultado: boolean): void {
    this.ref.close(resultado);
  }
}
