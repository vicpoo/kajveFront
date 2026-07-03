//src/app/services/reporte.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Reporte, GenerarReporteRequest } from '../interfaces/reporte.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiService = inject(ApiService);
  
  // Estado reactivo
  reportes = signal<Reporte[]>([]);
  totalReportes = signal(0);
  isLoading = signal(false);

  /**
   * Carga la lista de reportes
   */
  async loadReportes(formato?: 'pdf' | 'excel', page: number = 1, limit: number = 20): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await lastValueFrom(this.apiService.getReportes(formato, page, limit));
      if (response) {
        this.reportes.set(response.items);
        this.totalReportes.set(response.total);
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Genera un nuevo reporte
   */
  async generarReporte(data: GenerarReporteRequest): Promise<Reporte> {
    try {
      const reporte = await lastValueFrom(this.apiService.generarReporte(data));
      // Actualizar lista local
      const reportes = this.reportes();
      if (reporte) {
        reportes.unshift(reporte);
        this.reportes.set(reportes);
        this.totalReportes.set(this.totalReportes() + 1);
      }
      return reporte;
    } catch (error) {
      console.error('Error generando reporte:', error);
      throw error;
    }
  }

  /**
   * Descarga un reporte
   */
  async descargarReporte(id: number): Promise<Blob> {
    try {
      return await lastValueFrom(this.apiService.descargarReporte(id));
    } catch (error) {
      console.error('Error descargando reporte:', error);
      throw error;
    }
  }

  /**
   * Descarga y guarda un reporte
   */
  async descargarYGuardarReporte(id: number, nombreArchivo: string): Promise<void> {
    try {
      const blob = await this.descargarReporte(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando y guardando reporte:', error);
      throw error;
    }
  }
}