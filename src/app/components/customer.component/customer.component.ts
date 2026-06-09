import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateCustomerDto, Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css',
})
export class CustomerComponent implements OnInit {
  customers = signal<Customer[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  searchTerm = signal<string>('');
  showCreateForm = signal<boolean>(false);

  filteredCustomers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.customers();
    return this.customers().filter((c) => c.name.toLowerCase().includes(term));
  });

  createForm: CreateCustomerDto = { name: '' };

  constructor(private customerService: CustomerService) {}

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
        this.errorMessage.set('Failed to load customers. Make sure the backend is running.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  openCreateForm(): void {
    this.showCreateForm.set(true);
    this.createForm = { name: '' };
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
  }

  submitCreate(): void {
    if (!this.createForm.name) {
      alert('Please enter a customer name.');
      return;
    }
    this.customerService.create(this.createForm).subscribe({
      next: () => {
        this.showCreateForm.set(false);
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
