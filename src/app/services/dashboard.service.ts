import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { DashboardStats, SecadoStats, SensorStatusResponse, UsuariosEstadisticas } from '../interfaces/dashboard.interface';
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
  usuariosEstadisticas = signal<UsuariosEstadisticas | null>(null);
  isLoading = signal(false);

  /**
   * Carga la serie de tiempo de usuarios registrados y el desglose premium vs normal
   */
  async loadUsuariosEstadisticas(dias: number = 30): Promise<UsuariosEstadisticas | null> {
    try {
      const data = await lastValueFrom(this.apiService.getUsuariosEstadisticas(dias));
      this.usuariosEstadisticas.set(data || null);
      return data || null;
    } catch (error) {
      console.error('Error cargando estadísticas de usuarios:', error);
      throw error;
    }
  }

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
    usuarios: UsuariosEstadisticas | null;
  }> {
    this.isLoading.set(true);
    try {
      const [dashboard, secado, sensores, usuarios] = await Promise.all([
        lastValueFrom(this.apiService.getDashboardStats()),
        lastValueFrom(this.apiService.getSecadoStats()),
        lastValueFrom(this.apiService.getSensoresStatus()),
        lastValueFrom(this.apiService.getUsuariosEstadisticas(30))
      ]);

      this.dashboardStats.set(dashboard || null);
      this.secadoStats.set(secado || null);
      this.sensorStatus.set(sensores || null);
      this.usuariosEstadisticas.set(usuarios || null);

      return {
        dashboard: dashboard || null,
        secado: secado || null,
        sensores: sensores || null,
        usuarios: usuarios || null
      };
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }
}