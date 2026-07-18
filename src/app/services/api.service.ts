// services/api.service.ts - Completo y corregido
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Interfaces
import { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse } from '../interfaces/auth.interface';
import { User, CreateUserRequest, UpdateUserRequest, UpdateUserStateRequest, UsersListResponse, AdminUsersListResponse } from '../interfaces/user.interface';
import { DashboardStats, SecadoStats, SensorStatusResponse } from '../interfaces/dashboard.interface';
import { Sensor, CreateSensorRequest, UpdateSensorRequest, SensorsListResponse, QRResponse } from '../interfaces/sensor.interface';
import { PlanSuscripcion, MiSuscripcion, PagoPreferenciaRequest, PagoPreferenciaResponse, PagoHistorial } from '../interfaces/suscripcion.interface';
import { Reporte, ReportesListResponse, GenerarReporteRequest } from '../interfaces/reporte.interface';
import { AuditoriaListResponse } from '../interfaces/auditoria.interface';
import { WEB_API_BASE_URL, WEB_ROOT_URL } from '../core/api-config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  // Migrado al gateway centralizado (ver src/app/core/api-config.ts).
  // Para revertir a la URL directa de api-web, comenta la línea de abajo
  // y descomenta la línea vieja.
  private baseUrl = WEB_API_BASE_URL;
  // private baseUrl = 'https://api-web.dnc-ed-denz.shop/api/v1';
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    this.loadTokensFromStorage();
  }

  private getStorage(): Storage | null {
    return typeof window !== 'undefined' ? window.localStorage : null;
  }

  private loadTokensFromStorage(): void {
    const storage = this.getStorage();

    if (!storage) {
      this.tokenSubject.next(null);
      return;
    }

    this.accessToken = storage.getItem('access_token');
    this.refreshTokenValue = storage.getItem('refresh_token');
    this.tokenSubject.next(this.accessToken);
  }

  // ==================== HEADERS ====================
  private getHeaders(includeAuth: boolean = true): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    if (includeAuth && this.accessToken) {
      headers = headers.set('Authorization', `Bearer ${this.accessToken}`);
    }
    
    return headers;
  }

  // ==================== TOKEN MANAGEMENT ====================
  getToken(): string | null {
    return this.accessToken;
  }

  getRefreshTokenValue(): string | null {
    return this.refreshTokenValue;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshTokenValue = refreshToken;

    const storage = this.getStorage();
    if (storage) {
      storage.setItem('access_token', accessToken);
      storage.setItem('refresh_token', refreshToken);
    }

    this.tokenSubject.next(accessToken);
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshTokenValue = null;

    const storage = this.getStorage();
    if (storage) {
      storage.removeItem('access_token');
      storage.removeItem('refresh_token');
    }

    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // ==================== ERROR HANDLING ====================
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado';

    const isClientError = typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent;
    if (isClientError) {
      // Error del lado del cliente
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado.';
    } else if (error.status === 400) {
      errorMessage = error.error?.error || 'Datos inválidos.';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // ==================== AUTH ENDPOINTS ====================
  
  /**
   * POST /api/v1/auth/login
   * Autentica a un usuario con email y contraseña
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setTokens(response.access_token, response.refresh_token);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * POST /api/v1/auth/refresh
   * Genera un nuevo access_token a partir de un refresh_token válido
   */
  refreshAccessToken(): Observable<RefreshResponse> {
    if (!this.refreshTokenValue) {
      return throwError(() => new Error('No hay refresh token disponible'));
    }

    const body: RefreshRequest = { refresh_token: this.refreshTokenValue };
    
    return this.http.post<RefreshResponse>(`${this.baseUrl}/auth/refresh`, body)
      .pipe(
        tap(response => {
          // El refresh_token se mantiene igual
          this.accessToken = response.access_token;
          const storage = this.getStorage();
          if (storage) {
            storage.setItem('access_token', response.access_token);
          }
          this.tokenSubject.next(response.access_token);
        }),
        catchError((error) => {
          this.clearTokens();
          return this.handleError(error);
        })
      );
  }

  /**
   * POST /api/v1/auth/logout
   * Logout simbólico - solo descarta tokens localmente
   */
  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.clearTokens();
        }),
        catchError((error) => {
          this.clearTokens();
          return this.handleError(error);
        })
      );
  }

  // ==================== USUARIOS ENDPOINTS ====================

  /**
   * GET /api/v1/usuarios/
   * Lista todos los usuarios (requiere admin)
   */
  getUsers(skip: number = 0, limit: number = 10): Observable<UsersListResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<UsersListResponse>(`${this.baseUrl}/usuarios/`, {
      headers: this.getHeaders(true),
      params
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * POST /api/v1/usuarios/
   * Crea un nuevo usuario (requiere admin)
   */
  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/usuarios/`, userData, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * GET /api/v1/admin/usuarios
   * Lista de usuarios para panel de administración (requiere admin)
   */
  getAdminUsers(rol?: string, estado?: string, page: number = 1, limit: number = 20): Observable<AdminUsersListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (rol) params = params.set('rol', rol);
    if (estado) params = params.set('estado', estado);
    
    return this.http.get<AdminUsersListResponse>(`${this.baseUrl}/admin/usuarios`, {
      headers: this.getHeaders(true),
      params
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * GET /api/v1/admin/usuarios/{id}
   * Detalle de un usuario (requiere admin)
   */
  getUserDetail(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/admin/usuarios/${id}`, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * PUT /api/v1/admin/usuarios/{id}/estado
   * Activa o desactiva un usuario (requiere admin)
   */
  updateUserState(id: number, estado: 'activo' | 'inactivo'): Observable<{ message: string; id_usuario: number }> {
    const body: UpdateUserStateRequest = { estado };
    return this.http.put<{ message: string; id_usuario: number }>(`${this.baseUrl}/admin/usuarios/${id}/estado`, body, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * DELETE /api/v1/admin/usuarios/{id}
   * Elimina un usuario (requiere admin)
   */
  deleteUser(id: number): Observable<{ message: string; id_usuario: number }> {
    return this.http.delete<{ message: string; id_usuario: number }>(`${this.baseUrl}/admin/usuarios/${id}`, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== DASHBOARD ENDPOINTS ====================

  /**
   * GET /api/v1/admin/dashboard
   * Estadísticas globales del sistema (requiere admin)
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/admin/dashboard`, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * GET /api/v1/admin/estadisticas/secado
   * Estadísticas de calidad y tiempos de secado (requiere admin)
   */
  getSecadoStats(periodo: '7d' | '30d' | '90d' = '7d'): Observable<SecadoStats> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.get<SecadoStats>(`${this.baseUrl}/admin/estadisticas/secado`, {
      headers: this.getHeaders(true),
      params
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * GET /api/v1/admin/estadisticas/sensores
   * Estado actual de cada sensor (requiere admin)
   */
  getSensoresStatus(): Observable<SensorStatusResponse> {
    return this.http.get<SensorStatusResponse>(`${this.baseUrl}/admin/estadisticas/sensores`, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== SENSORES ENDPOINTS ====================

  /**
   * GET /api/v1/admin/sensores
   * Lista todos los sensores registrados (requiere admin)
   */
  getSensores(estado?: 'activo' | 'inactivo' | 'mantenimiento'): Observable<SensorsListResponse> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    
    return this.http.get<SensorsListResponse>(`${this.baseUrl}/admin/sensores`, {
      headers: this.getHeaders(true),
      params
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * POST /api/v1/admin/sensores
   * Registra un nuevo sensor (requiere admin)
   */
  createSensor(sensorData: CreateSensorRequest): Observable<Sensor> {
    return this.http.post<Sensor>(`${this.baseUrl}/admin/sensores`, sensorData, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * GET /api/v1/admin/sensores/{id}
   * Detalle de un sensor (requiere admin)
   */
  getSensorDetail(id: number): Observable<Sensor> {
    return this.http.get<Sensor>(`${this.baseUrl}/admin/sensores/${id}`, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * PUT /api/v1/admin/sensores/{id}
   * Actualiza el estado y/o modelo de un sensor (requiere admin)
   */
  updateSensor(id: number, data: UpdateSensorRequest): Observable<Sensor> {
    return this.http.put<Sensor>(`${this.baseUrl}/admin/sensores/${id}`, data, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * GET /api/v1/admin/sensores/{id}/qr
   * Genera un código QR para el sensor (requiere admin)
   */
  getSensorQR(id: number): Observable<QRResponse> {
    return this.http.get<QRResponse>(`${this.baseUrl}/admin/sensores/${id}/qr`, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }


    // ==================== USUARIOS ENDPOINTS ====================

  /**
   * PUT /api/v1/admin/usuarios/{id}
   * Actualiza datos de un usuario (requiere admin)
   */
  updateUser(id: number, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/admin/usuarios/${id}`, userData, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }


  

  // ==================== REPORTES ENDPOINTS ====================

  /**
   * GET /api/v1/admin/reportes
   * Lista los reportes generados previamente (requiere admin)
   */
  getReportes(formato?: 'pdf' | 'excel', page: number = 1, limit: number = 20): Observable<ReportesListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (formato) params = params.set('formato', formato);
    
    return this.http.get<ReportesListResponse>(`${this.baseUrl}/admin/reportes`, {
      headers: this.getHeaders(true),
      params
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * POST /api/v1/admin/reportes
   * Genera un nuevo reporte (requiere admin)
   */
  generarReporte(data: GenerarReporteRequest): Observable<Reporte> {
    return this.http.post<Reporte>(`${this.baseUrl}/admin/reportes`, data, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * GET /api/v1/admin/reportes/{id}/descargar
   * Descarga el archivo binario de un reporte (requiere admin)
   */
  descargarReporte(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/admin/reportes/${id}/descargar`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken}`
      }),
      responseType: 'blob'
    }).pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== SUSCRIPCIONES ENDPOINTS ====================

  /**
   * GET /api/v1/suscripciones/planes
   * Lista los planes de suscripción disponibles (público)
   */
  getPlanes(): Observable<PlanSuscripcion[]> {
    return this.http.get<PlanSuscripcion[]>(`${this.baseUrl}/suscripciones/planes`, {
      headers: this.getHeaders(false)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * GET /api/v1/suscripciones/mi-suscripcion
   * Devuelve el estado de la suscripción del usuario autenticado
   */
  getMiSuscripcion(): Observable<MiSuscripcion> {
    return this.http.get<MiSuscripcion>(`${this.baseUrl}/suscripciones/mi-suscripcion`, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== PAGOS ENDPOINTS ====================

  /**
   * POST /api/v1/pagos/crear-preferencia
   * Crea una preferencia de pago en Mercado Pago
   */
  crearPreferenciaPago(plan: 'basico' | 'profesional' | 'empresarial'): Observable<PagoPreferenciaResponse> {
    const body: PagoPreferenciaRequest = { plan };
    return this.http.post<PagoPreferenciaResponse>(`${this.baseUrl}/pagos/crear-preferencia`, body, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * GET /api/v1/pagos/historial
   * Lista el historial de pagos del usuario autenticado
   */
  getHistorialPagos(): Observable<PagoHistorial> {
    return this.http.get<PagoHistorial>(`${this.baseUrl}/pagos/historial`, {
      headers: this.getHeaders(true)
    }).pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== AUDITORIA ENDPOINTS ====================

  /**
   * GET /api/v1/admin/auditoria
   * Consulta el registro de auditoría (requiere admin)
   */
  getAuditoria(
    id_usuario?: number,
    accion?: string,
    desde?: string,
    hasta?: string,
    page: number = 1,
    limit: number = 50
  ): Observable<AuditoriaListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (id_usuario) params = params.set('id_usuario', id_usuario.toString());
    if (accion) params = params.set('accion', accion);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    
    return this.http.get<AuditoriaListResponse>(`${this.baseUrl}/admin/auditoria`, {
      headers: this.getHeaders(true),
      params
    }).pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== HEALTH CHECK ====================

  /**
   * GET /health
   * Chequeo de salud del servicio (público)
   */
  healthCheck(): Observable<{ status: string; version: string; environment: string }> {
    // /health no lleva /api/v1, por eso se construye contra WEB_ROOT_URL
    // y no contra baseUrl. Para revertir, usa 'https://api-web.dnc-ed-denz.shop/health'.
    return this.http.get<{ status: string; version: string; environment: string }>(
      `${WEB_ROOT_URL}/health`
    ).pipe(catchError(this.handleError.bind(this)));
  }
}