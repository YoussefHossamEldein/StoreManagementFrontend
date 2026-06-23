import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../services/auth.service';
import { Customer, CreateCustomerDto } from '../../models/customer.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css',
})
export class CustomerComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toast = inject(ToastService);
  authService = inject(AuthService);

  customers = signal<Customer[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  searchTerm = signal<string>('');
  formErrors = signal<Record<string, string>>({});

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
    this.formErrors.set({});
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
    this.formErrors.set({});
  }

  submitCreate(): void {
    this.formErrors.set({});
    const errors: Record<string, string> = {};

    if (!this.createForm.name || !this.createForm.name.trim()) {
      errors['name'] = 'Customer name is required.';
    }

    if (Object.keys(errors).length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.customerService.create(this.createForm).subscribe({
      next: () => {
        this.closePanel();
        this.loadCustomers();
        this.toast.success('Customer created successfully');
      },
      error: (err) => {
        if (err.status === 400 && err.error?.errors) {
          const mapped: Record<string, string> = {};
          for (const key of Object.keys(err.error.errors)) {
            const shortKey = key.split('.').pop()!.toLowerCase();
            mapped[shortKey] = err.error.errors[key][0];
          }
          this.formErrors.set(mapped);
        } else {
          this.toast.error('failed to create customer');
        }
      },
    });
  }

  deleteCustomer(id: number): void {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    this.customerService.delete(id).subscribe({
      next: () => {
        this.loadCustomers();
        this.toast.success('Customer deleted');
      },

      error: () => this.toast.error('Failed to delete customer'),
    });
  }
}
