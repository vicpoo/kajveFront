// services/payment.service.ts - Microservicio local para pagos
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ActualizarEstadoRequest,
  CrearOrdenRequest,
  CrearOrdenResponse,
  ListarOrdenesParams,
  OrdenConComprador
} from '../interfaces/payment.interface';
import { PAGOS_BASE_URL } from '../core/api-config';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  // Migrado al gateway centralizado (ver src/app/core/api-config.ts).
  // Para revertir a la URL directa, comenta la línea de abajo y
  // descomenta la línea vieja.
  private readonly baseUrl = PAGOS_BASE_URL;
  // private readonly baseUrl = 'https://servicio-pagos.dnc-ed-denz.shop';

  // Público - Crear orden de compra
  crearOrden(body: CrearOrdenRequest): Observable<CrearOrdenResponse> {
    return this.http.post<CrearOrdenResponse>(`${this.baseUrl}/orders`, body);
  }

  // Admin - Gestión de órdenes
  listarOrdenes(params?: ListarOrdenesParams): Observable<OrdenConComprador[]> {
    let httpParams = new HttpParams();
    if (params?.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }
    if (params?.id_lote) {
      httpParams = httpParams.set('id_lote', params.id_lote.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.offset) {
      httpParams = httpParams.set('offset', params.offset.toString());
    }
    return this.http.get<OrdenConComprador[]>(`${this.baseUrl}/admin/orders`, { params: httpParams });
  }

  obtenerOrden(id: number): Observable<OrdenConComprador> {
    return this.http.get<OrdenConComprador>(`${this.baseUrl}/admin/orders/${id}`);
  }

  actualizarEstado(id: number, estado: ActualizarEstadoRequest['estado']): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/admin/orders/${id}/estado`, { estado });
  }
}