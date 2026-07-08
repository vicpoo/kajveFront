// services/lote.service.ts - Microservicio local para lotes
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearLoteRequest, LoteVenta } from '../interfaces/lote.interface';

@Injectable({ providedIn: 'root' })
export class LoteService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

  obtenerLotes(): Observable<LoteVenta[]> {
    return this.http.get<LoteVenta[]>(`${this.baseUrl}/lotes`);
  }

  crearLote(body: CrearLoteRequest): Observable<LoteVenta> {
    return this.http.post<LoteVenta>(`${this.baseUrl}/lotes`, body);
  }

  actualizarLote(id: number, body: Partial<CrearLoteRequest>): Observable<LoteVenta> {
    return this.http.put<LoteVenta>(`${this.baseUrl}/lotes/${id}`, body);
  }

  eliminarLote(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/lotes/${id}`);
  }
}