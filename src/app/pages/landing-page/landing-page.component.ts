// landing-page.component.ts
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
  scrollTo(sectionId: string): void {
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

  premiumFeatures = [
    'Todo lo que incluye Freemium',
    'Predicciones con IA',
    'Historial de datos',
    'Reportes en PDF y Excel'
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