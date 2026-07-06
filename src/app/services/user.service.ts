//src/app/services/user.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../interfaces/user.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiService = inject(ApiService);
  
  // Estado reactivo
  users = signal<User[]>([]);
  totalUsers = signal(0);
  isLoading = signal(false);

  /**
   * Carga la lista de usuarios
   */
  async loadUsers(skip: number = 0, limit: number = 10): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await lastValueFrom(this.apiService.getUsers(skip, limit));
      if (response) {
        this.users.set(response.items);
        this.totalUsers.set(response.total);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Carga usuarios para el panel de administración
   */
  async loadAdminUsers(rol?: string, estado?: string, page: number = 1, limit: number = 20): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await lastValueFrom(this.apiService.getAdminUsers(rol, estado, page, limit));
      if (response) {
        this.users.set(response.items);
        this.totalUsers.set(response.total);
      }
    } catch (error) {
      console.error('Error cargando usuarios admin:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      return await lastValueFrom(this.apiService.createUser(userData));
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      return await lastValueFrom(this.apiService.updateUser(id, userData));
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    try {
      return await lastValueFrom(this.apiService.deleteUser(id));
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene detalle de un usuario
   */
  async getUserDetail(id: number): Promise<User> {
    try {
      return await lastValueFrom(this.apiService.getUserDetail(id));
    } catch (error) {
      console.error('Error obteniendo detalle de usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un usuario
   */
  async updateUserState(id: number, estado: 'activo' | 'inactivo'): Promise<User> {
    try {
      const response = await lastValueFrom(this.apiService.updateUserState(id, estado));
      // Actualizar lista local
      const users = this.users();
      const index = users.findIndex(u => u.id_usuario === id);
      if (index !== -1 && response) {
        users[index] = response;
        this.users.set(users);
      }
      return response;
    } catch (error) {
      console.error('Error actualizando estado de usuario:', error);
      throw error;
    }
  }
}