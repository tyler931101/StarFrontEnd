import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserDto } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('profileForm') profileForm?: NgForm;

  profileUser: Partial<UserDto> = { username: '', email: '', phone: '' };
  originalUser: Partial<UserDto> = { ...this.profileUser };

  profileImage: string = 'assets/default-avatar.jpg';
  selectedFile?: File;

  isSubmitting = false;
  saveSuccess = false;
  submitError = '';
  imageError = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    // this.auth.getProfile().subscribe({
    //   next: (user: any) => {
    //     this.profileUser = {
    //       username: user.username || '',
    //       email: user.email || '',
    //       phone: user.phone || '',
    //     };
    //     this.originalUser = { ...this.profileUser };
    //     this.profileImage = user.profileImageUrl || this.profileImage;
    //   },
    //   error: () => (this.submitError = 'Failed to load profile.'),
    // });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    
    if (!this.isValidImage(file)) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImage = String(reader.result);
      this.imageError = '';
    };
    reader.readAsDataURL(file);
  }

  isValidImage(file: File): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
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

  uploadAvatar() {
    if (!this.selectedFile) return;
    
    this.isSubmitting = true;
    this.auth.uploadProfileImage(this.selectedFile).subscribe({
      next: (res: any) => {
        this.profileImage = res.imageUrl || this.profileImage;
        this.selectedFile = undefined;
        this.isSubmitting = false;
        this.showSuccess('Avatar uploaded successfully!');
      },
      error: (err: any) => {
        this.imageError = err?.error?.message || 'Upload failed. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  removeAvatar() {
    // Ask for confirmation before removing
    if (confirm('Are you sure you want to remove your profile picture?')) {
      this.profileImage = 'assets/default-avatar.jpg';
      this.selectedFile = undefined;
      this.showSuccess('Profile picture removed.');
    }
  }

  updateProfile(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach((c) => c.markAsTouched());
      return;
    }
    
    // Upload avatar first if new file is selected
    if (this.selectedFile) {
      this.uploadAvatar();
      // Note: In a real app, you might want to update profile after avatar upload
      return;
    }
    
    this.isSubmitting = true;
    this.auth.updateProfile(this.profileUser).subscribe({
      next: () => {
        this.originalUser = { ...this.profileUser };
        this.saveSuccess = true;
        this.isSubmitting = false;
        setTimeout(() => (this.saveSuccess = false), 3000);
      },
      error: (err: any) => {
        this.submitError = err?.error?.message || 'Failed to save changes.';
        this.isSubmitting = false;
      },
    });
  }

  reset() {
    this.profileUser = { ...this.originalUser };
    this.profileImage = String((this.originalUser as any)?.profileImageUrl ?? 'assets/default-avatar.jpg');
    this.selectedFile = undefined;
    this.imageError = '';
    this.submitError = '';
    
    if (this.profileForm) {
      this.profileForm.resetForm(this.profileUser);
    }
  }

  showSuccess(msg: string) {
    this.saveSuccess = true;
    this.submitError = '';
    setTimeout(() => {
      this.saveSuccess = false;
    }, 3000);
  }
}