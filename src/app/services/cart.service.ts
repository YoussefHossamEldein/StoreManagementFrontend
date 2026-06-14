import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>([]);

  totalItems = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));

  totalPrice = computed(() => this.items().reduce((sum, i) => sum + i.price * i.quantity, 0));

  addItem(item: CartItem): void {
    const existing = this.items().find((i) => i.productId === item.productId);
    if (existing) {
      this.items.update((items) =>
        items.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i)),
      );
    } else {
      this.items.update((items) => [...items, { ...item, quantity: 1 }]);
    }
  }

  removeItem(productId: number): void {
    this.items.update((items) => items.filter((i) => i.productId !== productId));
  }

  increaseQty(productId: number): void {
    this.items.update((items) =>
      items.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)),
    );
  }

  decreaseQty(productId: number): void {
    this.items.update((items) =>
      items
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  clear(): void {
    this.items.set([]);
  }
}
