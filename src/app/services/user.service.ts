// services/user.service.ts
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

  /**
   * Actualiza un usuario
   */
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await lastValueFrom(this.apiService.updateUser(id, userData));
      // Actualizar lista local
      const users = this.users();
      const index = users.findIndex(u => u.id_usuario === id);
      if (index !== -1 && response) {
        users[index] = response;
        this.users.set(users);
      }
      return response;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  /**
   * Elimina un usuario de forma permanente (borrado físico en BD)
   */
  async deleteUser(id: number): Promise<{ message: string; id_usuario: number }> {
    try {
      const response = await lastValueFrom(this.apiService.deleteUser(id));
      // Quitarlo de la lista local: ya no existe en BD, no solo se desactivó
      const users = this.users().filter(u => u.id_usuario !== id);
      this.users.set(users);
      this.totalUsers.set(users.length);
      return response;
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
  async updateUserState(id: number, estado: 'activo' | 'inactivo'): Promise<User | null> {
    try {
      const response = await lastValueFrom(this.apiService.updateUserState(id, estado));
      // Obtener el usuario actualizado
      const updatedUser = await this.getUserDetail(id);
      // Actualizar lista local
      const users = this.users();
      const index = users.findIndex(u => u.id_usuario === id);
      if (index !== -1 && updatedUser) {
        users[index] = updatedUser;
        this.users.set(users);
      }
      return updatedUser;
    } catch (error) {
      console.error('Error actualizando estado de usuario:', error);
      throw error;
    }
  }
}