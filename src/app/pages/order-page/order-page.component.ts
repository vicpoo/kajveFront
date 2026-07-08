// order-page.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { LoteService } from '../../services/lote.service';
import { LoteVenta } from '../../interfaces/lote.interface';
import { CrearOrdenRequest } from '../../interfaces/payment.interface';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order-page.component.html'
})
export class OrderPageComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private loteService = inject(LoteService);

  name = '';
  email = '';
  phone = '';
  country = 'MX';
  loading = false;
  errorMessage = '';
  successMessage = '';
  mobileMenuOpen = false;

  lotes: LoteVenta[] = [];
  loteSeleccionadoId: number | null = null;

  get loteSeleccionado(): LoteVenta | null {
    return this.lotes.find(l => l.id === this.loteSeleccionadoId) || null;
  }

  ngOnInit() {
    this.cargarLotes();
  }

  cargarLotes() {
    this.loteService.obtenerLotes().subscribe({
      next: (lotes) => {
        this.lotes = lotes;
        const disponible = lotes.find((lote) => lote.disponible);
        if (disponible) {
          this.loteSeleccionadoId = disponible.id;
        }
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los lotes disponibles.';
      }
    });
  }

  seleccionarLote(lote: LoteVenta) {
    if (lote.disponible) {
      this.loteSeleccionadoId = this.loteSeleccionadoId === lote.id ? null : lote.id;
    }
  }

  scrollToForm() {
    const element = document.getElementById('checkout-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  submitOrder() {
    if (!this.loteSeleccionadoId) {
      this.errorMessage = 'Por favor, selecciona un lote disponible.';
      return;
    }

    if (!this.name.trim() || !this.email.trim()) {
      this.errorMessage = 'Nombre y correo son obligatorios.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.errorMessage = 'Correo electrónico inválido.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const ordenRequest: CrearOrdenRequest = {
      id_lote: this.loteSeleccionadoId,
      nombre_comprador: this.name.trim(),
      email_comprador: this.email.trim(),
      telefono_comprador: this.phone.trim() || undefined,
      pais: this.country || 'MX'
    };

    this.paymentService.crearOrden(ordenRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Redirigiendo a Stripe Checkout...';
        if (response.checkout_url) {
          window.location.href = response.checkout_url;
        } else {
          this.errorMessage = 'No se pudo obtener la URL de pago.';
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 404) {
          this.errorMessage = 'El lote seleccionado no existe.';
        } else if (error.status === 409) {
          this.errorMessage = 'El lote seleccionado ya no está disponible.';
        } else {
          this.errorMessage = error?.error || 'Error al procesar el pago. Intenta nuevamente.';
        }
      }
    });
  }
}