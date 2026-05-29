/** Servicio del catálogo. Espeja `ServicioResponse` del backend. */
export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracionMinutos: number;
  precio: number;
  activo: boolean;
}

/** Cuerpo para crear/actualizar un servicio (`ServicioRequest`). */
export interface ServicioRequest {
  nombre: string;
  descripcion: string | null;
  duracionMinutos: number;
  precio: number;
  activo: boolean;
}
