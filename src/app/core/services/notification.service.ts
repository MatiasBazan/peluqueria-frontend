import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/** Notificaciones tipo "toast" usando el snackbar de Material. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly base: MatSnackBarConfig = {
    horizontalPosition: 'center',
    verticalPosition: 'top',
  };

  error(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      ...this.base,
      duration: 6000,
      panelClass: 'snack-error',
    });
  }

  success(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      ...this.base,
      duration: 4000,
      panelClass: 'snack-success',
    });
  }
}
