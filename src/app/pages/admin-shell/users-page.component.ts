import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UserRow {
  usuario: string;
  email: string;
  premium: string;
  osiles: string;
}

interface AdminRow {
  id: string;
  nombre: string;
  rol: string;
  email: string;
}

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-page.component.html'
})
export class UsersPageComponent {
  users: UserRow[] = [
    { usuario: 'john', email: 'john@example.com', premium: 'sí', osiles: '5' },
    { usuario: 'ana', email: 'ana@example.com', premium: 'no', osiles: '2' },
    { usuario: 'luis', email: 'luis@example.com', premium: 'sí', osiles: '8' }
  ];

  admins: AdminRow[] = [
    { id: 'A-001', nombre: 'Marco', rol: 'Admin', email: 'marco@kajve.com' },
    { id: 'A-002', nombre: 'Sara', rol: 'Editor', email: 'sara@kajve.com' }
  ];
}
