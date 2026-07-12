// src/app/interfaces/plan-premium.interface.ts
import { Producto } from './producto.interface';

// Extiende Producto (que ya viene del backend) con datos calculados en
// el frontend únicamente para la presentación: precio por mes y % de
// ahorro contra pagar el plan mensual repetidamente. El backend no
// necesita saber nada de esto, es puramente visual.
export interface PlanPremium extends Producto {
  meses: number;
  precioPorMes: number;
  ahorroPct: number;
  destacado: boolean;
}