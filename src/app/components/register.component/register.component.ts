import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterDto } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: RegisterDto = {
    fullName: '',
    email: '',
    password: '',
    role: 'User',
  };

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  submit(): void {
    if (!this.registerForm.fullName || !this.registerForm.email || !this.registerForm.password) {
      this.errorMessage.set('Please fill all fields.');
      return;
    }
    if (this.registerForm.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.registerForm).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.role === 'Admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/orders']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Registration failed.');
      },
    });
  }
}
