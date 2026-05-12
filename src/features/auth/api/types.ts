export interface AuthResponse {
  accessToken: string;
  userId: string;
  fullName?: string;
}

export interface LoginDto {
  email: string;
  password?: string; // Adjust based on your backend (e.g., if you only use ID for dev)
  id?: string;
}

export interface RegisterDto {
  username: string;
  fullName: string;
  email: string;
  password?: string;
}
