//src/app/pages/admin-shell/stats-page.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

interface PieSlice {
  label: string;
  value: number;
  pct: number;
  color: string;
}

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

  // Pastel: usuarios premium vs normales
  premiumPie = signal<PieSlice[]>([]);
  premiumPieGradient = signal('conic-gradient(#D7BBA4 0deg 360deg)');

  // Pastel: productores vs administradores
  rolesPie = signal<PieSlice[]>([]);
  rolesPieGradient = signal('conic-gradient(#D7BBA4 0deg 360deg)');

  get dashboardStats() {
    return this.dashboardService.dashboardStats();
  }

  async ngOnInit() {
    await this.loadDashboardData();
  }

  private buildGradient(slices: PieSlice[]): string {
    let acumulado = 0;
    const partes = slices
      .filter(s => s.value > 0)
      .map(s => {
        const inicio = acumulado;
        acumulado += s.pct * 360;
        return `${s.color} ${inicio}deg ${acumulado}deg`;
      });
    return partes.length > 0 ? `conic-gradient(${partes.join(', ')})` : 'conic-gradient(#E3D2BC 0deg 360deg)';
  }

  async loadDashboardData() {
    try {
      const [dashboardStats, usuariosStats] = await Promise.all([
        this.dashboardService.loadDashboardStats().then(() => this.dashboardService.dashboardStats()),
        this.dashboardService.loadUsuariosEstadisticas(30)
      ]);

      if (dashboardStats) {
        this.stats.set([
          { label: 'Usuarios activos', value: dashboardStats.usuarios_activos.toString(), sublabel: `${dashboardStats.total_usuarios} totales` },
          { label: 'Sensores activos', value: dashboardStats.sensores_activos.toString(), sublabel: `${dashboardStats.sensores_mantenimiento} en mantenimiento` },
          { label: 'Lotes en proceso', value: dashboardStats.lotes_en_proceso.toString(), sublabel: `${dashboardStats.total_lotes} totales` }
        ]);
      }

      if (usuariosStats) {
        const { premium, normal } = usuariosStats.premium_vs_normal;
        const totalPremiumNormal = premium + normal || 1;
        const premiumSlices: PieSlice[] = [
          { label: 'Premium', value: premium, pct: premium / totalPremiumNormal, color: '#7A3E24' },
          { label: 'Normal', value: normal, pct: normal / totalPremiumNormal, color: '#E3D2BC' }
        ];
        this.premiumPie.set(premiumSlices);
        this.premiumPieGradient.set(this.buildGradient(premiumSlices));

        const { productor, administrador } = usuariosStats.roles;
        const totalRoles = productor + administrador || 1;
        const rolesSlices: PieSlice[] = [
          { label: 'Productores', value: productor, pct: productor / totalRoles, color: '#B8895F' },
          { label: 'Administradores', value: administrador, pct: administrador / totalRoles, color: '#3D2212' }
        ];
        this.rolesPie.set(rolesSlices);
        this.rolesPieGradient.set(this.buildGradient(rolesSlices));
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }
}
