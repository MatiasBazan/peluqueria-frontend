import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Sesion } from '../models';

/**
 * Maneja la autenticación del panel admin: login contra el backend,
 * persistencia del JWT en localStorage y control de expiración.
 * El estado de sesión se expone como signals (compatible con zoneless).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/auth`;
  private readonly storageKey = 'lumiere.sesion';

  private readonly _sesion = signal<Sesion | null>(this.leerSesion());

  /** Sesión actual (o null si no hay / expiró). */
  readonly sesion = this._sesion.asReadonly();

  /** True si hay una sesión válida y no expirada. */
  readonly estaAutenticado = computed(() => {
    const s = this._sesion();
    return s !== null && s.expiraEn > Date.now();
  });

  /** Nombre del administrador logueado, para mostrar en la UI. */
  readonly nombreAdmin = computed(() => this._sesion()?.nombre ?? '');

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, req)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this._sesion.set(null);
  }

  /** Token vigente o null. Limpia la sesión si ya expiró. */
  get token(): string | null {
    const s = this._sesion();
    if (s === null) {
      return null;
    }
    if (s.expiraEn <= Date.now()) {
      this.logout();
      return null;
    }
    return s.token;
  }

  private guardarSesion(res: LoginResponse): void {
    const sesion: Sesion = {
      token: res.token,
      email: res.email,
      nombre: res.nombre,
      rol: res.rol,
      expiraEn: Date.now() + res.expiraEnMs,
    };
    localStorage.setItem(this.storageKey, JSON.stringify(sesion));
    this._sesion.set(sesion);
  }

  private leerSesion(): Sesion | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return null;
      }
      const sesion = JSON.parse(raw) as Sesion;
      if (!sesion?.token || sesion.expiraEn <= Date.now()) {
        localStorage.removeItem(this.storageKey);
        return null;
      }
      return sesion;
    } catch {
      return null;
    }
  }
}
