import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginDto } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: LoginDto = { email: '', password: '' };
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  submit(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage.set('Please fill all fields.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.role === 'Admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/orders']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Invalid email or password.');
      },
    });
  }
}
