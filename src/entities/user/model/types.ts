export enum UserRole {
  USER = 'USER',
  GLOBAL_ADMIN = 'GLOBAL_ADMIN',
}

export interface User {
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  fullName: string;
  email: string;
  password: string;
}
