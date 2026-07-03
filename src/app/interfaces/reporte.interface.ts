export interface Reporte {
  id_reporte: number;
  id_lote: number;
  lote_nombre: string;
  tipo_reporte: string;
  formato: 'pdf' | 'excel';
  url_archivo: string;
  usuario_nombre: string;
  fecha_generacion: string;
}

export interface ReportesListResponse {
  total: number;
  page: number;
  limit: number;
  items: Reporte[];
}

export interface GenerarReporteRequest {
  id_lote: number;
  tipo_reporte: string;
  formato: 'pdf' | 'excel';
}