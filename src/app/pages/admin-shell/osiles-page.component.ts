// osiles-page.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { LoteService } from '../../services/lote.service';
import { AuthService } from '../../services/auth.service';
import { OrdenConComprador, EstadoOrden } from '../../interfaces/payment.interface';
import { LoteVenta, CrearLoteRequest } from '../../interfaces/lote.interface';

@Component({
  selector: 'app-osiles-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './osiles-page.component.html'
})
export class OsilesPageComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private loteService = inject(LoteService);
  private authService = inject(AuthService);
  private router = inject(Router);

  orders: OrdenConComprador[] = [];
  lotes: LoteVenta[] = [];
  loading = true;
  errorMessage = '';
  updatingId: number | null = null;

  filterEstado = '';
  filterLote = 0;
  limit = 50;
  offset = 0;

  // Modal
  modalLoteAbierto = false;
  creandoLote = false;
  nuevoLote: CrearLoteRequest = {
    nombre: '',
    descripcion: '',
    precio: 0,
    disponible: true
  };

  ngOnInit() {
    this.cargarDatos();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  cargarDatos() {
    this.loading = true;
    this.loteService.obtenerLotes().subscribe({
      next: (lotes) => {
        this.lotes = lotes;
        this.cargarOrdenes();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los lotes.';
        this.loading = false;
      }
    });
  }

  cargarOrdenes() {
    this.paymentService.listarOrdenes({
      estado: this.filterEstado || undefined,
      id_lote: this.filterLote || undefined,
      limit: this.limit,
      offset: this.offset
    }).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las órdenes.';
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    this.offset = 0;
    this.cargarOrdenes();
  }

  cambiarPagina(direccion: number) {
    this.offset = Math.max(0, this.offset + direccion * this.limit);
    this.cargarOrdenes();
  }

  getEstadoColor(estado: string): string {
    const colores: Record<string, string> = {
      'pendiente': 'bg-amber-100 text-amber-800',
      'pagada': 'bg-emerald-100 text-emerald-800',
      'cancelada': 'bg-red-100 text-red-800',
      'reembolsada': 'bg-gray-100 text-gray-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pendiente': 'Pendiente',
      'pagada': 'Pagada',
      'cancelada': 'Cancelada',
      'reembolsada': 'Reembolsada'
    };
    return labels[estado] || estado;
  }

  actualizarEstado(order: OrdenConComprador, estado: EstadoOrden) {
    if (!confirm(`¿Cambiar estado a "${this.getEstadoLabel(estado)}"?`)) return;

    this.updatingId = order.id;
    this.paymentService.actualizarEstado(order.id, estado).subscribe({
      next: () => {
        const ordenActualizada = this.orders.find(o => o.id === order.id);
        if (ordenActualizada) {
          ordenActualizada.estado = estado;
        }
        this.updatingId = null;
        this.cargarOrdenes();
      },
      error: () => {
        this.errorMessage = 'Error al actualizar el estado.';
        this.updatingId = null;
      }
    });
  }

  getNombreLote(idLote: number): string {
    const lote = this.lotes.find(l => l.id === idLote);
    return lote ? lote.nombre : `Lote #${idLote}`;
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Modal de lote
  abrirModalLote() {
    this.nuevoLote = { nombre: '', descripcion: '', precio: 0, disponible: true };
    this.modalLoteAbierto = true;
  }

  cerrarModalLote() {
    this.modalLoteAbierto = false;
  }

  crearLote() {
    if (!this.nuevoLote.nombre.trim() || this.nuevoLote.precio <= 0) {
      this.errorMessage = 'Nombre y precio son obligatorios.';
      return;
    }

    this.creandoLote = true;
    this.loteService.crearLote(this.nuevoLote).subscribe({
      next: () => {
        this.creandoLote = false;
        this.cerrarModalLote();
        this.cargarDatos();
        this.errorMessage = '';
      },
      error: () => {
        this.creandoLote = false;
        this.errorMessage = 'Error al crear el lote.';
      }
    });
  }
}