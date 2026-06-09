import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CustomerService } from '../../services/customer.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  totalProducts = signal<number>(0);
  totalCustomers = signal<number>(0);
  totalOrders = signal<number>(0);
  totalRevenue = signal<number>(0);
  recentOrders = signal<Order[]>([]);
  lowStockItems = signal<Product[]>([]);
  isLoading = signal<boolean>(false);

  constructor(
    private productService: ProductService,
    private customerService: CustomerService,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    this.isLoading.set(true);
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.totalProducts.set(products.length);
        this.lowStockItems.set(products.filter((p) => p.stock < 10));
      },
    });

    this.customerService.getAll().subscribe({
      next: (customers) => this.totalCustomers.set(customers.length),
    });

    this.orderService.getAll().subscribe({
      next: (orders) => {
        this.totalOrders.set(orders.length);
        this.totalRevenue.set(orders.reduce((sum, o) => sum + o.totalAmount, 0));
        this.recentOrders.set(orders.slice(-5).reverse());
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
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
