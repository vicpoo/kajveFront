// services/auth.service.ts - Corregido para SSR (Angular 21 / Vercel)
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private accessToken = signal<string | null>(null);
  private refreshToken = signal<string | null>(null);
  private user = signal<any | null>(null);

  constructor() {
    // Solo se accede a localStorage si estamos en el navegador.
    // En SSR/prerender (Node.js) este bloque se omite por completo.
    if (this.isBrowser) {
      const storedAccess = localStorage.getItem('access_token');
      const storedRefresh = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');

      if (storedAccess) this.accessToken.set(storedAccess);
      if (storedRefresh) this.refreshToken.set(storedRefresh);
      if (storedUser) {
        try {
          this.user.set(JSON.parse(storedUser));
        } catch {
          // JSON corrupto en storage: se ignora y se limpia
          localStorage.removeItem('user');
        }
      }
    }
  }

  getToken(): string | null {
    return this.accessToken();
  }

  getRefreshToken(): string | null {
    return this.refreshToken();
  }

  getUser(): any | null {
    return this.user();
  }

  // Alias para getUser
  currentUser(): any | null {
    return this.user();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken();
  }

  isAdmin(): boolean {
    return this.user()?.rol === 'administrador';
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.apiService.login({ email, password }));

      if (response && response.access_token) {
        this.accessToken.set(response.access_token);
        this.refreshToken.set(response.refresh_token);
        this.user.set({
          id: response.id_usuario,
          email: response.email,
          nombre: response.nombre,
          rol: response.rol
        });

        if (this.isBrowser) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          localStorage.setItem('user', JSON.stringify(this.user()));
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    const refresh = this.refreshToken();
    if (!refresh) return false;

    try {
      const response = await firstValueFrom(this.apiService.refreshAccessToken());

      if (response && response.access_token) {
        this.accessToken.set(response.access_token);
        if (this.isBrowser) {
          localStorage.setItem('access_token', response.access_token);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refrescando token:', error);
      this.logout();
      return false;
    }
  }

  logout(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.user.set(null);

    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }

    this.router.navigate(['/login']);
  }
}