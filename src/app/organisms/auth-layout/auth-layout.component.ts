import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="min-h-screen bg-[#F2E6D8] px-4 py-10 sm:px-6"><ng-content></ng-content></div>`
})
export class AuthLayoutComponent {}
