import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { DashboardStats, SecadoStats, SensorStatusResponse } from '../interfaces/dashboard.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiService = inject(ApiService);
  
  // Estado reactivo
  dashboardStats = signal<DashboardStats | null>(null);
  secadoStats = signal<SecadoStats | null>(null);
  sensorStatus = signal<SensorStatusResponse | null>(null);
  isLoading = signal(false);

  /**
   * Carga las estadísticas del dashboard
   */
  async loadDashboardStats(): Promise<void> {
    this.isLoading.set(true);
    try {
      const stats = await lastValueFrom(this.apiService.getDashboardStats());
      if (stats) {
        this.dashboardStats.set(stats);
      }
    } catch (error) {
      console.error('Error cargando estadísticas del dashboard:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Carga las estadísticas de secado
   */
  async loadSecadoStats(periodo: '7d' | '30d' | '90d' = '7d'): Promise<void> {
    this.isLoading.set(true);
    try {
      const stats = await lastValueFrom(this.apiService.getSecadoStats(periodo));
      if (stats) {
        this.secadoStats.set(stats);
      }
    } catch (error) {
      console.error('Error cargando estadísticas de secado:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Carga el estado de los sensores
   */
  async loadSensorStatus(): Promise<void> {
    this.isLoading.set(true);
    try {
      const status = await lastValueFrom(this.apiService.getSensoresStatus());
      if (status) {
        this.sensorStatus.set(status);
      }
    } catch (error) {
      console.error('Error cargando estado de sensores:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Carga todos los datos del dashboard en paralelo
   */
  async loadAllDashboardData(): Promise<{
    dashboard: DashboardStats | null;
    secado: SecadoStats | null;
    sensores: SensorStatusResponse | null;
  }> {
    this.isLoading.set(true);
    try {
      const [dashboard, secado, sensores] = await Promise.all([
        lastValueFrom(this.apiService.getDashboardStats()),
        lastValueFrom(this.apiService.getSecadoStats()),
        lastValueFrom(this.apiService.getSensoresStatus())
      ]);
      
      this.dashboardStats.set(dashboard || null);
      this.secadoStats.set(secado || null);
      this.sensorStatus.set(sensores || null);
      
      return {
        dashboard: dashboard || null,
        secado: secado || null,
        sensores: sensores || null
      };
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }
}