import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  info(message: string): void {
    this.add(message, 'info');
  }

  dismiss(id: number): void {
    this.toasts.update((all) => all.filter((t) => t.id !== id));
  }

  private add(message: string, type: Toast['type']): void {
    const id = this.nextId++;
    this.toasts.update((all) => [...all, { id, message, type }]);
    // Auto-dismiss after 3.5 seconds
    setTimeout(() => this.dismiss(id), 3500);
  }
}
