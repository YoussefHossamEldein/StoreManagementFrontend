import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginDto, RegisterDto } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://radiant-connection-production-61be.up.railway.app/api/Auth';

  currentUser = signal<AuthResponse | null>(this.getUserFromStorage());
  isLoggedIn = signal<boolean>(!!this.getUserFromStorage());
  isAdmin = signal<boolean>(this.getUserFromStorage()?.role === 'Admin');

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, dto)
      .pipe(tap((response) => this.setUser(response)));
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, dto)
      .pipe(tap((response) => this.setUser(response)));
  }

  logout(): void {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.isAdmin.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setUser(response: AuthResponse): void {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response));
    this.currentUser.set(response);
    this.isLoggedIn.set(true);
    this.isAdmin.set(response.role === 'Admin');
  }

  private getUserFromStorage(): AuthResponse | null {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }
}
