// molecules/session-nav/session-nav.component.ts
// Fragmento de nav consciente de sesión: muestra "Login" si no hay sesión
// (o el rol no es productor), o ícono de perfil + cerrar sesión si sí la
// hay. Compartido entre landing, premium y order (los 3 navs con Login).
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-session-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './session-nav.component.html'
})
export class SessionNavComponent {
  // 'brand': pill sólido café (landing). 'translucent': pill blanco
  // translúcido sobre fondo café (premium/order).
  @Input() variant: 'brand' | 'translucent' = 'brand';
  @Input() mobile = false;
  // Se emite al hacer click en Login o Cerrar sesión, para que la página
  // padre pueda cerrar su menú móvil si aplica.
  @Output() navigate = new EventEmitter<void>();

  protected authService = inject(AuthService);

  cerrarSesion(): void {
    this.authService.logout('/');
    this.navigate.emit();
  }
}
