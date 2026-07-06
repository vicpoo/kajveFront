import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { LoginRequest } from '../interfaces/auth.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  private getStorage(): Storage | null {
    return typeof window !== 'undefined' ? window.localStorage : null;
  }

  // Estado reactivo
  isAuthenticated = signal(this.apiService.isAuthenticated());
  currentUser = signal<any>(null);

  constructor() {
    // Inicializar estado desde el token
    this.isAuthenticated.set(this.apiService.isAuthenticated());
    
    // Si hay token, intentar obtener info del usuario
    if (this.isAuthenticated()) {
      const storage = this.getStorage();
      const userStr = storage?.getItem('user_data');
      if (userStr) {
        try {
          this.currentUser.set(JSON.parse(userStr));
        } catch {
          // ignore
        }
      }
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      const credentials: LoginRequest = { email, password };
      const response = await lastValueFrom(this.apiService.login(credentials));
      
      if (response) {
        // Guardar datos del usuario
        const userData = {
          id_usuario: response.id_usuario,
          email: response.email,
          nombre: response.nombre,
          rol: response.rol
        };
        const storage = this.getStorage();
        if (storage) {
          storage.setItem('user_data', JSON.stringify(userData));
        }
        this.currentUser.set(userData);
        this.isAuthenticated.set(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cierra sesión
   */
  async logout(): Promise<void> {
    try {
      await lastValueFrom(this.apiService.logout());
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.apiService.clearTokens();
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem('user_data');
      }
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      this.router.navigate(['/login']);
    }
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await lastValueFrom(this.apiService.refreshAccessToken());
      return !!response;
    } catch (error) {
      console.error('Error refrescando token:', error);
      await this.logout();
      return false;
    }
  }

  /**
   * Verifica si el usuario tiene rol de administrador
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.rol === 'administrador';
  }

  /**
   * Verifica si el usuario tiene rol de supervisor
   */
  isSupervisor(): boolean {
    const user = this.currentUser();
    return user?.rol === 'supervisor';
  }

  /**
   * Verifica si el usuario tiene rol de productor
   */
  isProductor(): boolean {
    const user = this.currentUser();
    return user?.rol === 'productor';
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getRol(): string | null {
    const user = this.currentUser();
    return user?.rol || null;
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getUserId(): number | null {
    const user = this.currentUser();
    return user?.id_usuario || null;
  }
}