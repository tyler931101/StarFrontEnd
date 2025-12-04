import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, UserListResponse, UserQueryParams } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Mock data for demonstration
  private mockUsers: User[] = [
    { id: 1, username: 'admin', email: 'admin@example.com', phone: '123-456-7890', status: 'active', role: 'admin', createdAt: new Date('2023-01-01'), updatedAt: new Date('2023-12-01') },
    { id: 2, username: 'john_doe', email: 'john@example.com', phone: '234-567-8901', status: 'active', role: 'user', createdAt: new Date('2023-02-15'), updatedAt: new Date('2023-11-20') },
    { id: 3, username: 'jane_smith', email: 'jane@example.com', phone: '345-678-9012', status: 'inactive', role: 'editor', createdAt: new Date('2023-03-10'), updatedAt: new Date('2023-10-15') },
    { id: 4, username: 'bob_wilson', email: 'bob@example.com', phone: '456-789-0123', status: 'pending', role: 'user', createdAt: new Date('2023-04-05'), updatedAt: new Date('2023-09-30') },
    { id: 5, username: 'alice_jones', email: 'alice@example.com', phone: '567-890-1234', status: 'active', role: 'user', createdAt: new Date('2023-05-20'), updatedAt: new Date('2023-08-25') },
    { id: 6, username: 'charlie_brown', email: 'charlie@example.com', phone: '678-901-2345', status: 'active', role: 'user', createdAt: new Date('2023-06-15'), updatedAt: new Date('2023-07-10') },
    { id: 7, username: 'david_miller', email: 'david@example.com', phone: '789-012-3456', status: 'active', role: 'editor', createdAt: new Date('2023-07-01'), updatedAt: new Date('2023-12-15') },
    { id: 8, username: 'emily_clark', email: 'emily@example.com', phone: '890-123-4567', status: 'inactive', role: 'user', createdAt: new Date('2023-08-10'), updatedAt: new Date('2023-11-30') },
    { id: 9, username: 'frank_adams', email: 'frank@example.com', phone: '901-234-5678', status: 'pending', role: 'user', createdAt: new Date('2023-09-05'), updatedAt: new Date('2023-10-20') },
    { id: 10, username: 'grace_lee', email: 'grace@example.com', phone: '012-345-6789', status: 'active', role: 'admin', createdAt: new Date('2023-10-01'), updatedAt: new Date('2023-12-10') }
  ];

  getUsers(params: UserQueryParams): Observable<UserListResponse> {
    // For demo purposes, simulate API call with mock data
    return of(this.filterUsers(params)).pipe(
      delay(500), // Simulate network delay
      map(result => ({
        users: result.users,
        total: result.total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(result.total / params.pageSize)
      }))
    );
  }

  private filterUsers(params: UserQueryParams): { users: User[], total: number } {
    let filtered = [...this.mockUsers];
    
    // Search filter
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchLower)
      );
    }
    
    // Status filter
    if (params.status) {
      filtered = filtered.filter(user => user.status === params.status);
    }
    
    // Sort
    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[params.sortBy as keyof User];
        const bVal = b[params.sortBy as keyof User];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return params.sortOrder === 'desc' 
            ? bVal.localeCompare(aVal)
            : aVal.localeCompare(bVal);
        }
        return 0;
      });
    }
    
    // Pagination
    const startIndex = (params.page - 1) * params.pageSize;
    const paginatedUsers = filtered.slice(startIndex, startIndex + params.pageSize);
    
    return { users: paginatedUsers, total: filtered.length };
  }

  getUser(id: number): Observable<User> {
    const user = this.mockUsers.find(u => u.id === id);
    return of(user!).pipe(delay(300));
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockUsers[index] = { 
        ...this.mockUsers[index], 
        ...userData, 
        updatedAt: new Date() 
      };
    }
    return of(this.mockUsers[index]).pipe(delay(300));
  }

  deleteUser(id: number): Observable<boolean> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockUsers.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }
}