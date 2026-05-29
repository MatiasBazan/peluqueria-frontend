import { DiaSemana, EstadoTurno } from '../../core/models';

/** Formatea un precio en pesos argentinos, sin centavos. */
export function formatPrecio(valor: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}

/** Convierte minutos a un texto legible: "30 min", "1 h", "1 h 30 min". */
export function formatDuracion(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

/** Fecha local en formato "yyyy-MM-dd" (sin corrimiento por zona horaria). */
export function toFechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Combina una fecha y un horario "HH:mm" en el formato "yyyy-MM-ddTHH:mm". */
export function toFechaHora(fecha: Date, horaMinuto: string): string {
  return `${toFechaISO(fecha)}T${horaMinuto}`;
}

/** Formatea un "yyyy-MM-ddTHH:mm" como fecha larga en español. */
export function formatFechaLarga(fechaHoraIso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(fechaHoraIso));
}

/** Formato compacto "vie, 25/05" para tablas. */
export function formatFechaCorta(fechaHoraIso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(fechaHoraIso));
}

/** Extrae la hora "HH:mm" (formato 24hs argentino) de un "yyyy-MM-ddTHH:mm". */
export function formatHora(fechaHoraIso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(fechaHoraIso));
}

/** Días de la semana en orden, para selectores. */
export const DIAS_SEMANA: ReadonlyArray<{ valor: DiaSemana; etiqueta: string }> = [
  { valor: 'MONDAY', etiqueta: 'Lunes' },
  { valor: 'TUESDAY', etiqueta: 'Martes' },
  { valor: 'WEDNESDAY', etiqueta: 'Miércoles' },
  { valor: 'THURSDAY', etiqueta: 'Jueves' },
  { valor: 'FRIDAY', etiqueta: 'Viernes' },
  { valor: 'SATURDAY', etiqueta: 'Sábado' },
  { valor: 'SUNDAY', etiqueta: 'Domingo' },
];

export const DIA_ETIQUETA: Record<DiaSemana, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

/** Estados de turno en el orden lógico del ciclo de vida. */
export const ESTADOS_TURNO: readonly EstadoTurno[] = [
  'PENDIENTE',
  'CONFIRMADO',
  'COMPLETADO',
  'CANCELADO',
];

export const ESTADO_ETIQUETA: Record<EstadoTurno, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};
