// order-cancel-page.component.ts
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-cancel-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-cancel-page.component.html'
})
export class OrderCancelPageComponent {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  mobileMenuOpen = false;
}