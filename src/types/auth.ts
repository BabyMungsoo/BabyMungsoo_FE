export type UserRole = 'USER' | 'ADMIN';

export function normalizeRole(role: unknown): UserRole {
  return role === 'ADMIN' ? 'ADMIN' : 'USER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  name: string;
  accessToken: string;
  tokenType: string;
  role?: UserRole;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface SignupResponse {
  userId: number;
  email: string;
  name: string;
}
