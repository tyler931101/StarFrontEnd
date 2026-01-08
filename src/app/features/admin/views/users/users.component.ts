import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../../../shared/components/components.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

// Import services and models
import { UserService } from '../../services/user.service';
import { User, UserQueryParams } from '../../models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ComponentsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  totalUsers = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  
  searchTerm = '';
  statusFilter = '';
  sortBy: keyof User | 'createdAt' | 'username' | 'email' | 'phone' | 'status' | 'role' = 'username';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  isLoading = false;
  
  // Modal states
  isEditModalVisible = false;
  isDeleteModalVisible = false;
  selectedUser: User | null = null;
  
  // Forms
  userForm: FormGroup;

  profileImage: string = 'assets/default-avatar.png';
  
  // Search debounce
  private searchSubject = new Subject<string>();
  
  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      status: ['active', Validators.required],
      role: ['user', Validators.required]
    });
  }
  
  ngOnInit() {
    this.loadUsers();
    
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadUsers();
    });
  }
  
  loadUsers() {
    this.isLoading = true;
    
    const params: UserQueryParams = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm,
      status: this.statusFilter || undefined,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
    
    this.userService.getUsers(params).subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalUsers = response.total;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }
  
  changeSort(field: 'username' | 'email' | 'phone' | 'status' | 'role' | 'createdAt') {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.currentPage = 1;
    this.loadUsers();
  }

  getSortIcon(field: 'username' | 'email' | 'phone' | 'status' | 'role' | 'createdAt') {
    if (this.sortBy !== field) return 'bi bi-arrow-down-up text-muted';
    return this.sortOrder === 'asc' ? 'bi bi-arrow-up-short' : 'bi bi-arrow-down-short';
  }

  onSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }
  
  onStatusFilterChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.statusFilter = selectElement.value;
    this.currentPage = 1;
    this.loadUsers();
  }
  
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }
  
  onPageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.loadUsers();
  }
  
  // Edit user
  openEditModal(user: User) {
    this.selectedUser = user;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role
    });
    this.isEditModalVisible = true;
  }
  
  closeEditModal() {
    this.isEditModalVisible = false;
    this.userForm.reset({
      status: 'active',
      role: 'user'
    });
    this.selectedUser = null;
  }
  
  saveUser() {
    if (this.userForm.valid && this.selectedUser) {
      this.isLoading = true;
      this.userService.updateUser(this.selectedUser.id, this.userForm.value).subscribe({
        next: (updatedUser) => {
          // Update local users array
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.closeEditModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  // Delete user
  openDeleteModal(user: User) {
    this.selectedUser = user;
    this.isDeleteModalVisible = true;
  }
  
  closeDeleteModal() {
    this.isDeleteModalVisible = false;
    this.selectedUser = null;
  }
  
  confirmDelete() {
    if (this.selectedUser) {
      this.isLoading = true;
      this.userService.deleteUser(this.selectedUser.id).subscribe({
        next: (success) => {
          if (success) {
            // Remove from local users array
            this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
            this.totalUsers--;
            this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
            
            // Adjust current page if needed
            if (this.users.length === 0 && this.currentPage > 1) {
              this.currentPage--;
              this.loadUsers();
            }
          }
          this.closeDeleteModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-secondary';
      case 'pending': return 'bg-warning';
      default: return 'bg-info';
    }
  }
  
  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'bg-danger';
      case 'editor': return 'bg-primary';
      case 'user': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}
