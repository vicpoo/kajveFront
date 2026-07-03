//src/app/pages/admin-shell/admin-shell.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './admin-shell.component.html'
})
export class AdminShellComponent {
  private authService = inject(AuthService);

  get userName(): string {
    const user = this.authService.currentUser();
    return user?.nombre || 'Admin';
  }

  async logout() {
    await this.authService.logout();
  }
}