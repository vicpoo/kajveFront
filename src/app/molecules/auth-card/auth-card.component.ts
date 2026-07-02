//src/app/molecules/auth-card/auth-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-card.component.html'
})
export class AuthCardComponent {
  @Input() title = 'Bienvenido';
  @Input() subtitle = 'Accede a tu cuenta para continuar';
}
