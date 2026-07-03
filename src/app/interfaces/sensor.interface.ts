export interface Sensor {
  id: number;
  mac_address: string;
  tipo: 'ambos' | 'temperatura' | 'humedad';
  modelo: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  id_cola_mqtt: string;
  provisioning_token: string;
  token_usado: boolean;
  lote_nombre: string | null;
  created_at: string;
  historial_lotes?: {
    id_lote: number;
    nombre: string;
    estado: string;
  }[];
}

export interface CreateSensorRequest {
  mac_address: string;
  tipo: 'ambos' | 'temperatura' | 'humedad';
  modelo: string;
}

export interface UpdateSensorRequest {
  estado?: 'activo' | 'inactivo' | 'mantenimiento';
  modelo?: string;
}

export interface SensorsListResponse {
  total: number;
  items: Sensor[];
}

export interface QRResponse {
  qr_base64: string;
}