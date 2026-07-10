// order-page.component.ts - CORREGIDO (fix NG0100 + fix "se queda cargando")
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductoService } from '../../services/producto.service';
import { PaymentService } from '../../services/payment.service';
import { Producto } from '../../interfaces/producto.interface';
import { CrearOrdenRequest } from '../../interfaces/payment.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order-page.component.html'
})
export class OrderPageComponent implements OnInit, OnDestroy {
  private productoService = inject(ProductoService);
  private paymentService = inject(PaymentService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions: Subscription[] = [];

  // Datos del comprador
  name = '';
  email = '';
  phone = '';
  country = 'MX';

  // Estado
  loadingCatalogo = true;
  loading = false;
  errorMessage = '';
  successMessage = '';
  mobileMenuOpen = false;

  // Catálogo de productos (camas de café)
  productos: Producto[] = [];
  productoSeleccionadoId: number | null = null;
  productosDisponibles: Producto[] = [];

  get productoSeleccionado(): Producto | null {
    return this.productos.find(p => p.id_producto === this.productoSeleccionadoId) || null;
  }

  ngOnInit() {
    this.cargarCatalogo();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarCatalogo() {
    this.loadingCatalogo = true;
    this.errorMessage = '';

    const sub = this.productoService.obtenerCamasCafeDisponibles().subscribe({
      next: (productos) => {
        console.log('[order-page] Productos recibidos de /catalogo:', productos);
        this.productos = productos;
        this.recalcularDisponibles();
        this.loadingCatalogo = false;

        if (this.productosDisponibles.length === 0) {
          console.warn('[order-page] La API respondió pero no hay camas de café activas con stock > 0.');
        }

        if (this.productosDisponibles.length > 0) {
          this.productoSeleccionadoId = this.productosDisponibles[0].id_producto;
        }

        // CLAVE: forzamos la detección de cambios manualmente.
        // Si algún componente padre (el shell/layout con <router-outlet>)
        // usa ChangeDetectionStrategy.OnPush y no fue marcado "sucio",
        // Angular se salta este subárbol al revisar cambios, aunque las
        // variables internas SÍ cambiaron (por eso los console.log salen
        // bien pero la pantalla se queda igual). detectChanges() corre
        // la detección de cambios empezando en este componente,
        // sin depender de que el padre coopere.
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingCatalogo = false;
        console.error('[order-page] Error cargando catálogo:', err);

        if (err.status === 0) {
          this.errorMessage =
            'No se pudo conectar con el servicio de pagos. Verifica que el microservicio esté corriendo y que la URL/puerto coincidan.';
        } else {
          this.errorMessage = `No se pudieron cargar los productos disponibles (HTTP ${err.status}).`;
        }
        this.toastr.error('Error al cargar catálogo');
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(sub);
  }

  private recalcularDisponibles() {
    this.productosDisponibles = this.productos.filter(p =>
      p.tipo_producto === 'cama_cafe' &&
      p.activo &&
      p.stock > 0
    );
  }

  seleccionarProducto(producto: Producto) {
    if (producto.activo && producto.stock > 0) {
      this.productoSeleccionadoId =
        this.productoSeleccionadoId === producto.id_producto ? null : producto.id_producto;
    }
  }

  scrollToForm() {
    const element = document.getElementById('checkout-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  submitOrder() {
    if (!this.productoSeleccionadoId) {
      this.errorMessage = 'Por favor, selecciona un producto disponible.';
      this.toastr.error('Selecciona un producto');
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
      id_producto: this.productoSeleccionadoId,
      nombre_comprador: this.name.trim(),
      email_comprador: this.email.trim(),
      telefono_comprador: this.phone.trim() || undefined,
      pais: this.country || 'MX',
      id_usuario: null // Compra como invitado
    };

    const sub = this.paymentService.crearOrden(ordenRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastr.success('Redirigiendo a Stripe Checkout...');
        if (response.checkout_url) {
          window.location.href = response.checkout_url;
        } else {
          this.errorMessage = 'No se pudo obtener la URL de pago.';
          this.toastr.error('No se pudo obtener la URL de pago');
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('[order-page] Error creando orden:', error);
        const msg = error?.error || error?.message || 'Error al procesar el pago.';
        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servicio de pagos. Revisa que esté corriendo.';
          this.toastr.error('Servicio de pagos no disponible');
        } else if (error.status === 404) {
          this.errorMessage = 'El producto seleccionado no existe.';
          this.toastr.error('Producto no encontrado');
        } else if (error.status === 409) {
          this.errorMessage = 'El producto seleccionado ya no está disponible.';
          this.toastr.error('Producto no disponible');
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