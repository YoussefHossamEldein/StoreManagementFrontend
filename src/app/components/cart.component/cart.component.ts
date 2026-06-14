import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  authService = inject(AuthService);
  router = inject(Router);

  paymentMethod = signal<string>('Cash');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  orderPlaced = signal<boolean>(false);

  paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'];

  placeOrder(): void {
    if (this.cartService.items().length === 0) {
      this.errorMessage.set('Your cart is empty.');
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const dto = {
      customerId: user.id ?? 0,
      items: this.cartService.items().map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };

    this.orderService.create(dto).subscribe({
      next: () => {
        this.cartService.clear();
        this.orderPlaced.set(true);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to place order. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
