/** Día de la semana, según `java.time.DayOfWeek`. */
export type DiaSemana =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

/** Horario laboral de un profesional. Espeja `HorarioLaboralResponse`. */
export interface Horario {
  id: number;
  profesionalId: number;
  diaSemana: DiaSemana;
  /** Formato "HH:mm". */
  horaInicio: string;
  /** Formato "HH:mm". */
  horaFin: string;
}

/** Cuerpo para crear/actualizar un horario (`HorarioLaboralRequest`). */
export interface HorarioRequest {
  profesionalId: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
}
