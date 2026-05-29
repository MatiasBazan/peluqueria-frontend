import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Servicio, ServicioRequest } from '../models';

/** Operaciones sobre el catálogo de servicios. */
@Injectable({ providedIn: 'root' })
export class ServicioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/servicios`;

  /** Servicios activos (endpoint público). */
  listarPublicos(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.baseUrl}/publicos`);
  }

  /** Todos los servicios, incluyendo inactivos (admin). */
  listarTodos(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.baseUrl);
  }

  crear(req: ServicioRequest): Observable<Servicio> {
    return this.http.post<Servicio>(this.baseUrl, req);
  }

  actualizar(id: number, req: ServicioRequest): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.baseUrl}/${id}`, req);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
