# Lumière · Frontend

Frontend del sistema de reserva de turnos para **Lumière**, un estudio de peluquería con
varios profesionales. Construido con **Angular 21** (standalone, zoneless, signals) y
**Angular Material**. Consume una API REST en **Spring Boot**.

> Proyecto de portfolio. La estética busca transmitir una peluquería de alta gama: tonos
> neutros, acento dorado, tipografías Playfair Display + Inter y mucho aire.

## ✨ Funcionalidades

- **Landing pública** con servicios y profesionales traídos en vivo del backend, scroll suave
  entre secciones y diseño responsive mobile-first.
- **Wizard de reserva** (`/reservar`) en 4 pasos con el stepper de Material: servicio →
  profesional → fecha y horario disponible → datos del cliente, con pantalla de éxito y código
  de cancelación.
- **Mis turnos** (`/mis-turnos`): el cliente consulta sus turnos futuros por teléfono y puede
  cancelarlos con su código.
- **Panel de administración** (`/admin`, protegido por JWT):
  - Agenda de turnos con filtros (profesional, fecha, estado) y cambio de estado.
  - ABM de servicios.
  - ABM de profesionales y gestión de sus horarios laborales.

## 🧱 Stack y decisiones

- **Angular 21** standalone components, **zoneless** (sin `zone.js`): el estado reactivo se
  maneja con **signals**.
- **Angular Material** (Material 3) como librería de componentes.
- **CSS custom con variables** para el design system (sin Tailwind). Ver `src/styles.css`.
- **Router con lazy loading** por feature.
- **HttpClient** con **interceptores funcionales**: uno adjunta el JWT, otro centraliza el
  manejo de errores (muestra el mensaje del backend en un snackbar y desloguea ante un 401).
- **Reactive Forms** y **TypeScript estricto**.
- Arquitectura: `core/` (modelos, servicios, interceptores, guard), `shared/` (componentes y
  utilidades reutilizables) y `features/` (landing, reservar, mis-turnos, admin).

## ✅ Requisitos

- **Node.js** 20+.
- **pnpm** 9+ (gestor de dependencias del proyecto). Instalalo con `npm i -g pnpm` si no lo
  tenés.
- El **backend Spring Boot corriendo** (por defecto en `http://localhost:8080`). Sin el backend
  la app levanta, pero los listados aparecerán vacíos y mostrará un aviso de conexión.

## 🚀 Cómo correr

```bash
# 1. Instalar dependencias (siempre con pnpm)
pnpm install

# 2. Levantar el servidor de desarrollo
pnpm start        # equivale a: ng serve
```

La app queda disponible en **http://localhost:4200**. El backend ya habilita CORS para ese
origen.

### Credenciales de demo (panel admin)

El backend incluye un usuario administrador de ejemplo:

```
Email:    admin@peluqueria.com
Password: admin1234
```

Ingresá desde **http://localhost:4200/admin/login** (o el enlace "Administración" del footer).

## ⚙️ Configurar la URL del backend (`apiUrl`)

La URL de la API se define en los archivos de entorno:

- `src/environments/environment.development.ts` → usado por `ng serve`.
- `src/environments/environment.ts` → usado en el build de producción.

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080', // ← cambiá esto para apuntar a otro backend
};
```

## 📦 Build

```bash
pnpm build        # ng build (configuración de producción)
```

El resultado queda en `dist/`.

## 🗂️ Estructura

```
src/
├── environments/            # apiUrl por entorno
├── material-theme.scss      # tema base de Angular Material
├── styles.css               # design system (variables, reset, overrides de Material)
└── app/
    ├── core/
    │   ├── models/          # interfaces que espejan los DTOs del backend
    │   ├── services/        # un servicio HTTP por feature + auth + notificaciones
    │   ├── interceptors/    # auth (JWT) y manejo de errores
    │   └── guards/          # authGuard funcional
    ├── shared/              # header, footer, chip de estado, diálogos, utilidades
    └── features/
        ├── landing/
        ├── reservar/
        ├── mis-turnos/
        └── admin/           # login, layout, agenda, servicios, profesionales
```

## 🖼️ Imágenes

Las fotos del hero y de los profesionales sin imagen propia usan **placeholders de
picsum.photos** (fáciles de reemplazar). Las fotos reales de profesionales se cargan desde el
campo `foto` que devuelve el backend.

## 🧪 Tests

```bash
pnpm test         # ng test (Vitest)
```
