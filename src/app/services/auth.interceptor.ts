//src/app/services/auth.interceptor.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { RefreshResponse } from '../interfaces/auth.interface';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private apiService = inject(ApiService);
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Si la petición es para auth/refresh, no interceptar
    if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
      return next.handle(req);
    }

    const token = this.apiService.getToken();

    // Si hay token, clonar la petición con el header de autorización
    let authReq = req;
    if (token) {
      authReq = this.cloneWithToken(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private cloneWithToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.apiService.refreshAccessToken().pipe(
        switchMap((response: RefreshResponse) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.access_token);
          const newRequest = this.cloneWithToken(request, response.access_token);
          return next.handle(newRequest);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          // Si falla el refresh, hacer logout
          this.apiService.clearTokens();
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => {
          const newRequest = this.cloneWithToken(request, token!);
          return next.handle(newRequest);
        })
      );
    }
  }
}