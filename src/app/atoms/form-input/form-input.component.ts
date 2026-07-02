//src/app/atoms/form-input/form-input.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-input.component.html'
})
export class FormInputComponent {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() autocomplete = 'off';
  @Output() valueChange = new EventEmitter<string>();
}
