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
    { label: 'Sensores', value: '...', sublabel: 'Cargando...' },
    { label: 'Lotes de café', value: '...', sublabel: 'Cargando...' }
  ]);

  chartBars = [
    { label: 'Lun', value: 60 },
    { label: 'Mar', value: 90 },
    { label: 'Mié', value: 55 },
    { label: 'Jue', value: 85 },
    { label: 'Vie', value: 45 }
  ];

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
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}