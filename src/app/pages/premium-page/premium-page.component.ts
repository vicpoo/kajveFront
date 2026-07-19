// premium-page.component.ts
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductoService } from '../../services/producto.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { Producto } from '../../interfaces/producto.interface';
import { PlanPremium } from '../../interfaces/plan-premium.interface';
import { CrearOrdenRequest } from '../../interfaces/payment.interface';
import { Subscription } from 'rxjs';
import { SessionNavComponent } from '../../molecules/session-nav/session-nav.component';

@Component({
  selector: 'app-premium-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SessionNavComponent],
  templateUrl: './premium-page.component.html'
})
export class PremiumPageComponent implements OnInit, OnDestroy {
  private productoService = inject(ProductoService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private subscriptions: Subscription[] = [];

  // Datos del comprador (igual que order-page: ordenes SIEMPRE crea un
  // comprador, incluso para suscripciones). Se precargan con lo que ya
  // sabemos del usuario logueado, pero siguen siendo editables por si
  // quiere usar otro correo/nombre para la factura.
  name = '';
  email = '';
  phone = '';
  country = 'MX';

  // Estado
  loadingPlanes = true;
  loading = false;
  errorMessage = '';
  successMessage = '';
  mobileMenuOpen = false;

  // Planes
  planes: PlanPremium[] = [];
  planSeleccionadoId: number | null = null;

  // Sesión: id del usuario logueado. Comprar premium lo requiere porque
  // el backend activa es_premium sobre un usuario concreto (a diferencia
  // de las camas de café, que se compran como invitado). Viene directo
  // de AuthService, que ya lo guarda desde el login.
  idUsuarioActual: number | null = null;

  get planSeleccionado(): PlanPremium | null {
    return this.planes.find(p => p.id_producto === this.planSeleccionadoId) || null;
  }

  ngOnInit() {
    // El catálogo de suscripciones ya no responde 401 sin sesión (mismo
    // cambio de gateway que libera /pagos/catalogo para el checkout de
    // invitado en order-page), así que no podemos seguir dependiendo del
    // 401 para forzar login aquí. Comprar premium sí requiere id_usuario,
    // así que lo verificamos explícitamente antes de cargar nada.
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/premium' } });
      return;
    }

    this.idUsuarioActual = this.authService.getUser()?.id ?? null;
    this.precargarDatosComprador();
    this.cargarPlanes();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private precargarDatosComprador(): void {
    const user = this.authService.getUser();
    if (!user) return;
    this.name = user.nombre ?? '';
    this.email = user.email ?? '';
  }

  cargarPlanes() {
    this.loadingPlanes = true;
    this.errorMessage = '';

    const sub = this.productoService.obtenerPlanesSuscripcion().subscribe({
      next: (productos) => {
        this.planes = this.calcularMetadataPlanes(productos);
        this.loadingPlanes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingPlanes = false;

        if (err.status === 401) {
          // Invitado sin sesión (o sesión vencida): el interceptor ya
          // redirige a /login con el mensaje correcto. No es un error
          // del sistema, así que no mostramos banner ni toast aquí.
          this.cdr.detectChanges();
          return;
        }

        console.error('[premium-page] Error cargando planes:', err);

        if (err.status === 0) {
          this.errorMessage =
            'No se pudo conectar con el servicio de pagos. Verifica que el microservicio esté corriendo.';
        } else {
          this.errorMessage = `No se pudieron cargar los planes premium (HTTP ${err.status}).`;
        }
        this.toastr.error('Error al cargar planes');
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(sub);
  }

  // Convierte los Producto crudos del catálogo en PlanPremium con
  // precio-por-mes, % de ahorro y cuál marcar como "destacado". Todo
  // esto es solo presentación: el backend no sabe nada de esto.
  private calcularMetadataPlanes(productos: Producto[]): PlanPremium[] {
    const ordenados = [...productos].sort((a, b) => a.duracion_dias - b.duracion_dias);
    if (ordenados.length === 0) return [];

    // El plan más corto define el precio "base" mensual de referencia.
    const base = ordenados[0];
    const precioBasePorMes = base.precio / Math.max(1, Math.round(base.duracion_dias / 30));

    let mejorAhorroIdx = 0;
    let mejorAhorroPct = -1;

    const conMeta: PlanPremium[] = ordenados.map((p, i) => {
      const meses = Math.max(1, Math.round(p.duracion_dias / 30));
      const precioPorMes = p.precio / meses;
      const precioSinDescuento = precioBasePorMes * meses;
      const ahorroPct = precioSinDescuento > 0
        ? Math.max(0, ((precioSinDescuento - p.precio) / precioSinDescuento) * 100)
        : 0;

      if (ahorroPct > mejorAhorroPct) {
        mejorAhorroPct = ahorroPct;
        mejorAhorroIdx = i;
      }

      return { ...p, meses, precioPorMes, ahorroPct, destacado: false };
    });

    // Solo se destaca un plan (el de mejor ahorro), y solo si hay más de
    // un plan — si solo existe uno no tiene sentido resaltarlo.
    if (conMeta.length > 1) {
      conMeta[mejorAhorroIdx].destacado = true;
    }

    return conMeta;
  }

  seleccionarPlan(plan: PlanPremium) {
    this.planSeleccionadoId = this.planSeleccionadoId === plan.id_producto ? null : plan.id_producto;

    if (this.planSeleccionadoId && this.isBrowser) {
      const el = document.getElementById('checkout-form');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }

  submitOrder() {
    if (!this.idUsuarioActual) {
      this.errorMessage = 'Necesitas iniciar sesión para comprar un plan premium.';
      this.toastr.error('Inicia sesión primero');
      return;
    }

    if (!this.planSeleccionadoId) {
      this.errorMessage = 'Por favor, selecciona un plan.';
      this.toastr.error('Selecciona un plan');
      return;
    }

    if (!this.name.trim() || !this.email.trim()) {
      this.errorMessage = 'Nombre y correo son obligatorios.';
      this.toastr.error('Nombre y correo son obligatorios');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.errorMessage = 'Correo electrónico inválido.';
      this.toastr.error('Correo electrónico inválido');
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const ordenRequest: CrearOrdenRequest = {
      id_producto: this.planSeleccionadoId,
      nombre_comprador: this.name.trim(),
      email_comprador: this.email.trim(),
      telefono_comprador: this.phone.trim() || undefined,
      pais: this.country || 'MX',
      id_usuario: this.idUsuarioActual // clave: a diferencia de order-page, aquí SÍ va el usuario real
    };

    const sub = this.paymentService.crearOrden(ordenRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastr.success('Redirigiendo a Stripe Checkout...');
        if (response.checkout_url) {
          if (this.isBrowser) {
            window.location.href = response.checkout_url;
          }
        } else {
          this.errorMessage = 'No se pudo obtener la URL de pago.';
          this.toastr.error('No se pudo obtener la URL de pago');
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('[premium-page] Error creando orden:', error);
        const msg = error?.error || error?.message || 'Error al procesar el pago.';
        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servicio de pagos. Revisa que esté corriendo.';
          this.toastr.error('Servicio de pagos no disponible');
        } else if (error.status === 404) {
          this.errorMessage = 'El plan seleccionado no existe.';
          this.toastr.error('Plan no encontrado');
        } else if (error.status === 409) {
          this.errorMessage = 'El plan seleccionado ya no está disponible.';
          this.toastr.error('Plan no disponible');
        } else if (error.status === 400) {
          this.errorMessage = msg;
          this.toastr.error(msg);
        } else {
          this.errorMessage = msg;
          this.toastr.error(msg);
        }
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(sub);
  }
}