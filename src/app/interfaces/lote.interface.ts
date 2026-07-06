export interface LoteVenta {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
}

export interface CrearLoteRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
}
