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
