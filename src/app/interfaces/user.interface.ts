export interface User {
  id_usuario: number;
  email: string;
  nombre: string;
  rol: 'administrador' | 'supervisor' | 'productor';
  estado: 'activo' | 'inactivo';
  telefono: string | null;
  fecha_registro: string;
  total_lotes?: number;
  lotes_activos?: number;
  ultimo_login?: string | null;
}

export interface CreateUserRequest {
  email: string;
  nombre: string;
  rol: 'administrador' | 'supervisor' | 'productor';
  password: string;
  telefono?: string;
}

export interface UpdateUserRequest {
  email?: string;
  nombre?: string;
  rol?: 'administrador' | 'supervisor' | 'productor';
  password?: string;
  telefono?: string;
}

export interface UpdateUserStateRequest {
  estado: 'activo' | 'inactivo';
}

export interface UsersListResponse {
  total: number;
  skip: number;
  limit: number;
  items: User[];
}

export interface AdminUsersListResponse {
  total: number;
  page: number;
  limit: number;
  items: User[];
}