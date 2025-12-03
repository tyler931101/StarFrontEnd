// User DTO (matches backend UserDto)
export interface UserDto {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}
