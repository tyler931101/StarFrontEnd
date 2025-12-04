export interface UserDto {
    id: string;
    username: string;
    email: string;
    role: string;
}

export interface UserProfileDto {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
    phone: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    isVerified: boolean;
    isLocked: boolean;
    isDisabled: boolean;
}

export interface UpdateProfileDto {
    username?: string;
    phone?: string;
    email?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UserActivityDto {
    createdAt: string;
    lastLoginAt: string;
    updatedAt: string;
    accountAgeDays: number;
    daysSinceLastLogin: number;
}