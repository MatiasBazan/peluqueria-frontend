import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CrearTurnoRequest,
  Disponibilidad,
  EstadoTurno,
  FiltroTurnos,
  Turno,
} from '../models';

/** Reserva, consulta y gestión de turnos. */
@Injectable({ providedIn: 'root' })
export class TurnoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/turnos`;

  /** Slots disponibles para un profesional + servicio en una fecha (público). */
  disponibilidad(
    profesionalId: number,
    servicioId: number,
    fecha: string,
  ): Observable<Disponibilidad> {
    const params = new HttpParams()
      .set('profesionalId', profesionalId)
      .set('servicioId', servicioId)
      .set('fecha', fecha);
    return this.http.get<Disponibilidad>(`${this.baseUrl}/disponibilidad`, { params });
  }

  /** Reserva un turno (público). La respuesta incluye el código de cancelación. */
  crear(req: CrearTurnoRequest): Observable<Turno> {
    return this.http.post<Turno>(this.baseUrl, req);
  }

  /** Turnos futuros de un cliente identificado por teléfono (público). */
  turnosCliente(telefono: string): Observable<Turno[]> {
    const params = new HttpParams().set('telefono', telefono);
    return this.http.get<Turno[]>(`${this.baseUrl}/cliente`, { params });
  }

  /** Cancela un turno usando el código enviado al cliente (público). */
  cancelar(id: number, codigo: string): Observable<Turno> {
    const params = new HttpParams().set('codigo', codigo);
    return this.http.patch<Turno>(`${this.baseUrl}/${id}/cancelar`, null, { params });
  }

  /** Lista turnos con filtros opcionales (admin). */
  listarAdmin(filtro: FiltroTurnos = {}): Observable<Turno[]> {
    let params = new HttpParams();
    if (filtro.profesionalId != null) {
      params = params.set('profesionalId', filtro.profesionalId);
    }
    if (filtro.fecha) {
      params = params.set('fecha', filtro.fecha);
    }
    if (filtro.estado) {
      params = params.set('estado', filtro.estado);
    }
    return this.http.get<Turno[]>(this.baseUrl, { params });
  }

  /** Cambia el estado de un turno (admin). */
  cambiarEstado(id: number, estado: EstadoTurno): Observable<Turno> {
    return this.http.patch<Turno>(`${this.baseUrl}/${id}/estado`, { estado });
  }
}
