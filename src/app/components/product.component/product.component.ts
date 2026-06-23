import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product, CreateProductDto, UpdateProductDto } from '../../models/product.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private productService = inject(ProductService);
  authService = inject(AuthService);

  products = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  searchTerm = signal<string>('');
  formErrors = signal<Record<string, string>>({});
  // Panel state
  panelOpen = signal<boolean>(false);
  panelMode = signal<'create' | 'edit'>('create');
  editingProduct = signal<Product | null>(null);

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.products();
    return this.products().filter(
      (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
    );
  });
  private toast = inject(ToastService);

  createForm: CreateProductDto = { name: '', category: '', price: 0, stock: 0 };
  editForm: UpdateProductDto = { name: '', category: '', price: 0, stock: 0 };

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load products.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  // ── Panel Controls ────────────────────────────────────────────
  openCreatePanel(): void {
    this.createForm = { name: '', category: '', price: 0, stock: 0 };
    this.panelMode.set('create');
    this.panelOpen.set(true);
  }

  openEditPanel(product: Product): void {
    this.editingProduct.set(product);
    this.editForm = {
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
    };
    this.panelMode.set('edit');
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
    this.editingProduct.set(null);
    this.formErrors.set({}); // add this
  }

  // ── Submit ────────────────────────────────────────────────────
  submitCreate(): void {
    this.formErrors.set({});
    const errors: Record<string, string> = {};

    if (!this.createForm.name) errors['name'] = 'Product name is required.';
    if (!this.createForm.category) errors['category'] = 'Category is required.';
    if (this.createForm.price <= 0) errors['price'] = 'Price must be greater than 0.';
    if (this.createForm.stock < 0) errors['stock'] = 'Stock cannot be negative.';

    if (Object.keys(errors).length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.productService.create(this.createForm).subscribe({
      next: () => {
        this.closePanel();
        this.loadProducts();
        this.toast.success('Product created successfully');
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
          this.toast.error('Failed to create product.');
        }
      },
    });
  }
  submitEdit(): void {
    this.formErrors.set({});
    const product = this.editingProduct();
    if (!product) return;

    const errors: Record<string, string> = {};
    if (!this.editForm.name) errors['name'] = 'Product name is required.';
    if (!this.editForm.category) errors['category'] = 'Category is required.';
    if (this.editForm.price <= 0) errors['price'] = 'Price must be greater than 0.';
    if (this.editForm.stock < 0) errors['stock'] = 'Stock cannot be negative.';

    if (Object.keys(errors).length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.productService.update(product.id, this.editForm).subscribe({
      next: () => {
        this.closePanel();
        this.loadProducts();
        this.toast.success('Product updated successfully!');
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
          this.toast.error('Failed to update product.');
        }
      },
    });
  }
  toggleAvailability(product: Product): void {
    const action = product.isAvailable ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} "${product.name}"?`)) return;

    this.productService.toggleAvailability(product.id).subscribe({
      next: () => this.loadProducts(),
      error: () => this.toast.error('Failed to update product availability.'),
    });
  }
}
