import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserProfileDto, UpdateProfileDto, ChangePasswordDto } from '../../models/user.model';
import { UserStateService } from 'app/core/services/user-state.service';
import { Subject, takeUntil } from 'rxjs';

import { AvatarService } from 'app/core/services/avatar.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('profileForm') profileForm?: NgForm;
  @ViewChild('passwordForm') passwordForm?: NgForm;

  // Profile data
  profileData: UpdateProfileDto = { 
    username: '', 
    email: '',
    phone: ''
  };

  // Password change data
  passwordData: ChangePasswordDto = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // UI State
  userId: string = '';
  activeTab: 'profile' | 'password' = 'profile';
  profileImage: string = 'assets/default-avatar.png';
  selectedFile?: File;
  originalProfile: any = {};
  
  // Loading states
  isSubmitting = false;
  isUploading = false;
  isChangingPassword = false;
  isLoadingAvatar = false;
  
  // Messages
  successMessage = '';
  errorMessage = '';
  imageError = '';
  passwordError = '';

  // User info from state
  userEmail: string = '';
  userRole: string = '';
  accountCreated: string = '';
  isVerified: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userState: UserStateService,
    private avatarService: AvatarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const user = response.data;
          
          // Store original profile for comparison
          this.originalProfile = { ...user };
          
          // Update profile data
          this.profileData = {
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
          };
          
          this.userId = user.id;

          // Update UI state
          this.userEmail = user.email || '';
          this.userRole = user.role || '';
          this.accountCreated = user.createdAt || '';
          this.isVerified = user.isVerified || false;
          
          // Update user state
          this.userState.setUser(user);

          // Always load avatar through AvatarService to get proper blob URL
          // This ensures consistent avatar handling and proper caching
          this.loadAvatarFromBackend();
        }
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Failed to load profile.';
      }
    });
  }

  // Load avatar from backend API
  loadAvatarFromBackend(): void {
    if (!this.userId) return;

    this.isLoadingAvatar = true;
    this.avatarService.getAvatar(this.userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (url) => {
        this.profileImage = url;
        this.isLoadingAvatar = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback to default avatar on any error
        this.profileImage = 'assets/default-avatar.png';
        this.isLoadingAvatar = false;
        this.cdr.detectChanges();
      }
    });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    
    if (!this.isValidImage(file)) {
      // Reset file input
      this.fileInput.nativeElement.value = '';
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImage = String(reader.result);
      this.imageError = '';
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    this.fileInput.nativeElement.value = '';
  }

  isValidImage(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      this.imageError = 'Invalid image type. Please use JPEG, PNG, WebP, or GIF.';
      return false;
    }
    
    if (file.size > maxSize) {
      this.imageError = 'Image too large. Maximum size is 5MB.';
      return false;
    }
    
    this.imageError = '';
    return true;
  }

  // SAVE CHANGES - Updates everything at once (username, email, phone, avatar)
  saveChanges(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach((c) => {
        c.markAsTouched();
        c.markAsDirty();
      });
      return;
    }
    
    // Check if any changes were made
    const hasChanges = this.hasProfileChanges() || this.selectedFile;
    
    if (!hasChanges) {
      this.showSuccess('No changes to save.');
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Create FormData for the update
    const formData = new FormData();
    
    // Add profile data if changed
    if (this.hasProfileChanges()) {
      if (this.profileData.username !== this.originalProfile.username) {
        formData.append('username', this.profileData.username || '');
      }
      if (this.profileData.email !== this.originalProfile.email) {
        formData.append('email', this.profileData.email || '');
      }
      if (this.profileData.phone !== this.originalProfile.phone) {
        formData.append('phone', this.profileData.phone || '');
      }
    }
    
    // Add avatar file if selected
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile, this.selectedFile.name);
    }
    // Call the combined update API
    this.authService.updateProfileWithAvatar(formData).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // If an avatar was uploaded or backend returned an avatar URL, reload the avatar
          if (this.selectedFile || response.data.avatarUrl) {
            this.avatarService.loadAvatar(this.userId).subscribe();
          }

          // Update user info
          if (response.data.profile) {
            // Update local data
            this.userEmail = response.data.profile.email || '';
            this.isVerified = response.data.profile.isVerified || false;
            this.originalProfile = { ...response.data.profile };
            
            // Update user state
            this.userState.updateUser(response.data.profile);
          }
          
          // Reset file selection
          this.selectedFile = undefined;
          
          // Show success message
          let message = 'Profile updated successfully!';
          if (response.data.requiresEmailVerification) {
            message += ' Please check your email to verify your new email address.';
          }
          this.showSuccess(message);
          
          // Reset form state
          if (this.profileForm) {
            this.profileForm.form.markAsPristine();
            this.profileForm.form.markAsUntouched();
          }
        } else {
          this.errorMessage = response.message || 'Failed to update profile.';
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Save changes error:', error);
        
        if (error.status === 409) {
          this.errorMessage = error.error?.message || 
                             'Username or email is already in use. Please try another.';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid input data. Please check your entries.';
        } else if (error.status === 413) {
          this.errorMessage = 'Image file is too large. Maximum size is 5MB.';
        } else if (error.status === 415) {
          this.errorMessage = 'Unsupported image format. Please use JPEG, PNG, WebP, or GIF.';
        } else {
          this.errorMessage = error.error?.message || 
                             error.message || 
                             'Failed to save changes. Please try again.';
        }
        this.isSubmitting = false;
      }
    });
  }

  // Check if profile data has changed
  hasProfileChanges(): boolean {
    const current = this.profileData;
    const original = this.originalProfile;
    
    return (
      (current.username || '') !== (original.username || '') ||
      (current.email || '') !== (original.email || '') ||
      (current.phone || '') !== (original.phone || '')
    );
  }

  removeAvatar() {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      this.isUploading = true;
      
      this.authService.deleteAvatar().subscribe({
        next: (response: any) => {
          if (response.success) {
            this.profileImage = 'assets/default-avatar.png';
            this.selectedFile = undefined;
            this.originalProfile.avatarUrl = '';
            this.showSuccess('Profile picture removed.');
            
            // Update user state
            this.userState.updateUser({ avatarUrl: '' });

            this.avatarService.loadAvatar(this.userId).subscribe();
          }
          this.isUploading = false;
        },
        error: (error: any) => {
          this.errorMessage = error.error?.message || 'Failed to remove avatar.';
          this.isUploading = false;
        }
      });
    }
  }

  changePassword(event: Event, form: NgForm) {
    event.preventDefault();
    console.log();
    
    if (form.invalid) {
      Object.values(form.controls).forEach((c) => c.markAsTouched());
      return;
    }
    
    // Additional validation
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }
    
    if (this.passwordData.currentPassword === this.passwordData.newPassword) {
      this.passwordError = 'New password must be different from current password.';
      return;
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.passwordData.newPassword)) {
      this.passwordError = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
      return;
    }
    
    this.isChangingPassword = true;
    this.passwordError = '';
    
    this.authService.changePassword(this.passwordData).subscribe({
      next: (response: any) => {
         if (response.success) {
          this.showSuccess('Password changed successfully!');
          this.resetPasswordForm();
        } else {
          this.passwordError = response.message || 'Failed to change password.';
        }
        this.isChangingPassword = false;
      },
      error: (error: any) => {
        this.passwordError = error.error?.message || 'Failed to change password.';
        this.isChangingPassword = false;
      }
    });
  }

  resetProfile() {
    // Reload original data
    this.profileData = {
      username: this.originalProfile.username || '',
      email: this.originalProfile.email || '',
      phone: this.originalProfile.phone || '',
    };
    
    this.selectedFile = undefined;
    this.loadAvatarFromBackend();
    this.imageError = '';
    this.errorMessage = '';
    
    if (this.profileForm) {
      this.profileForm.resetForm(this.profileData);
      this.profileForm.form.markAsPristine();
      this.profileForm.form.markAsUntouched();
    }
  }

  // Reset password form

  resetPasswordForm() {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordError = '';
    
    if (this.passwordForm) {
      this.passwordForm.resetForm();
      this.passwordForm.form.markAsPristine();
      this.passwordForm.form.markAsUntouched();
    }
  }

  setActiveTab(tab: 'profile' | 'password') {
    this.activeTab = tab;
    this.errorMessage = '';
    this.passwordError = '';
    this.imageError = '';
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  }
}