// pages/admin-shell/sensores-page.component.ts
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SensorService } from '../../services/sensor.service';
import { ProductoService } from '../../services/producto.service';
import { UserService } from '../../services/user.service';
import { Sensor, CreateSensorRequest, LoteActual, AltaDirectaSensorRequest } from '../../interfaces/sensor.interface';
import { Producto } from '../../interfaces/producto.interface';
import { User } from '../../interfaces/user.interface';
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
  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions: Subscription[] = [];

  // Catálogo de kits (solo referencia visual, no se envía al backend)
  productos: Producto[] = [];
  loadingCatalogo = true;
  productoSeleccionadoId: number | null = null;

  // Modo de alta: registro estándar (queda "sin vincular" hasta reclamar
  // por QR) o alta directa (se asigna a un usuario real de inmediato,
  // usando un identificador propio del ESP32 en vez de una MAC estándar)
  modoAlta: 'estandar' | 'directa' = 'estandar';

  // Formulario de registro estándar
  nuevoSensor: CreateSensorRequest = {
    mac_address: '',
    tipo: 'ambos',
    modelo: ''
  };
  creandoSensor = false;
  errorMessage = '';

  // Formulario de alta directa
  productoresDisponibles: User[] = [];
  cargandoProductores = false;
  altaDirecta: AltaDirectaSensorRequest = {
    identificador: '',
    id_usuario: 0,
    tipo: 'ambos',
    modelo: '',
    mide_viento: false,
    mide_radiacion: false,
    mide_humedad_grano: true,
    nombre_lote: '',
    variedad: 'arabica',
    tipo_proceso: 'natural',
    ubicacion: ''
  };

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
    this.cargarProductores();
  }

  async cargarProductores() {
    this.cargandoProductores = true;
    try {
      await this.userService.loadAdminUsers('productor', 'activo', 1, 100);
      this.productoresDisponibles = this.userService.users();
    } catch (err) {
      console.error('Error cargando productores:', err);
    } finally {
      this.cargandoProductores = false;
      this.cdr.detectChanges();
    }
  }

  cambiarModoAlta(modo: 'estandar' | 'directa') {
    this.modoAlta = modo;
    this.errorMessage = '';
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

  async registrarAltaDirecta() {
    const identificador = this.altaDirecta.identificador?.trim() || '';

    if (identificador.length < 3) {
      this.errorMessage = 'El identificador del ESP32 debe tener al menos 3 caracteres (ej. kajve-D8463591).';
      this.toastr.error('Identificador inválido');
      return;
    }
    if (!this.altaDirecta.id_usuario) {
      this.errorMessage = 'Selecciona el usuario al que se asignará este sensor.';
      this.toastr.error('Falta seleccionar el usuario');
      return;
    }

    this.creandoSensor = true;
    this.errorMessage = '';

    try {
      const resultado = await this.sensorService.altaDirectaSensor({
        ...this.altaDirecta,
        identificador,
        modelo: this.altaDirecta.modelo?.trim() || undefined,
        nombre_lote: this.altaDirecta.nombre_lote?.trim() || undefined,
        ubicacion: this.altaDirecta.ubicacion?.trim() || undefined
      });

      this.sensorCreado = resultado.sensor;
      this.loteActual = {
        id_lote: resultado.id_lote,
        codigo_qr: resultado.codigo_qr || '',
        nombre_lote: resultado.nombre_lote || '',
        estado: resultado.estado_lote
      };
      this.toastr.success(`Sensor "${identificador}" dado de alta y asignado correctamente`);
      this.creandoSensor = false;
      this.cdr.detectChanges();

      await this.cargarQr(resultado.id_lote);
    } catch (err) {
      this.creandoSensor = false;
      const mensaje = this.extraerMensajeError(err);
      this.errorMessage = mensaje;
      this.toastr.error('Error en alta directa: ' + mensaje);
      console.error('Error en alta directa de sensor:', err);
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
    this.altaDirecta = {
      identificador: '',
      id_usuario: 0,
      tipo: 'ambos',
      modelo: '',
      mide_viento: false,
      mide_radiacion: false,
      mide_humedad_grano: true,
      nombre_lote: '',
      variedad: 'arabica',
      tipo_proceso: 'natural',
      ubicacion: ''
    };
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
