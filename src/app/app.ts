import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar.component/navbar.component';
import { ToastComponent } from './components/toast.component/toast.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  private router = inject(Router);

  isAuthPage(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/register');
  }
}
