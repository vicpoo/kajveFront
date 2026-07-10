// login-page.component.ts
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  message = signal('');
  messageType = signal<'info' | 'success' | 'error'>('info');
  isLoading = signal(false);

  async submit() {
    const email = this.email().trim();
    const password = this.password().trim();

    if (!email || !password) {
      this.messageType.set('error');
      this.message.set('Por favor, ingresa email y contraseña.');
      return;
    }

    this.isLoading.set(true);
    this.messageType.set('info');
    this.message.set('Iniciando sesión...');

    try {
      const success = await this.authService.login(email, password);
      
      if (success) {
        this.messageType.set('success');
        this.message.set('Bienvenido, accediendo al panel...');
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 300);
      } else {
        this.messageType.set('error');
        this.message.set('Credenciales incorrectas. Por favor, intenta nuevamente.');
      }
    } catch (error: any) {
      this.messageType.set('error');
      this.message.set(error.message || 'Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}