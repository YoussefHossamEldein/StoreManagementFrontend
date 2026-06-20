import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../services/auth.service';
import { Customer, CreateCustomerDto } from '../../models/customer.model';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css',
})
export class CustomerComponent implements OnInit {
  private customerService = inject(CustomerService);
  authService = inject(AuthService);

  customers = signal<Customer[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  searchTerm = signal<string>('');

  // Panel state
  panelOpen = signal<boolean>(false);

  filteredCustomers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.customers();
    return this.customers().filter((c) => c.name.toLowerCase().includes(term));
  });

  createForm: CreateCustomerDto = { name: '' };

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load customers.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openPanel(): void {
    this.createForm = { name: '' };
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  submitCreate(): void {
    if (!this.createForm.name) {
      alert('Please enter a customer name.');
      return;
    }
    this.customerService.create(this.createForm).subscribe({
      next: () => {
        this.closePanel();
        this.loadCustomers();
      },
      error: () => alert('Failed to create customer.'),
    });
  }

  deleteCustomer(id: number): void {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    this.customerService.delete(id).subscribe({
      next: () => this.loadCustomers(),
      error: () => alert('Failed to delete customer.'),
    });
  }
}
