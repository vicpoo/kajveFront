// login-page.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = signal('');
  password = signal('');
  message = signal('');
  messageType = signal<'info' | 'success' | 'error'>('info');
  isLoading = signal(false);

  // Ruta a la que volver tras el login, si el usuario llegó aquí
  // redirigido por el interceptor (ej. intentó ver /premium sin sesión).
  private returnUrl: string | null = null;

  ngOnInit(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl = this.isSafeReturnUrl(returnUrl) ? returnUrl : null;
  }

  private isSafeReturnUrl(url: string | null): url is string {
    // Solo rutas internas relativas: evita usarlo como open-redirect
    // (ej. "//evil.com" o "https://evil.com").
    return !!url && url.startsWith('/') && !url.startsWith('//');
  }

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
        this.message.set('Bienvenido, redirigiendo...');
        setTimeout(() => {
          this.redirectAfterLogin();
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

  // Administrador y supervisor son staff interno -> panel de admin.
  // Productor es quien compra/gestiona su cosecha -> lo mandamos directo
  // a activar su plan premium, que es la acción que más le interesa
  // justo después de loguearse.
  private redirigirSegunRol(): void {
    const rol = this.authService.getUser()?.rol;

    if (rol === 'administrador' || rol === 'supervisor') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/premium']);
    }
  }

  // Si el login fue disparado por el interceptor (returnUrl presente,
  // ej. venía de /premium u /order sin sesión) y el rol es productor,
  // vuelve exactamente ahí. Admin/supervisor siempre van a su dashboard,
  // sin importar returnUrl (redirigirSegunRol queda intacta para ellos).
  private redirectAfterLogin(): void {
    const rol = this.authService.getUser()?.rol;
    const esProductor = rol !== 'administrador' && rol !== 'supervisor';

    if (esProductor && this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    this.redirigirSegunRol();
  }
}