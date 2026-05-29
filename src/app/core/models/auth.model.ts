/** Roles de usuario (enum `Rol` del backend). */
export type Rol = 'ADMIN';

/** Credenciales de login (`LoginRequest`). */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Respuesta del login (`LoginResponse`). */
export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnMs: number;
  email: string;
  nombre: string;
  rol: Rol;
}

/** Sesión persistida en localStorage. */
export interface Sesion {
  token: string;
  email: string;
  nombre: string;
  rol: Rol;
  /** Timestamp (epoch ms) en el que expira el token. */
  expiraEn: number;
}
