
import { api } from "./api";
import type {
  User,
  LoginData,
  RegisterData,
  TokenResponse,
  MessageResponse,
} from "../types/auth";

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const response = await api.post<User>("/auth/register", data);
    return response.data;
  },

  async login(data: LoginData): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>("/auth/login", data);
    localStorage.setItem("access_token", response.data.access_token);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  async verifyEmail(token: string): Promise<MessageResponse> {
    const response = await api.get<MessageResponse>("/auth/verify-email", {
      params: { token },
    });
    return response.data;
  },

  async resendVerification(email: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
      "/auth/resend-verification",
      { email }
    );
    return response.data;
  },

  logout(): void {
    localStorage.removeItem("access_token");
  },
};
