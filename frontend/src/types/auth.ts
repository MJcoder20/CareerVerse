export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}