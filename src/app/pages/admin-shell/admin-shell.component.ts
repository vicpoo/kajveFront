// src/app/pages/admin-shell/admin-shell.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-shell.component.html'
})
export class AdminShellComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userName = 'Administrador';

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}