import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OsilRow {
  clave: string;
  usuario: string;
  nombre: string;
  fecha: string;
}

@Component({
  selector: 'app-osiles-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './osiles-page.component.html'
})
export class OsilesPageComponent {
  osiles: OsilRow[] = [
    { clave: 'O-001', usuario: 'john', nombre: 'Osil Clásico', fecha: '2026-06-27' },
    { clave: 'O-002', usuario: 'ana', nombre: 'Osil Premium', fecha: '2026-06-26' },
    { clave: 'O-003', usuario: 'luis', nombre: 'Osil Express', fecha: '2026-06-25' }
  ];
}
