export interface DashboardStats {
  total_usuarios: number;
  usuarios_activos: number;
  total_sensores: number;
  sensores_activos: number;
  sensores_mantenimiento: number;
  total_lotes: number;
  lotes_en_proceso: number;
  lotes_finalizados: number;
  total_alertas_hoy: number;
  alertas_criticas_sin_atender: number;
  total_inferencias_ml: number;
  lecturas_ultimas_24h: number;
}

export interface SecadoStats {
  promedio_dias_secado: number;
  calidad_promedio: 'excelente' | 'buena' | 'regular' | 'baja';
  lotes_calidad_excelente: number;
  lotes_calidad_buena: number;
  lotes_calidad_regular: number;
  lotes_calidad_baja: number;
  temperatura_promedio_global: number;
  humedad_promedio_global: number;
}

export interface SensorStatus {
  id_sensor: number;
  mac_address: string;
  modelo: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  ultima_conexion: string;
  lote_asignado: string | null;
}

export interface SensorStatusResponse {
  items: SensorStatus[];
}