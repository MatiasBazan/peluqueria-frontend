import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Profesional, ProfesionalRequest } from '../models';

/** Operaciones sobre los profesionales de la peluquería. */
@Injectable({ providedIn: 'root' })
export class ProfesionalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/profesionales`;

  /** Profesionales activos con sus servicios (endpoint público). */
  listarPublicos(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(`${this.baseUrl}/publicos`);
  }

  /** Todos los profesionales, incluyendo inactivos (admin). */
  listarTodos(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.baseUrl);
  }

  crear(req: ProfesionalRequest): Observable<Profesional> {
    return this.http.post<Profesional>(this.baseUrl, req);
  }

  actualizar(id: number, req: ProfesionalRequest): Observable<Profesional> {
    return this.http.put<Profesional>(`${this.baseUrl}/${id}`, req);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
