import { Component, signal } from '@angular/core';
import { BrandLogoComponent } from '../../atoms/brand-logo/brand-logo.component';
import { FormInputComponent } from '../../atoms/form-input/form-input.component';
import { PrimaryButtonComponent } from '../../atoms/primary-button/primary-button.component';
import { AuthCardComponent } from '../../molecules/auth-card/auth-card.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AuthCredentials } from '../../interfaces/auth-credentials';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, BrandLogoComponent, FormInputComponent, PrimaryButtonComponent, AuthCardComponent],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent {
  username = signal('');
  password = signal('');
  message = signal('');

  constructor(private authService: AuthService) {}

  submit() {
    const credentials: AuthCredentials = {
      email: this.username(),
      password: this.password()
    };

    this.authService.login(credentials.email, credentials.password).then(() => {
      this.message.set('Credenciales enviadas.');
    });
  }
}
