// pages/admin-shell/osiles-page.component.ts
import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '../../services/payment.service';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { OrdenConComprador, EstadoOrden } from '../../interfaces/payment.interface';
import { Producto, CrearProductoRequest } from '../../interfaces/producto.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-osiles-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './osiles-page.component.html'
})
export class OsilesPageComponent implements OnInit, OnDestroy {
  private paymentService = inject(PaymentService);
  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions: Subscription[] = [];

  orders: OrdenConComprador[] = [];
  productos: Producto[] = [];
  loading = true;
  errorMessage = '';
  updatingId: number | null = null;

  filterEstado = '';
  filterLote = 0;
  limit = 50;
  offset = 0;

  // Modal para crear producto
  modalProductoAbierto = false;
  creandoProducto = false;
  nuevoProducto: CrearProductoRequest = {
    tipo_producto: 'cama_cafe',
    nombre: '',
    descripcion: '',
    precio: 0,
    moneda: 'MXN',
    imagen_url: '',
    activo: true,
    id_lote: null,
    variedad: '',
    peso_kg: 0,
    stock: 1,
    plan_suscripcion: '',
    duracion_dias: 0,
    lotes_max: 0
  };

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  cargarDatos() {
    this.loading = true;
    const sub = this.productoService.listarProductos({ limit: 100 }).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargarOrdenes();
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar los productos.';
        this.loading = false;
        this.toastr.error('Error al cargar productos');
        console.error('Error cargando productos:', err);
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(sub);
  }

  cargarOrdenes() {
    const sub = this.paymentService.listarOrdenes({
      estado: this.filterEstado || undefined,
      id_lote: this.filterLote || undefined,
      limit: this.limit,
      offset: this.offset
    }).subscribe({
      next: (orders) => {
        console.log('Órdenes recibidas:', orders);
        this.orders = orders;
        this.loading = false;
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error completo:', err);
        this.errorMessage = 'No se pudieron cargar las órdenes.';
        this.loading = false;
        this.toastr.error('Error al cargar órdenes');
        console.error('Error cargando órdenes:', err);
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(sub);
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

    this.updatingId = order.ID;
    const sub = this.paymentService.actualizarEstado(order.ID, estado).subscribe({
      next: () => {
        const ordenActualizada = this.orders.find(o => o.ID === order.ID);
        if (ordenActualizada) {
          ordenActualizada.Estado = estado;
        }
        this.updatingId = null;
        this.toastr.success(`Orden #${order.ID} actualizada a ${this.getEstadoLabel(estado)}`);

        setTimeout(() => {
          this.cargarOrdenes();
        }, 0);
      },
      error: (err) => {
        this.errorMessage = 'Error al actualizar el estado.';
        this.updatingId = null;
        this.toastr.error('Error al actualizar estado');
        console.error('Error actualizando estado:', err);
      }
    });
    this.subscriptions.push(sub);
  }

  getNombreProducto(idProducto: number): string {
    const producto = this.productos.find(p => p.id_producto === idProducto);
    return producto ? producto.nombre : `Producto #${idProducto}`;
  }

  getTipoProductoLabel(tipo: string): string {
    return tipo === 'cama_cafe' ? 'Cama de café' : 'Suscripción';
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

  private extraerMensajeError(err: any): string {
    if (err && err.error && err.error.message) {
      return err.error.message;
    }
    if (err && err.message) {
      return err.message;
    }
    if (err && typeof err.error === 'string') {
      return err.error;
    }
    return 'Error al crear el producto.';
  }

  abrirModalProducto() {
    this.nuevoProducto = {
      tipo_producto: 'cama_cafe',
      nombre: '',
      descripcion: '',
      precio: 0,
      moneda: 'MXN',
      imagen_url: '',
      activo: true,
      id_lote: null,
      variedad: '',
      peso_kg: 0,
      stock: 1,
      plan_suscripcion: '',
      duracion_dias: 0,
      lotes_max: 0
    };
    this.modalProductoAbierto = true;
  }

  cerrarModalProducto() {
    this.modalProductoAbierto = false;
  }

  crearProducto() {
    if (!this.nuevoProducto.nombre?.trim() || (this.nuevoProducto.precio ?? 0) <= 0) {
      this.errorMessage = 'Nombre y precio son obligatorios.';
      this.toastr.error('Nombre y precio son obligatorios');
      return;
    }

    if (
      this.nuevoProducto.tipo_producto === 'cama_cafe' &&
      (this.nuevoProducto.peso_kg ?? 0) <= 0
    ) {
      this.errorMessage = 'Para una cama de café, el peso es obligatorio.';
      this.toastr.error('El peso es obligatorio para cama de café');
      return;
    }

    if (
      this.nuevoProducto.tipo_producto === 'suscripcion' &&
      !this.nuevoProducto.plan_suscripcion?.trim()
    ) {
      this.errorMessage = 'Para una suscripción, el plan es obligatorio.';
      this.toastr.error('El plan es obligatorio para suscripción');
      return;
    }

    this.creandoProducto = true;
    const nombreCreado = this.nuevoProducto.nombre;

    const sub = this.productoService.crearProducto(this.nuevoProducto).subscribe({
      next: (response) => {
        this.creandoProducto = false;
        this.cerrarModalProducto();
        this.errorMessage = '';
        this.toastr.success(`Producto "${nombreCreado}" creado con éxito!`);

        setTimeout(() => {
          this.cargarDatos();
        }, 0);
      },
      error: (err: any) => {
        this.creandoProducto = false;
        const mensaje = this.extraerMensajeError(err);
        this.errorMessage = mensaje;
        this.toastr.error('Error al crear producto: ' + mensaje);
        console.error('Error creando producto:', err);
      }
    });
    this.subscriptions.push(sub);
  }
}