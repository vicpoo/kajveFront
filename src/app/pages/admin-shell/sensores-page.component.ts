// pages/admin-shell/sensores-page.component.ts
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SensorService } from '../../services/sensor.service';
import { ProductoService } from '../../services/producto.service';
import { Sensor, CreateSensorRequest, LoteActual } from '../../interfaces/sensor.interface';
import { Producto } from '../../interfaces/producto.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sensores-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sensores-page.component.html'
})
export class SensoresPageComponent implements OnInit, OnDestroy {
  private sensorService = inject(SensorService);
  private productoService = inject(ProductoService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions: Subscription[] = [];

  // Catálogo de kits (solo referencia visual, no se envía al backend)
  productos: Producto[] = [];
  loadingCatalogo = true;
  productoSeleccionadoId: number | null = null;

  // Formulario de registro
  nuevoSensor: CreateSensorRequest = {
    mac_address: '',
    tipo: 'ambos',
    modelo: ''
  };
  creandoSensor = false;
  errorMessage = '';

  // Resultado del flujo automático
  sensorCreado: Sensor | null = null;
  cargandoLote = false;
  loteActual: LoteActual | null = null;
  cargandoQr = false;
  qrObjectUrl: string | null = null;
  private qrBlob: Blob | null = null;
  qrFilename = '';

  ngOnInit() {
    this.cargarCatalogo();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.liberarQrObjectUrl();
  }

  cargarCatalogo() {
    this.loadingCatalogo = true;
    const sub = this.productoService.obtenerCamasCafeDisponibles().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loadingCatalogo = false;
        if (this.productos.length > 0) {
          this.productoSeleccionadoId = this.productos[0].id_producto;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        // El selector de kit es solo referencial: si falla, no bloqueamos
        // el registro del sensor, solo lo dejamos vacío.
        this.loadingCatalogo = false;
        console.error('Error cargando catálogo de kits:', err);
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(sub);
  }

  private esMacValida(mac: string): boolean {
    return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(mac.trim());
  }

  async registrarSensor() {
    const mac = this.nuevoSensor.mac_address?.trim() || '';
    const modelo = this.nuevoSensor.modelo?.trim() || '';

    if (!this.esMacValida(mac)) {
      this.errorMessage = 'La dirección MAC debe tener el formato XX:XX:XX:XX:XX:XX.';
      this.toastr.error('Dirección MAC inválida');
      return;
    }
    if (!modelo) {
      this.errorMessage = 'El modelo del sensor es obligatorio.';
      this.toastr.error('El modelo es obligatorio');
      return;
    }

    this.creandoSensor = true;
    this.errorMessage = '';

    try {
      const sensor = await this.sensorService.createSensor({ ...this.nuevoSensor, mac_address: mac, modelo });
      this.sensorCreado = sensor;
      this.toastr.success(`Sensor "${sensor.mac_address}" registrado con éxito`);
      this.creandoSensor = false;
      this.cdr.detectChanges();

      await this.cargarLoteAutomatico(sensor.id);
    } catch (err) {
      this.creandoSensor = false;
      const mensaje = this.extraerMensajeError(err);
      this.errorMessage = mensaje;
      this.toastr.error('Error al registrar sensor: ' + mensaje);
      console.error('Error creando sensor:', err);
      this.cdr.detectChanges();
    }
  }

  private async cargarLoteAutomatico(idSensor: number) {
    this.cargandoLote = true;
    try {
      const lote = await this.sensorService.getLoteActual(idSensor);
      this.loteActual = lote;
      this.cargandoLote = false;
      this.cdr.detectChanges();

      await this.cargarQr(lote.id_lote);
    } catch (err) {
      this.cargandoLote = false;
      const mensaje = this.extraerMensajeError(err);
      // Este error no lo puede resolver el admin: el sensor sí se creó,
      // pero el trigger de BD no generó su lote. Es un bug de backend.
      this.errorMessage =
        `El sensor se registró, pero no se pudo obtener su lote automático (${mensaje}). ` +
        `Esto indica una falla en el trigger de base de datos, no algo que puedas corregir aquí: ` +
        `contacta a soporte o intenta reintentar en unos minutos.`;
      this.toastr.error(mensaje);
      console.error('Error obteniendo lote actual:', err);
      this.cdr.detectChanges();
    }
  }

  private async cargarQr(idLote: number) {
    this.cargandoQr = true;
    try {
      const { blob, filename } = await this.sensorService.getLoteQrImagen(idLote);
      this.liberarQrObjectUrl();
      this.qrBlob = blob;
      this.qrFilename = filename;
      this.qrObjectUrl = URL.createObjectURL(blob);
    } catch (err) {
      const mensaje = this.extraerMensajeError(err);
      this.errorMessage = `No se pudo obtener la imagen del QR: ${mensaje}`;
      this.toastr.error(mensaje);
      console.error('Error obteniendo imagen QR:', err);
    } finally {
      this.cargandoQr = false;
      this.cdr.detectChanges();
    }
  }

  descargarQr() {
    if (!this.qrObjectUrl || !this.qrBlob) return;
    const a = document.createElement('a');
    a.href = this.qrObjectUrl;
    a.download = this.qrFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  registrarOtroSensor() {
    this.sensorCreado = null;
    this.loteActual = null;
    this.liberarQrObjectUrl();
    this.errorMessage = '';
    this.nuevoSensor = { mac_address: '', tipo: 'ambos', modelo: '' };
  }

  private liberarQrObjectUrl() {
    if (this.qrObjectUrl) {
      URL.revokeObjectURL(this.qrObjectUrl);
      this.qrObjectUrl = null;
    }
    this.qrBlob = null;
  }

  private extraerMensajeError(err: any): string {
    if (err && err.message) {
      return err.message;
    }
    if (err && err.error && err.error.message) {
      return err.error.message;
    }
    if (err && typeof err.error === 'string') {
      return err.error;
    }
    return 'Error inesperado.';
  }
}
