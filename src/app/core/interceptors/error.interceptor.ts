import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiError } from '../models';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Manejo centralizado de errores HTTP:
 * - status 0: backend caído / sin conexión.
 * - 401 (fuera del login): sesión expirada → limpia token y redirige al login.
 * - resto: muestra el `message` que devuelve el backend en un snackbar.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const apiError = esApiError(err.error) ? err.error : null;
      let mensaje: string;

      if (err.status === 0) {
        mensaje = `No pudimos conectar con el servidor. Verificá que el backend esté corriendo en ${environment.apiUrl}.`;
      } else if (err.status === 401 && !req.url.includes('/api/auth/login')) {
        auth.logout();
        void router.navigate(['/admin/login']);
        mensaje = 'Tu sesión expiró. Ingresá nuevamente.';
      } else {
        mensaje = apiError?.message ?? 'Ocurrió un error inesperado. Intentá nuevamente.';
      }

      notify.error(mensaje);
      return throwError(() => err);
    }),
  );
};

function esApiError(body: unknown): body is ApiError {
  return typeof body === 'object' && body !== null && 'message' in body;
}
