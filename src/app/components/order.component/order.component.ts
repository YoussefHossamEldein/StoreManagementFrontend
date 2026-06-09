import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { CustomerService } from '../../services/customer.service';
import { ProductService } from '../../services/product.service';
import { Order, CreateOrderDto, CreateOrderItemDto } from '../../models/order.model';
import { Customer } from '../../models/customer.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit {
  // ── Signals ───────────────────────────────────────────────────
  orders = signal<Order[]>([]);
  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  searchTerm = signal<string>('');
  showCreateForm = signal<boolean>(false);

  // ── Computed ──────────────────────────────────────────────────
  filteredOrders = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.orders();
    return this.orders().filter(
      (o) => o.status.toLowerCase().includes(term) || o.id.toString().includes(term),
    );
  });

  // ── Create Form ───────────────────────────────────────────────
  selectedCustomerId: number = 0;
  orderItems: CreateOrderItemDto[] = [];
  selectedProductId: number = 0;
  selectedQuantity: number = 1;

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadCustomers();
    this.loadProducts();
  }

  // ── Load Data ─────────────────────────────────────────────────
  loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load orders.');
        this.isLoading.set(false);
      },
    });
  }

  loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (data) => this.customers.set(data),
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products.set(data),
    });
  }

  // ── Search ────────────────────────────────────────────────────
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  // ── Create Form ───────────────────────────────────────────────
  openCreateForm(): void {
    this.showCreateForm.set(true);
    this.selectedCustomerId = 0;
    this.orderItems = [];
    this.selectedProductId = 0;
    this.selectedQuantity = 1;
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
  }

  addItem(): void {
    if (this.selectedProductId === 0) {
      alert('Please select a product.');
      return;
    }
    if (this.selectedQuantity < 1) {
      alert('Quantity must be at least 1.');
      return;
    }

    // Check if product already added — update quantity instead
    const existing = this.orderItems.find((i) => i.productId === this.selectedProductId);
    if (existing) {
      existing.quantity += this.selectedQuantity;
    } else {
      this.orderItems = [
        ...this.orderItems,
        { productId: this.selectedProductId, quantity: this.selectedQuantity },
      ];
    }

    // Reset selectors
    this.selectedProductId = 0;
    this.selectedQuantity = 1;
  }

  removeItem(productId: number): void {
    this.orderItems = this.orderItems.filter((i) => i.productId !== productId);
  }

  getProductName(productId: number): string {
    return this.products().find((p) => p.id === productId)?.name ?? 'Unknown';
  }

  getProductPrice(productId: number): number {
    return this.products().find((p) => p.id === productId)?.price ?? 0;
  }

  getOrderTotal(): number {
    return this.orderItems.reduce((sum, item) => {
      return sum + this.getProductPrice(item.productId) * item.quantity;
    }, 0);
  }

  submitCreate(): void {
    if (this.selectedCustomerId === 0) {
      alert('Please select a customer.');
      return;
    }
    if (this.orderItems.length === 0) {
      alert('Please add at least one product.');
      return;
    }

    const dto: CreateOrderDto = {
      customerId: this.selectedCustomerId,
      items: this.orderItems,
    };

    this.orderService.create(dto).subscribe({
      next: () => {
        this.showCreateForm.set(false);
        this.loadOrders();
      },
      error: () => alert('Failed to create order.'),
    });
  }

  // ── Update Status ─────────────────────────────────────────────
  updateStatus(id: number, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.orderService.update(id, status).subscribe({
      next: () => this.loadOrders(),
      error: () => alert('Failed to update status.'),
    });
  }

  // ── Delete ────────────────────────────────────────────────────
  deleteOrder(id: number): void {
    if (!confirm('Are you sure you want to delete this order?')) return;
    this.orderService.delete(id).subscribe({
      next: () => this.loadOrders(),
      error: () => alert('Failed to delete order.'),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  getCustomerName(customerId: number): string {
    return this.customers().find((c) => c.id === customerId)?.name ?? 'Unknown';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }
}
