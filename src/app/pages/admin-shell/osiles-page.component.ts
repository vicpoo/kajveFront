import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { LoteService } from '../../services/lote.service';
import { OrdenConComprador, EstadoOrden } from '../../interfaces/payment.interface';
import { CrearLoteRequest, LoteVenta } from '../../interfaces/lote.interface';

@Component({
  selector: 'app-osiles-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './osiles-page.component.html'
})
export class OsilesPageComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private loteService = inject(LoteService);

  orders: OrdenConComprador[] = [];
  lotes: LoteVenta[] = [];
  loading = false;
  updatingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  editingLoteId: number | null = null;

  nuevoLote: CrearLoteRequest = {
    nombre: '',
    descripcion: '',
    precio: 6500,
    disponible: true
  };

  ngOnInit() {
    this.loadOrders();
    this.loadLotes();
  }

  loadOrders() {
    this.loading = true;
    this.errorMessage = '';
    this.paymentService.listarOrdenes({ limit: 50 }).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las órdenes.';
        this.loading = false;
      }
    });
  }

  loadLotes() {
    this.loteService.obtenerLotes().subscribe({
      next: (lotes) => {
        this.lotes = lotes;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los lotes.';
      }
    });
  }

  resetLoteForm() {
    this.editingLoteId = null;
    this.nuevoLote = { nombre: '', descripcion: '', precio: 6500, disponible: true };
  }

  editarLote(lote: LoteVenta) {
    this.editingLoteId = lote.id;
    this.nuevoLote = {
      nombre: lote.nombre,
      descripcion: lote.descripcion,
      precio: lote.precio,
      disponible: lote.disponible
    };
    this.successMessage = '';
  }

  guardarLote() {
    if (!this.nuevoLote.nombre.trim() || !this.nuevoLote.descripcion.trim()) {
      this.errorMessage = 'Completa nombre y descripción del lote.';
      return;
    }

    const request = { ...this.nuevoLote };
    const operation = this.editingLoteId !== null
      ? this.loteService.actualizarLote(this.editingLoteId, request)
      : this.loteService.crearLote(request);

    operation.subscribe({
      next: (lote) => {
        if (this.editingLoteId !== null) {
          this.lotes = this.lotes.map((item) => item.id === lote.id ? lote : item);
        } else {
          this.lotes.unshift(lote);
        }

        this.resetLoteForm();
        this.successMessage = this.editingLoteId !== null ? 'Lote actualizado correctamente.' : 'Lote agregado correctamente.';
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = this.editingLoteId !== null ? 'No se pudo actualizar el lote.' : 'No se pudo crear el lote.';
      }
    });
  }

  eliminarLote(loteId: number) {
    const confirmed = window.confirm('¿Deseas eliminar este lote?');
    if (!confirmed) {
      return;
    }

    this.loteService.eliminarLote(loteId).subscribe({
      next: () => {
        this.lotes = this.lotes.filter((lote) => lote.id !== loteId);
        this.successMessage = 'Lote eliminado correctamente.';
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el lote.';
      }
    });
  }

  actualizarEstado(order: OrdenConComprador, estado: EstadoOrden) {
    this.updatingId = order.ID;
    this.paymentService.actualizarEstado(order.ID, estado).subscribe({
      next: () => {
        order.Estado = estado;
        this.updatingId = null;
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar el estado.';
        this.updatingId = null;
      }
    });
  }
}
