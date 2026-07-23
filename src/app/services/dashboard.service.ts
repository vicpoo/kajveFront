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
   * Carga todos los datos del dashboard en paralelo.
   *
   * Usa Promise.allSettled en vez de Promise.all: antes, si UN solo
   * endpoint fallaba (ej. /estadisticas/secado con 500), Promise.all
   * rechazaba de inmediato y se perdían también los resultados de los
   * otros 3 endpoints aunque hubieran respondido bien — el dashboard se
   * quedaba completamente sin datos por un solo fallo aislado. Con
   * allSettled, cada endpoint que sí responde se pinta normal y solo el
   * que falla se queda en null (silencioso, no rompe la vista).
   */
  async loadAllDashboardData(): Promise<{
    dashboard: DashboardStats | null;
    secado: SecadoStats | null;
    sensores: SensorStatusResponse | null;
    usuarios: UsuariosEstadisticas | null;
  }> {
    this.isLoading.set(true);
    try {
      const [dashboardR, secadoR, sensoresR, usuariosR] = await Promise.allSettled([
        lastValueFrom(this.apiService.getDashboardStats()),
        lastValueFrom(this.apiService.getSecadoStats()),
        lastValueFrom(this.apiService.getSensoresStatus()),
        lastValueFrom(this.apiService.getUsuariosEstadisticas(30))
      ]);

      const dashboard = dashboardR.status === 'fulfilled' ? (dashboardR.value ?? null) : null;
      const secado = secadoR.status === 'fulfilled' ? (secadoR.value ?? null) : null;
      const sensores = sensoresR.status === 'fulfilled' ? (sensoresR.value ?? null) : null;
      const usuarios = usuariosR.status === 'fulfilled' ? (usuariosR.value ?? null) : null;

      if (dashboardR.status === 'rejected') console.error('Error cargando /admin/dashboard:', dashboardR.reason);
      if (secadoR.status === 'rejected') console.error('Error cargando /admin/estadisticas/secado:', secadoR.reason);
      if (sensoresR.status === 'rejected') console.error('Error cargando /admin/estadisticas/sensores:', sensoresR.reason);
      if (usuariosR.status === 'rejected') console.error('Error cargando /admin/estadisticas/usuarios:', usuariosR.reason);

      this.dashboardStats.set(dashboard);
      this.secadoStats.set(secado);
      this.sensorStatus.set(sensores);
      this.usuariosEstadisticas.set(usuarios);

      return { dashboard, secado, sensores, usuarios };
    } finally {
      this.isLoading.set(false);
    }
  }
}