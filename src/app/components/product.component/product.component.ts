import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product, CreateProductDto, UpdateProductDto } from '../../models/product.model';

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
  }

  // ── Submit ────────────────────────────────────────────────────
  submitCreate(): void {
    if (!this.createForm.name || !this.createForm.category || this.createForm.price <= 0) {
      alert('Please fill all fields correctly.');
      return;
    }
    this.productService.create(this.createForm).subscribe({
      next: () => {
        this.closePanel();
        this.loadProducts();
      },
      error: (err) => alert(err.error?.message ?? 'Failed to create product.'),
    });
  }

  submitEdit(): void {
    const product = this.editingProduct();
    if (!product) return;
    if (!this.editForm.name || !this.editForm.category || this.editForm.price <= 0) {
      alert('Please fill all fields correctly.');
      return;
    }
    this.productService.update(product.id, this.editForm).subscribe({
      next: () => {
        this.closePanel();
        this.loadProducts();
      },
      error: () => alert('Failed to update product.'),
    });
  }

  toggleAvailability(product: Product): void {
    const action = product.isAvailable ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} "${product.name}"?`)) return;

    this.productService.toggleAvailability(product.id).subscribe({
      next: () => this.loadProducts(),
      error: () => alert('Failed to update product availability.'),
    });
  }
}
