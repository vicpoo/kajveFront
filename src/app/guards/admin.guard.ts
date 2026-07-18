// guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const ROLES_PERMITIDOS = ['administrador', 'supervisor'];

/**
 * Protege /admin y sus rutas hijas: exige sesión válida (mismo criterio que
 * el interceptor, AuthService.isAuthenticated()) y rol de staff. Si falla,
 * redirige a /login con ?returnUrl= igual que hace el interceptor en un 401.
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rol = authService.getUser()?.rol;

  if (authService.isAuthenticated() && ROLES_PERMITIDOS.includes(rol)) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
