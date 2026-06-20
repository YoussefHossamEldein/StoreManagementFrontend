export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  token: string;
  fullName: string;
  email: string;
  role: string;
}
