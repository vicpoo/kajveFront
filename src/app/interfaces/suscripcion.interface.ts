export interface PlanSuscripcion {
  plan: 'basico' | 'profesional' | 'empresarial';
  precio: number;
  moneda: string;
  description: string;
  lotes_max: number;
}

export interface MiSuscripcion {
  id_suscripcion: number;
  plan: 'basico' | 'profesional' | 'empresarial';
  estado: 'activa' | 'inactiva';
  fecha_inicio: string;
  fecha_fin: string;
  lotes_max: number;
}

export interface PagoPreferenciaRequest {
  plan: 'basico' | 'profesional' | 'empresarial';
}

export interface PagoPreferenciaResponse {
  init_point: string;
  preference_id: string;
}

export interface PagoHistorial {
  total: number;
  items: {
    id_pago: number;
    id_suscripcion: number;
    // ... otros campos
  }[];
}