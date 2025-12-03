// User DTO (matches backend UserDto)
export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

// User state for frontend
export interface UserState {
  user: UserDto | null;
  loading: boolean;
  error: string | null;
}