export interface AuditoriaLog {
  id_log: number;
  id_usuario: number;
  accion: string;
  entidad: string;
  id_entidad: number;
  detalles: {
    antes: string;
    despues: string;
  };
  ip_address: string;
  fecha_hora: string;
}

export interface AuditoriaListResponse {
  total: number;
  page: number;
  limit: number;
  items: AuditoriaLog[];
}