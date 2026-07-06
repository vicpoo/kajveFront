//src/app/pages/admin-shell/stats-page.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-page.component.html'
})
export class StatsPageComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal([
    { label: 'Usuarios activos', value: '...', sublabel: 'Cargando...' },
    { label: 'Sensores activos', value: '...', sublabel: 'Cargando...' },
    { label: 'Lotes en proceso', value: '...', sublabel: 'Cargando...' }
  ]);

  chartBars = signal([
    { label: 'Lun', value: 40 },
    { label: 'Mar', value: 55 },
    { label: 'Mié', value: 65 },
    { label: 'Jue', value: 80 },
    { label: 'Vie', value: 70 }
  ]);

  get dashboardStats() {
    return this.dashboardService.dashboardStats();
  }

  async ngOnInit() {
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      await this.dashboardService.loadDashboardStats();
      const stats = this.dashboardService.dashboardStats();
      if (stats) {
        this.stats.set([
          { label: 'Usuarios activos', value: stats.usuarios_activos.toString(), sublabel: `${stats.total_usuarios} totales` },
          { label: 'Sensores activos', value: stats.sensores_activos.toString(), sublabel: `${stats.sensores_mantenimiento} en mantenimiento` },
          { label: 'Lotes en proceso', value: stats.lotes_en_proceso.toString(), sublabel: `${stats.total_lotes} totales` }
        ]);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }
}
