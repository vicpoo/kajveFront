import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent {
  username = signal('');
  password = signal('');
  message = signal('');
  messageType = signal<'info' | 'success' | 'error'>('info');

  constructor(private router: Router) {}

  submit() {
    const username = this.username().trim().toLowerCase();
    const password = this.password().trim();

    if (username === 'john' && password === '117') {
      this.messageType.set('success');
      this.message.set('Bienvenido, accediendo al panel admin...');
      setTimeout(() => this.router.navigate(['/admin/dashboard']), 300);
      return;
    }

    this.messageType.set('error');
    this.message.set('Credenciales incorrectas. Usa john / 117 para acceder.');
  }
}
