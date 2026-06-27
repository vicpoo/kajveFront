import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-page.component.html'
})
export class OrderPageComponent {
  name = '';
  product = 'Osil';
  quantity = 1;
  notes = '';

  submitOrder() {
    console.log('Pedido enviado', {
      name: this.name,
      product: this.product,
      quantity: this.quantity,
      notes: this.notes
    });
  }
}
