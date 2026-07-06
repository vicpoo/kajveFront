import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { LoteService } from '../../services/lote.service';
import { LoteVenta } from '../../interfaces/lote.interface';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-page.component.html'
})
export class OrderPageComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private loteService = inject(LoteService);

  name = '';
  email = '';
  phone = '';
  country = 'MX';
  quantity = 1;
  notes = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  lotes: LoteVenta[] = [];
  loteSeleccionadoId: number | null = null;

  ngOnInit() {
    this.cargarLotes();
  }

  cargarLotes() {
    this.loteService.obtenerLotes().subscribe({
      next: (lotes) => {
        this.lotes = lotes;
        if (lotes.length) {
          this.loteSeleccionadoId = lotes.find((lote) => lote.disponible)?.id ?? lotes[0].id;
        }
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los lotes disponibles.';
      }
    });
  }

  seleccionarLote(lote: LoteVenta) {
    this.loteSeleccionadoId = lote.id;
  }

  submitOrder() {
    if (!this.name.trim() || !this.email.trim() || !this.loteSeleccionadoId) {
      this.errorMessage = 'Selecciona un lote, nombre y correo para continuar.';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.paymentService.crearOrden({
      id_lote: this.loteSeleccionadoId,
      nombre_comprador: this.name.trim(),
      email_comprador: this.email.trim(),
      telefono_comprador: this.phone.trim(),
      pais: this.country
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Redirigiendo a Stripe Checkout...';
        window.location.href = response.checkout_url;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.message || 'No se pudo iniciar el pago.';
      }
    });
  }
}
