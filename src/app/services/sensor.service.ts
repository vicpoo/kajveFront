//src/app/services/sensor.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Sensor, CreateSensorRequest, UpdateSensorRequest, LoteActual } from '../interfaces/sensor.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private apiService = inject(ApiService);
  
  // Estado reactivo
  sensores = signal<Sensor[]>([]);
  totalSensores = signal(0);
  isLoading = signal(false);

  /**
   * Carga la lista de sensores
   */
  async loadSensores(estado?: 'activo' | 'inactivo' | 'mantenimiento'): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await lastValueFrom(this.apiService.getSensores(estado));
      if (response) {
        this.sensores.set(response.items);
        this.totalSensores.set(response.total);
      }
    } catch (error) {
      console.error('Error cargando sensores:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Crea un nuevo sensor
   */
  async createSensor(sensorData: CreateSensorRequest): Promise<Sensor> {
    try {
      const sensor = await lastValueFrom(this.apiService.createSensor(sensorData));
      // Actualizar lista local
      const sensores = this.sensores();
      sensores.push(sensor);
      this.sensores.set(sensores);
      this.totalSensores.set(this.totalSensores() + 1);
      return sensor;
    } catch (error) {
      console.error('Error creando sensor:', error);
      throw error;
    }
  }

  /**
   * Obtiene detalle de un sensor
   */
  async getSensorDetail(id: number): Promise<Sensor> {
    try {
      return await lastValueFrom(this.apiService.getSensorDetail(id));
    } catch (error) {
      console.error('Error obteniendo detalle de sensor:', error);
      throw error;
    }
  }

  /**
   * Actualiza un sensor
   */
  async updateSensor(id: number, data: UpdateSensorRequest): Promise<Sensor> {
    try {
      const sensor = await lastValueFrom(this.apiService.updateSensor(id, data));
      // Actualizar lista local
      const sensores = this.sensores();
      const index = sensores.findIndex(s => s.id === id);
      if (index !== -1 && sensor) {
        sensores[index] = sensor;
        this.sensores.set(sensores);
      }
      return sensor;
    } catch (error) {
      console.error('Error actualizando sensor:', error);
      throw error;
    }
  }

  /**
   * Genera código QR para un sensor
   */
  async getSensorQR(id: number): Promise<string> {
    try {
      const response = await lastValueFrom(this.apiService.getSensorQR(id));
      return response?.qr_base64 || '';
    } catch (error) {
      console.error('Error generando QR:', error);
      throw error;
    }
  }

  /**
   * Obtiene el lote en_proceso creado automáticamente (por el trigger de BD)
   * al registrar un sensor.
   */
  async getLoteActual(idSensor: number): Promise<LoteActual> {
    try {
      return await lastValueFrom(this.apiService.getLoteActual(idSensor));
    } catch (error) {
      console.error('Error obteniendo lote actual del sensor:', error);
      throw error;
    }
  }

  /**
   * Descarga la imagen PNG del QR de un lote. Devuelve el blob y el nombre
   * de archivo sugerido por el header Content-Disposition (con fallback
   * al patrón documentado lote_{id}_qr.png si el header no está expuesto
   * por CORS).
   */
  async getLoteQrImagen(idLote: number): Promise<{ blob: Blob; filename: string }> {
    try {
      const response = await lastValueFrom(this.apiService.getLoteQrImagen(idLote));
      const blob = response.body as Blob;
      const filename = this.extraerNombreArchivo(response.headers.get('Content-Disposition'))
        || `lote_${idLote}_qr.png`;
      return { blob, filename };
    } catch (error) {
      console.error('Error obteniendo QR del lote:', error);
      throw error;
    }
  }

  private extraerNombreArchivo(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    return match ? match[1] : null;
  }
}