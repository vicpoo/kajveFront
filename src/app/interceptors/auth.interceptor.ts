// interceptors/auth.interceptor.ts - Corregido
import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject, from } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No agregar token para endpoints públicos
    if (req.url.includes('/auth/login') ||
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/logout') ||
        req.url.includes('/suscripciones/planes') ||
        req.url.includes('/webhooks/') ||
        req.url.includes('/health')) {
      return next.handle(req);
    }

    const token = this.authService.getToken();
    let authReq = req;

    if (token) {
      authReq = this.addTokenToRequest(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/auth/refresh')) {
          if (!token) {
            // Invitado: nunca hubo sesión, no tiene sentido intentar un
            // refresh (no hay refresh_token guardado). Redirige directo.
            this.redirectToLogin('guest');
            return throwError(() => error);
          }
          return this.handle401Error(req, next);
        }

        if (error.status === 0) {
          this.toastr.error('Sin conexión a internet. Verifica tu red e intenta de nuevo.');
        } else if (error.status >= 500 && error.status <= 599) {
          this.toastr.error('Error del servidor. Estamos trabajando en ello, intenta más tarde.');
        }

        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Convertir la Promise a Observable
      return from(this.authService.refreshAccessToken()).pipe(
        switchMap((success) => {
          this.isRefreshing = false;
          if (success) {
            const token = this.authService.getToken();
            if (token) {
              this.refreshTokenSubject.next(token);
              return next.handle(this.addTokenToRequest(request, token));
            }
          }
          this.redirectToLogin('expired');
          return throwError(() => new Error('Sesión expirada'));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.redirectToLogin('expired');
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addTokenToRequest(request, token!));
        })
      );
    }
  }

  /**
   * Limpia la sesión y redirige a /login, distinguiendo el motivo:
   * - 'guest': el usuario nunca inició sesión (no había token).
   * - 'expired': había sesión pero el token venció/es inválido y el
   *   refresh también falló.
   * En ambos casos guarda la ruta actual como ?returnUrl= para que
   * login-page pueda regresar al usuario a donde estaba (solo rol productor).
   */
  private redirectToLogin(reason: 'guest' | 'expired'): void {
    const returnUrl = this.router.url;

    if (reason === 'guest') {
      this.toastr.info('Debes iniciar sesión para continuar.');
    } else {
      this.toastr.warning('Tu sesión ha expirado, inicia sesión de nuevo.');
    }

    // null: solo limpia tokens/estado, la navegación la hacemos aquí con
    // el returnUrl como query param.
    this.authService.logout(null);
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }
}
