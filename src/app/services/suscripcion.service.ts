import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { PlanSuscripcion, MiSuscripcion } from '../interfaces/suscripcion.interface';

@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {
  private apiService = inject(ApiService);
  
  // Estado reactivo
  planes = signal<PlanSuscripcion[]>([]);
  miSuscripcion = signal<MiSuscripcion | null>(null);
  isLoading = signal(false);

  /**
   * Carga los planes de suscripción
   */
  async loadPlanes(): Promise<void> {
    this.isLoading.set(true);
    try {
      const planes = await this.apiService.getPlanes().toPromise();
      if (planes) {
        this.planes.set(planes);
      }
    } catch (error) {
      console.error('Error cargando planes:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Carga la suscripción del usuario
   */
  async loadMiSuscripcion(): Promise<void> {
    this.isLoading.set(true);
    try {
      const suscripcion = await this.apiService.getMiSuscripcion().toPromise();
      if (suscripcion) {
        this.miSuscripcion.set(suscripcion);
      }
    } catch (error) {
      console.error('Error cargando suscripción:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Crea una preferencia de pago
   */
  async crearPreferenciaPago(plan: 'basico' | 'profesional' | 'empresarial'): Promise<string> {
    try {
      const response = await this.apiService.crearPreferenciaPago(plan).toPromise();
      return response?.init_point || '';
    } catch (error) {
      console.error('Error creando preferencia de pago:', error);
      throw error;
    }
  }

  /**
   * Obtiene el número máximo de lotes según la suscripción
   */
  getMaxLotes(): number {
    const suscripcion = this.miSuscripcion();
    if (!suscripcion) return 1; // Plan prueba
    return suscripcion.lotes_max;
  }

  /**
   * Verifica si la suscripción está activa
   */
  isSuscripcionActiva(): boolean {
    const suscripcion = this.miSuscripcion();
    return suscripcion?.estado === 'activa';
  }
}