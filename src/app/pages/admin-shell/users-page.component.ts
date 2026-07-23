// users-page.component.ts
import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../interfaces/user.interface';

interface UserRow {
  id: number;
  usuario: string;
  email: string;
  premium: string;
  osiles: string;
  estado: string;
}

interface AdminRow {
  id: string;
  nombre: string;
  rol: string;
  email: string;
  estado: string;
}

interface UserFormState {
  nombre: string;
  email: string;
  rol: 'administrador' | 'supervisor' | 'productor';
  password: string;
  telefono: string;
}

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-page.component.html'
})
export class UsersPageComponent implements OnInit {
  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private usersSignal = signal<UserRow[]>([]);
  private adminsSignal = signal<AdminRow[]>([]);
  private usersDataSignal = signal<User[]>([]);

  get users() {
    return this.usersSignal();
  }

  get admins() {
    return this.adminsSignal();
  }

  isLoading = signal(true);
  editingUserId: number | null = null;
  userForm: UserFormState = {
    nombre: '',
    email: '',
    rol: 'productor',
    password: '',
    telefono: ''
  };

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.isLoading.set(true);
    try {
      await this.userService.loadAdminUsers();

      const userItems = this.userService.users();
      this.usersDataSignal.set(userItems);

      const userRows: UserRow[] = userItems.map((u) => ({
        id: u.id_usuario,
        usuario: u.nombre,
        email: u.email,
        premium: u.rol === 'administrador' ? 'Admin' : u.rol === 'productor' ? 'Productor' : 'Supervisor',
        osiles: u.total_lotes?.toString() || '0',
        estado: u.estado
      }));
      this.usersSignal.set(userRows);

      const adminRows: AdminRow[] = userItems
        .filter((u) => u.rol === 'administrador')
        .map((u) => ({
          id: `A-${u.id_usuario.toString().padStart(3, '0')}`,
          nombre: u.nombre,
          rol: u.rol,
          email: u.email,
          estado: u.estado
        }));
      this.adminsSignal.set(adminRows);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      this.toastr.error('No se pudieron cargar los usuarios.');
    } finally {
      this.isLoading.set(false);
    }
  }

  resetForm() {
    this.editingUserId = null;
    this.userForm = {
      nombre: '',
      email: '',
      rol: 'productor',
      password: '',
      telefono: ''
    };
  }

  iniciarCreacion() {
    this.resetForm();
  }

  editarUsuario(userId: number) {
    const selectedUser = this.usersDataSignal().find((u) => u.id_usuario === userId);
    if (!selectedUser) {
      this.toastr.error('Usuario no encontrado');
      return;
    }

    this.editingUserId = selectedUser.id_usuario;
    this.userForm = {
      nombre: selectedUser.nombre,
      email: selectedUser.email,
      rol: selectedUser.rol,
      password: '',
      telefono: selectedUser.telefono || ''
    };
  }

  async guardarUsuario() {
    if (!this.userForm.nombre.trim() || !this.userForm.email.trim()) {
      this.toastr.error('Completa nombre y correo del usuario.');
      return;
    }

    if (!this.editingUserId && !this.userForm.password.trim()) {
      this.toastr.error('La contraseña es obligatoria para crear un usuario.');
      return;
    }

    try {
      const payload: CreateUserRequest | UpdateUserRequest = {
        nombre: this.userForm.nombre.trim(),
        email: this.userForm.email.trim(),
        rol: this.userForm.rol,
        telefono: this.userForm.telefono.trim() || undefined,
        ...(this.editingUserId ? {} : { password: this.userForm.password.trim() })
      };

      if (this.editingUserId) {
        await this.userService.updateUser(this.editingUserId, payload as UpdateUserRequest);
        this.toastr.success('Usuario actualizado correctamente.');
      } else {
        await this.userService.createUser(payload as CreateUserRequest);
        this.toastr.success('Usuario creado correctamente.');
      }

      await this.loadUsers();
      this.resetForm();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      this.toastr.error('No se pudo guardar el usuario.');
    }
  }

  async eliminarUsuario(userId: number) {
    // window no existe en el servidor durante SSR/prerender
    if (!this.isBrowser) return;

    const confirmed = window.confirm('⚠️ Esto eliminará al usuario de forma PERMANENTE (no solo lo desactiva). Esta acción no se puede deshacer. ¿Continuar?');
    if (!confirmed) {
      return;
    }

    try {
      await this.userService.deleteUser(userId);
      this.toastr.success('Usuario eliminado correctamente.');
      await this.loadUsers();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      this.toastr.error('No se pudo eliminar el usuario.');
    }
  }

  async cambiarEstado(userId: number, estado: 'activo' | 'inactivo') {
    try {
      await this.userService.updateUserState(userId, estado);
      this.toastr.success(`Usuario ${estado === 'activo' ? 'activado' : 'desactivado'}.`);
      await this.loadUsers();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      this.toastr.error('No se pudo actualizar el estado del usuario.');
    }
  }
}