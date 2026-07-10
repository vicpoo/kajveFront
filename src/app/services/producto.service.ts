//src/app/services/producto.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Producto,
  CrearProductoRequest,
  ActualizarProductoRequest,
  FiltroCatalogo
} from '../interfaces/producto.interface';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);

  // IMPORTANTE: este puerto debe coincidir EXACTAMENTE con el puerto real
  // en el que está corriendo tu microservicio de Go (variable de entorno
  // PORT). Si tu backend usa el default (8080) y aquí dice 8000, todas
  // las peticiones fallarán con status 0 (sin respuesta del servidor).
  private readonly baseUrl = 'http://localhost:8000';

  // Catálogo público
  listarProductos(filtro?: FiltroCatalogo): Observable<Producto[]> {
    let params = new HttpParams();
    if (filtro?.tipo_producto) {
      params = params.set('tipo_producto', filtro.tipo_producto);
    }
    if (filtro?.solo_activos !== undefined) {
      params = params.set('solo_activos', filtro.solo_activos.toString());
    }
    if (filtro?.limit) {
      params = params.set('limit', filtro.limit.toString());
    }
    if (filtro?.offset) {
      params = params.set('offset', filtro.offset.toString());
    }
    console.log('[ProductoService] GET', `${this.baseUrl}/catalogo`, 'params:', filtro);
    return this.http.get<Producto[]>(`${this.baseUrl}/catalogo`, { params });
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/catalogo/${id}`);
  }

  // Admin - Catálogo
  crearProducto(body: CrearProductoRequest): Observable<{ id_producto: number }> {
    return this.http.post<{ id_producto: number }>(`${this.baseUrl}/admin/catalogo`, body);
  }

  actualizarProducto(id: number, body: ActualizarProductoRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/admin/catalogo/${id}`, body);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/catalogo/${id}`);
  }

  // Helper: Obtener solo camas de café disponibles
  obtenerCamasCafeDisponibles(): Observable<Producto[]> {
    return this.listarProductos({
      tipo_producto: 'cama_cafe',
      solo_activos: true,
      limit: 100
    });
  }
}