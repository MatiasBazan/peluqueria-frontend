/** Error de validación por campo (`ErrorResponse.FieldError`). */
export interface FieldError {
  campo: string;
  mensaje: string;
}

/** Shape de error estándar del backend (`ErrorResponse`). */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  errores: FieldError[] | null;
}
