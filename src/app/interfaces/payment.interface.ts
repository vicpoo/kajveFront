// payment.interface.ts - Añadir EstadoOrden
export interface CrearOrdenRequest {
  id_lote: number;
  nombre_comprador: string;
  email_comprador: string;
  telefono_comprador?: string;
  pais?: string;
}

export interface CrearOrdenResponse {
  id_orden: number;
  checkout_url: string;
}

export interface ListarOrdenesParams {
  estado?: string;
  id_lote?: number;
  limit?: number;
  offset?: number;
}

export interface ActualizarEstadoRequest {
  estado: 'pendiente' | 'pagada' | 'cancelada' | 'reembolsada';
}

// Exportar el tipo para usarlo en el componente
export type EstadoOrden = 'pendiente' | 'pagada' | 'cancelada' | 'reembolsada';

export interface OrdenConComprador {
  id: number;
  id_lote: number;
  id_comprador: number;
  precio_total: number;
  moneda: string;
  estado: 'pendiente' | 'pagada' | 'cancelada' | 'reembolsada';
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string;
  fecha_orden: string;
  fecha_pago: string | null;
  nombre_comprador: string;
  email_comprador: string;
  telefono_comprador: string;
  pais_comprador: string;
}