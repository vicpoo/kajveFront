//src/app/services/sensor.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Sensor, CreateSensorRequest, UpdateSensorRequest } from '../interfaces/sensor.interface';
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
}