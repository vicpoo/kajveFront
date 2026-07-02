//src/app/atoms/primary-button/primary-button.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './primary-button.component.html'
})
export class PrimaryButtonComponent {
  @Input() label = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() clicked = new EventEmitter<void>();
}
