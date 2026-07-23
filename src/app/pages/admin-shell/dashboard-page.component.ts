//src/app/pages/admin-shell/dashboard-page.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal([
    { label: 'Total de usuarios', value: '...', sublabel: 'Cargando...' },
    { label: 'Productores', value: '...', sublabel: 'Cargando...' },
    { label: 'Usuarios premium', value: '...', sublabel: 'Cargando...' },
    { label: 'Sensores', value: '...', sublabel: 'Cargando...' },
    { label: 'Lotes de café', value: '...', sublabel: 'Cargando...' }
  ]);

  // Barras de usuarios registrados por día (últimos 14 días), con datos reales
  // del endpoint /admin/estadisticas/usuarios. Se usa una altura en PÍXELES
  // (no %) a propósito: la columna donde vive cada barra es un flex item
  // dentro de un contenedor con `items-end`, así que no tiene una altura
  // definida (no hace stretch) — un `height: %` ahí se resuelve contra un
  // padre sin alto fijo y colapsa a 0, dejando la barra invisible aunque sí
  // haya datos. Con píxeles fijos (contra la zona de barra de altura fija,
  // ver template) el problema desaparece.
  readonly ALTO_ZONA_BARRAS_PX = 160;
  chartBars = signal<{ label: string; heightPx: number; cantidad: number }[]>([]);

  isLoading = signal(true);

  get dashboardServicePublic() {
    return this.dashboardService;
  }

  async ngOnInit() {
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoading.set(true);
    try {
      const data = await this.dashboardService.loadAllDashboardData();

      if (data.dashboard) {
        const totalUsuarios = data.dashboard.total_usuarios;
        const usuariosActivos = data.dashboard.usuarios_activos;
        const totalProductores = data.dashboard.total_productores;
        const totalPremium = data.dashboard.total_usuarios_premium;
        const totalSensores = data.dashboard.total_sensores;
        const sensoresActivos = data.dashboard.sensores_activos;
        const totalLotes = data.dashboard.total_lotes;
        const lotesEnProceso = data.dashboard.lotes_en_proceso;

        this.stats.set([
          {
            label: 'Total de usuarios',
            value: totalUsuarios.toString(),
            sublabel: `${usuariosActivos} activos`
          },
          {
            label: 'Productores',
            value: totalProductores.toString(),
            sublabel: `de ${totalUsuarios} usuarios`
          },
          {
            label: 'Usuarios premium',
            value: totalPremium.toString(),
            sublabel: `${totalUsuarios > 0 ? Math.round((totalPremium / totalUsuarios) * 100) : 0}% del total`
          },
          {
            label: 'Sensores',
            value: totalSensores.toString(),
            sublabel: `${sensoresActivos} activos`
          },
          {
            label: 'Lotes de café',
            value: totalLotes.toString(),
            sublabel: `${lotesEnProceso} en proceso`
          }
        ]);
      }

      if (data.usuarios) {
        const ultimosDias = data.usuarios.serie_tiempo.slice(-14);
        const maxCantidad = Math.max(1, ...ultimosDias.map(d => d.cantidad));
        this.chartBars.set(
          ultimosDias.map(d => ({
            label: new Date(d.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }),
            heightPx: Math.max(6, Math.round((d.cantidad / maxCantidad) * this.ALTO_ZONA_BARRAS_PX)),
            cantidad: d.cantidad
          }))
        );
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}