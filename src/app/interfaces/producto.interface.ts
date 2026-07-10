//src/app/interfaces/producto.interface.ts
export interface Producto {
  id_producto: number;
  tipo_producto: 'cama_cafe' | 'suscripcion';
  nombre: string;
  descripcion: string;
  precio: number;
  moneda: string;
  imagen_url: string;
  activo: boolean;
  id_lote?: number | null;
  variedad: string;
  peso_kg: number;
  stock: number;
  plan_suscripcion: string;
  duracion_dias: number;
  lotes_max: number;
  created_at: string;
  updated_at: string;
}

export interface CrearProductoRequest {
  tipo_producto: 'cama_cafe' | 'suscripcion';
  nombre: string;
  descripcion: string;
  precio: number;
  moneda?: string;
  imagen_url?: string;
  activo?: boolean;
  id_lote?: number | null;
  variedad?: string;
  peso_kg?: number;
  stock?: number;
  plan_suscripcion?: string;
  duracion_dias?: number;
  lotes_max?: number;
}

export interface ActualizarProductoRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  moneda: string;
  imagen_url: string;
  activo: boolean;
  variedad: string;
  peso_kg: number;
  stock: number;
  plan_suscripcion: string;
  duracion_dias: number;
  lotes_max: number;
}

export interface FiltroCatalogo {
  tipo_producto?: string;
  solo_activos?: boolean;
  limit?: number;
  offset?: number;
}