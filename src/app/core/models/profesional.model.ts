import { Servicio } from './servicio.model';

/** Profesional con sus servicios. Espeja `ProfesionalResponse`. */
export interface Profesional {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  foto: string | null;
  activo: boolean;
  servicios: Servicio[];
}

/** Cuerpo para crear/actualizar un profesional (`ProfesionalRequest`). */
export interface ProfesionalRequest {
  nombre: string;
  apellido: string;
  telefono: string | null;
  foto: string | null;
  activo: boolean;
  servicioIds: number[];
}
