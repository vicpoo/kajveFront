//src/app/pages/admin-shell/users-page.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

interface UserRow {
  usuario: string;
  email: string;
  premium: string;
  osiles: string;
}

interface AdminRow {
  id: string;
  nombre: string;
  rol: string;
  email: string;
}

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-page.component.html'
})
export class UsersPageComponent implements OnInit {
  private userService = inject(UserService);
  
  // Usamos signals para los datos
  private usersSignal = signal<UserRow[]>([]);
  private adminsSignal = signal<AdminRow[]>([]);
  
  // Exponemos los valores como computados o directamente con ()
  get users() {
    return this.usersSignal();
  }
  
  get admins() {
    return this.adminsSignal();
  }
  
  isLoading = signal(true);

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.isLoading.set(true);
    try {
      await this.userService.loadAdminUsers();
      
      const userItems = this.userService.users();
      const userRows: UserRow[] = userItems.map(u => ({
        usuario: u.nombre,
        email: u.email,
        premium: u.rol === 'administrador' ? 'Admin' : (u.rol === 'productor' ? 'Productor' : 'Supervisor'),
        osiles: u.total_lotes?.toString() || '0'
      }));
      this.usersSignal.set(userRows);

      const adminRows: AdminRow[] = userItems
        .filter(u => u.rol === 'administrador')
        .map(u => ({
          id: `A-${u.id_usuario.toString().padStart(3, '0')}`,
          nombre: u.nombre,
          rol: u.rol,
          email: u.email
        }));
      this.adminsSignal.set(adminRows);
      
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}