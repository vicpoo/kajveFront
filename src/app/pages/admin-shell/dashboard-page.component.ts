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
  // del endpoint /admin/estadisticas/usuarios. El % de altura se normaliza
  // contra el día con más registros de la ventana.
  chartBars = signal<{ label: string; value: number; cantidad: number }[]>([]);

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
            value: Math.max(4, Math.round((d.cantidad / maxCantidad) * 100)),
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