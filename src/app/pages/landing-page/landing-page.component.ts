// landing-page.component.ts
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html'
})
export class LandingPageComponent {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  scrollTo(sectionId: string): void {
    // document no existe en el servidor durante SSR/prerender
    if (!this.isBrowser) return;

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  mobileMenuOpen = false;

  features = [
    { icon: '📡', title: 'Sensores IoT', description: 'Monitoreo en tiempo real del secado del café.' },
    { icon: '🧠', title: 'IA Predictiva', description: 'Predicción del punto óptimo de secado.' },
    { icon: '📊', title: 'Dashboard', description: 'Control total desde una interfaz moderna.' },
    { icon: '📱', title: 'QR Tracking', description: 'Trazabilidad de cada lote de café.' },
    { icon: '☁️', title: 'Cloud Sync', description: 'Datos en la nube en tiempo real.' },
    { icon: '🔒', title: 'Seguridad', description: 'Protección y cifrado de información.' }
  ];

  steps = [
    { icon: '🌡️', title: 'Sensores', description: 'Capturan temperatura, humedad y condiciones del secado en tiempo real.' },
    { icon: '💾', title: 'Servidor', description: 'Recibe y almacena los datos de forma segura desde cada lote.' },
    { icon: '🤖', title: 'IA', description: 'Analiza el comportamiento del secado y predice el punto óptimo.' },
    { icon: '📈', title: 'Dashboard', description: 'Muestra recomendaciones y alertas en tiempo real al productor.' }
  ];

  freemiumFeatures = [
    'Lotes ilimitados',
    'Monitoreo en tiempo real',
    'Sensores',
    'Alertas'
  ];

  // Los 3 planes premium reales, con el mismo precio-por-mes y % de
  // ahorro que calcula premium-page.component.ts, pero fijos aquí
  // porque en el landing es solo contenido de marketing (no necesita
  // pegarle al catálogo para mostrarse). El botón de cada uno manda a
  // /premium, que sí lee los productos reales del backend.
  premiumPlans = [
    {
      plan: 'Mensual',
      nombre: 'Premium Mensual',
      precio: 99,
      periodo: '/ mes',
      precioPorMes: 99,
      ahorro: 0,
      destacado: false,
      features: [
        'Todo lo que incluye Freemium',
        'Predicciones con IA',
        'Historial de datos',
        'Reportes en PDF y Excel'
      ]
    },
    {
      plan: 'Trimestral',
      nombre: 'Premium Trimestral',
      precio: 290,
      periodo: '/ 3 meses',
      precioPorMes: 96.67,
      ahorro: 2,
      destacado: false,
      features: [
        'Todo lo del plan Mensual',
        'Prioridad en soporte',
        'Reportes comparativos entre lotes'
      ]
    },
    {
      plan: 'Anual',
      nombre: 'Premium Anual',
      precio: 1100,
      periodo: '/ año',
      precioPorMes: 91.67,
      ahorro: 7,
      destacado: true,
      features: [
        'Todo lo del plan Trimestral',
        'El mejor precio por mes',
        'Acceso anticipado a nuevas funciones'
      ]
    }
  ];

  technologies = [
    { name: 'Flutter', logo: 'assets/tech/flutter.webp', color: '#02569B' },
    { name: 'Dart', logo: 'assets/tech/dart.webp', color: '#0175C2' },
    { name: 'IoT', logo: 'assets/tech/iot.svg', color: '#00A859' },
    { name: 'Firebase', logo: 'assets/tech/firebase.svg', color: '#FFCA28' },
    { name: 'ML', logo: 'assets/tech/ml.svg', color: '#FF6F00' },
    { name: 'Cloud', logo: 'assets/tech/cloud.svg', color: '#4285F4' }
  ];

  highlights = [
    { icon: '🌱', title: 'Monitoreo continuo', description: 'Datos de temperatura y humedad en tiempo real.' },
    { icon: '🔔', title: 'Alertas inteligentes', description: 'Detección temprana de riesgos durante el secado.' },
    { icon: '🎯', title: 'Predicción con IA', description: 'Estimación del tiempo óptimo de secado para cada lote.' }
  ];
}