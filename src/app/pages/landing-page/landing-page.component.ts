//langing-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html'
})
export class LandingPageComponent {
  // Navegación
  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  mobileMenuOpen = false;

  // Datos de características
  features = [
    {
      icon: 'sensors',
      title: 'Sensores IoT',
      description: 'Monitoreo en tiempo real del secado del café.'
    },
    {
      icon: 'analytics',
      title: 'IA Predictiva',
      description: 'Predicción del punto óptimo de secado.'
    },
    {
      icon: 'dashboard',
      title: 'Dashboard',
      description: 'Control total desde una interfaz moderna.'
    },
    {
      icon: 'qr_code_scanner',
      title: 'QR Tracking',
      description: 'Trazabilidad de cada lote de café.'
    },
    {
      icon: 'cloud',
      title: 'Cloud Sync',
      description: 'Datos en la nube en tiempo real.'
    },
    {
      icon: 'security',
      title: 'Seguridad',
      description: 'Protección y cifrado de información.'
    }
  ];

  // Datos de testimonios
  testimonials = [
    {
      name: 'Productor Café 1',
      text: 'KAJVE me ayudó a reducir pérdidas en el secado del café.'
    },
    {
      name: 'Cooperativa XYZ',
      text: 'Ahora monitoreamos todos nuestros lotes en tiempo real.'
    },
    {
      name: 'Ingeniero Agrónomo',
      text: 'La precisión de la IA es impresionante.'
    }
  ];

  // Datos de cómo funciona
  steps = [
    {
      icon: 'sensors',
      title: 'Sensores',
      description: 'Capturan temperatura, humedad y condiciones del secado en tiempo real.'
    },
    {
      icon: 'dns',
      title: 'Servidor',
      description: 'Recibe y almacena los datos de forma segura desde cada lote.'
    },
    {
      icon: 'psychology',
      title: 'IA',
      description: 'Analiza el comportamiento del secado y predice el punto óptimo.'
    },
    {
      icon: 'dashboard',
      title: 'Dashboard',
      description: 'Muestra recomendaciones y alertas en tiempo real al productor.'
    }
  ];

  // Datos de precios
  plans = [
    {
      name: 'Gratuito',
      price: '$0',
      priceSuffix: '',
      description: 'Ideal para comenzar',
      features: ['Hasta 2 lotes', 'Reportes básicos', 'Monitoreo estándar'],
      buttonText: 'Comenzar',
      highlighted: false
    },
    {
      name: 'Profesional',
      price: '$19',
      priceSuffix: 'por mes',
      description: 'Más popular',
      features: ['Lotes ilimitados', 'IA avanzada', 'PDF y Excel', 'Alertas inteligentes'],
      buttonText: 'Suscribirme',
      highlighted: true
    },
    {
      name: 'Empresarial',
      price: 'Personalizado',
      priceSuffix: '',
      description: 'Para cooperativas y empresas',
      features: ['Usuarios ilimitados', 'Panel administrativo', 'Integraciones API', 'Soporte prioritario'],
      buttonText: 'Contactar',
      highlighted: false
    }
  ];

  // Tecnologías
  technologies = ['Flutter', 'Dart', 'IoT', 'Firebase', 'Machine Learning', 'Cloud'];

  // Highlights de About
  highlights = [
    {
      icon: 'sensors',
      title: 'Monitoreo continuo',
      description: 'Datos de temperatura y humedad en tiempo real.'
    },
    {
      icon: 'notifications_active',
      title: 'Alertas inteligentes',
      description: 'Detección temprana de riesgos durante el secado.'
    },
    {
      icon: 'psychology',
      title: 'Predicción con IA',
      description: 'Estimación del tiempo óptimo de secado para cada lote.'
    }
  ];

  // Stats
  stats = [
    { value: '500+', label: 'Clientes', icon: 'people' },
    { value: '98%', label: 'Satisfacción', icon: 'star' },
    { value: '24/7', label: 'Soporte', icon: 'support_agent' }
  ];
}