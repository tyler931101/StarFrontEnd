export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  role: 'admin' | 'user' | 'editor';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}