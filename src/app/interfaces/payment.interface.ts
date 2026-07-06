export type EstadoOrden = 'pendiente' | 'pagada' | 'cancelada' | 'reembolsada';

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

export interface OrdenConComprador {
  ID: number;
  IDLote: number;
  IDComprador: number;
  PrecioTotal: number;
  Moneda: string;
  Estado: EstadoOrden;
  StripeCheckoutSessionID: string;
  StripePaymentIntentID: string;
  FechaOrden: string;
  FechaPago: string | null;
  NombreComprador: string;
  EmailComprador: string;
  TelefonoComprador: string;
  PaisComprador: string;
}

export interface ActualizarEstadoRequest {
  estado: EstadoOrden;
}

export interface ListarOrdenesParams {
  estado?: EstadoOrden;
  id_lote?: number;
  limit?: number;
  offset?: number;
}
