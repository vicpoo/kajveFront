// order-success-page.component.ts
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-success-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success-page.component.html'
})
export class OrderSuccessPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Stripe puede mandar session_id como query param si el success_url
  // incluye {CHECKOUT_SESSION_ID}. Si no viene, simplemente no se muestra.
  sessionId: string | null = null;
  mobileMenuOpen = false;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.sessionId = params.get('session_id');
    });
  }
}