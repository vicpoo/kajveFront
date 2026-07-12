//app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio',
    loadComponent: () => import('./pages/landing-page/landing-page.component').then((m) => m.LandingPageComponent)
  },
  {
    path: 'order',
    title: 'Pedir Osil',
    loadComponent: () => import('./pages/order-page/order-page.component').then((m) => m.OrderPageComponent)
  },
  {
    path: 'premium',
    title: 'Premium',
    loadComponent: () => import('./pages/premium-page/premium-page.component').then((m) => m.PremiumPageComponent)
  },
  {
    path: 'login',
    title: 'Iniciar sesión',
    loadComponent: () => import('./pages/login-page/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'orden/exito',
    title: 'Pago exitoso',
    loadComponent: () => import('./pages/order-success-page/order-success-page.component').then((m) => m.OrderSuccessPageComponent)
  },
  {
    path: 'orden/cancelada',
    title: 'Pago cancelado',
    loadComponent: () => import('./pages/order-cancel-page/order-cancel-page.component').then((m) => m.OrderCancelPageComponent)
  },
  {
    path: 'admin',
    title: 'Admin',
    loadComponent: () => import('./pages/admin-shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin-shell/dashboard-page.component').then((m) => m.DashboardPageComponent)
      },
      {
        path: 'osiles',
        loadComponent: () => import('./pages/admin-shell/osiles-page.component').then((m) => m.OsilesPageComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/admin-shell/users-page.component').then((m) => m.UsersPageComponent)
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./pages/admin-shell/stats-page.component').then((m) => m.StatsPageComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];