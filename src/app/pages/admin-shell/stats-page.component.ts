//src/app/pages/admin-shell/stats-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-page.component.html'
})
export class StatsPageComponent {
  stats = [
    { label: 'Usuarios activos', value: '1,200' },
    { label: 'Nuevos registros', value: '80' },
    { label: 'Pedidos hoy', value: '90' }
  ];
}
