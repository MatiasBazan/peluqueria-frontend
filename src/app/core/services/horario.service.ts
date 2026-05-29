import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Horario, HorarioRequest } from '../models';

/** Horarios laborales de los profesionales (admin). */
@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/horarios`;

  listarPorProfesional(profesionalId: number): Observable<Horario[]> {
    const params = new HttpParams().set('profesionalId', profesionalId);
    return this.http.get<Horario[]>(this.baseUrl, { params });
  }

  crear(req: HorarioRequest): Observable<Horario> {
    return this.http.post<Horario>(this.baseUrl, req);
  }

  actualizar(id: number, req: HorarioRequest): Observable<Horario> {
    return this.http.put<Horario>(`${this.baseUrl}/${id}`, req);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
