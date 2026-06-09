import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, CreateProductDto, UpdateProductDto } from '../../models/product.model';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  // ── Signals ──────────────────────────────────────────────────
  products = signal<Product[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showCreateForm = signal<boolean>(false);
  editingProduct = signal<Product | null>(null);

  // ── Computed — filters automatically when products or searchTerm changes
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.products();
    return this.products().filter(
      (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
    );
  });

  // ── Forms ─────────────────────────────────────────────────────
  createForm: CreateProductDto = { name: '', category: '', price: 0, stock: 0 };
  editForm: UpdateProductDto = { name: '', category: '', price: 0, stock: 0 };

  constructor(private productService: ProductService) {}

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
        this.errorMessage.set('Failed to load products. Make sure the backend is running.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Search ────────────────────────────────────────────────────
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  // ── Create ────────────────────────────────────────────────────
  openCreateForm(): void {
    this.showCreateForm.set(true);
    this.editingProduct.set(null);
    this.createForm = { name: '', category: '', price: 0, stock: 0 };
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
  }

  submitCreate(): void {
    if (!this.createForm.name || !this.createForm.category || this.createForm.price <= 0) {
      alert('Please fill all fields correctly.');
      return;
    }
    this.productService.create(this.createForm).subscribe({
      next: () => {
        this.showCreateForm.set(false);
        this.loadProducts();
      },
      error: () => alert('Failed to create product.'),
    });
  }

  // ── Edit ──────────────────────────────────────────────────────
  openEditForm(product: Product): void {
    this.editingProduct.set(product);
    this.showCreateForm.set(false);
    this.editForm = {
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
    };
  }

  cancelEdit(): void {
    this.editingProduct.set(null);
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
        this.editingProduct.set(null);
        this.loadProducts();
      },
      error: () => alert('Failed to update product.'),
    });
  }

  // ── Delete ────────────────────────────────────────────────────
  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.delete(id).subscribe({
      next: () => this.loadProducts(),
      error: () => alert('Failed to delete product.'),
    });
  }
}
