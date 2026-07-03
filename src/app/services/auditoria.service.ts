import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuditoriaLog } from '../interfaces/auditoria.interface';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private apiService = inject(ApiService);
  
  // Estado reactivo
  logs = signal<AuditoriaLog[]>([]);
  totalLogs = signal(0);
  isLoading = signal(false);

  /**
   * Carga los logs de auditoría
   */
  async loadAuditoria(
    id_usuario?: number,
    accion?: string,
    desde?: string,
    hasta?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.apiService.getAuditoria(
        id_usuario,
        accion,
        desde,
        hasta,
        page,
        limit
      ).toPromise();
      
      if (response) {
        this.logs.set(response.items);
        this.totalLogs.set(response.total);
      }
    } catch (error) {
      console.error('Error cargando auditoría:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }
}