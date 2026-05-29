import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
    title: 'Lumière · Estudio de Peluquería',
  },
  {
    path: 'reservar',
    loadComponent: () => import('./features/reservar/reservar').then((m) => m.Reservar),
    title: 'Reservar turno · Lumière',
  },
  {
    path: 'mis-turnos',
    loadComponent: () => import('./features/mis-turnos/mis-turnos').then((m) => m.MisTurnos),
    title: 'Mis turnos · Lumière',
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login').then((m) => m.AdminLogin),
    title: 'Acceso administración · Lumière',
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      {
        path: 'agenda',
        loadComponent: () => import('./features/admin/agenda/agenda').then((m) => m.Agenda),
        title: 'Agenda · Administración',
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./features/admin/servicios-admin/servicios-admin').then((m) => m.ServiciosAdmin),
        title: 'Servicios · Administración',
      },
      {
        path: 'profesionales',
        loadComponent: () =>
          import('./features/admin/profesionales-admin/profesionales-admin').then(
            (m) => m.ProfesionalesAdmin,
          ),
        title: 'Profesionales · Administración',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
