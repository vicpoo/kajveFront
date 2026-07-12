// src/app/services/premium.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PremiumStatusResponse {
  id_usuario: number;
  es_premium: boolean;
}

@Injectable({ providedIn: 'root' })
export class PremiumService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://servicio-pagos.dnc-ed-denz.shop';

  // GET /usuarios/{id}/premium — expuesto por PremiumController en el
  // microservicio de pagos.
  verificarPremium(idUsuario: number): Observable<PremiumStatusResponse> {
    return this.http.get<PremiumStatusResponse>(`${this.baseUrl}/usuarios/${idUsuario}/premium`);
  }
}