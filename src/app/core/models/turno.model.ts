/** Estados posibles de un turno (enum `EstadoTurno` del backend). */
export type EstadoTurno = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'COMPLETADO';

/** Turno. Espeja `TurnoResponse`. `fechaHora` viene como "yyyy-MM-ddTHH:mm". */
export interface Turno {
  id: number;
  profesionalId: number;
  profesionalNombre: string;
  servicioId: number;
  servicioNombre: string;
  duracionMinutos: number;
  clienteNombre: string;
  clienteTelefono: string;
  fechaHora: string;
  estado: EstadoTurno;
  /** Sólo presente al crear el turno; null en los listados. */
  codigoCancelacion: string | null;
}

/** Cuerpo para reservar un turno (`CrearTurnoRequest`). */
export interface CrearTurnoRequest {
  profesionalId: number;
  servicioId: number;
  /** Formato "yyyy-MM-ddTHH:mm". */
  fechaHora: string;
  nombreCliente: string;
  telefonoCliente: string;
  emailCliente?: string;
}

/** Respuesta de disponibilidad (`DisponibilidadResponse`). */
export interface Disponibilidad {
  profesionalId: number;
  servicioId: number;
  fecha: string;
  duracionMinutos: number;
  /** Horarios libres en formato "HH:mm". */
  slots: string[];
}

/** Cuerpo para cambiar el estado de un turno (`CambiarEstadoRequest`). */
export interface CambiarEstadoRequest {
  estado: EstadoTurno;
}

/** Filtros opcionales de la agenda admin (`GET /api/turnos`). */
export interface FiltroTurnos {
  profesionalId?: number;
  fecha?: string;
  estado?: EstadoTurno;
}
