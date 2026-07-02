//src/app/pages/admin-shell/dashboard-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  label: string;
  value: string;
  sublabel: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {
  stats: StatCard[] = [
    { label: 'Total de usuarios', value: '1,200', sublabel: 'Activos este mes' },
    { label: 'Usuarios premium', value: '120', sublabel: 'Crecimiento +8%' },
    { label: 'Total de osiles', value: '90', sublabel: 'Pedidos hoy' }
  ];

  chartBars = [
    { label: 'Lun', value: 60 },
    { label: 'Mar', value: 90 },
    { label: 'Mié', value: 55 },
    { label: 'Jue', value: 85 },
    { label: 'Vie', value: 45 }
  ];
}
