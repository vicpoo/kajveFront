// payment.interface.ts - CORREGIDO para coincidir con la API
export interface CrearOrdenRequest {
  id_producto: number;
  nombre_comprador: string;
  email_comprador: string;
  telefono_comprador?: string;
  pais?: string;
  id_usuario?: number | null;
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

export type EstadoOrden = 'pendiente' | 'pagada' | 'cancelada' | 'reembolsada';

// ¡IMPORTANTE! Esta interfaz debe coincidir EXACTAMENTE con lo que devuelve tu API
export interface OrdenConComprador {
  ID: number;                    // Mayúscula como viene de la API
  IDProducto: number;            // Mayúscula
  TipoOrden: string;             // Mayúscula
  IDLote?: number | null;        // Mayúscula
  IDComprador: number;           // Mayúscula
  IDUsuario?: number | null;     // Mayúscula
  PrecioTotal: number;           // Mayúscula
  Moneda: string;                // Mayúscula
  Estado: EstadoOrden;           // Mayúscula
  StripeCheckoutSessionID: string; // Mayúscula
  StripePaymentIntentID: string;   // Mayúscula
  FechaOrden: string;            // Mayúscula
  FechaPago: string | null;      // Mayúscula
  NombreComprador: string;       // Mayúscula
  EmailComprador: string;        // Mayúscula
  TelefonoComprador: string;     // Mayúscula
  PaisComprador: string;         // Mayúscula
  NombreProducto: string;        // Mayúscula - Nuevo campo
}

export interface ActualizarEstadoRequest {
  estado: EstadoOrden;
}