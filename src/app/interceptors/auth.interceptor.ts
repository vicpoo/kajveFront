// interceptors/auth.interceptor.ts - Corregido
import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, from } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
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
          return this.handle401Error(req, next);
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
          this.authService.logout();
          return throwError(() => new Error('Sesión expirada'));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
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
}