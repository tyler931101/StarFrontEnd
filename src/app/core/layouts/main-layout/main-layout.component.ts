import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";
import { AuthService } from '../../../../app/features/auth/services/auth.service';
import { UserStateService } from 'app/core/services/user-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  imports: [RouterModule, CommonModule]
})
export class MainLayoutComponent implements OnInit {
  isDropdownvisible: boolean = false;
  profileImage: string = 'assets/default-avatar.png';

  private destroy$ = new Subject<void>();
  private userState = inject(UserStateService);

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if(this.profileImage !== 'assets/default-avatar.png') {
      this.loadAvatarFromBackend();
    }
    
    this.userState.avatarChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Avatar change detected, reloading...');
        this.loadAvatarFromBackend();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up blob URLs
    if (this.profileImage.startsWith('blob:')) {
      URL.revokeObjectURL(this.profileImage);
    }
  }

  toggleDropdown() {
    this.isDropdownvisible = !this.isDropdownvisible;
  }

  logout() {
    this.authService.logout();
  }

  viewProfile() {
    this.authService.navigateToProfile();
    this.isDropdownvisible = false;
  }

  loadAvatarFromBackend(): void {
    if (!this.authService.currentUserId) return;

    this.profileImage = 'assets/default-avatar.png'; // Show default while loading
    this.cdr.detectChanges();
    
    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();

    this.authService.getUserAvatar(this.authService.currentUserId, timestamp).subscribe({
      next: (blob: Blob) => {
        this.createImageFromBlob(blob);
          this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.log('Using default avatar');
        // Use default avatar if API fails
        this.profileImage = 'assets/default-avatar.png';
        this.cdr.detectChanges();
      }
    });
  }

  // Convert Blob to image URL
  async createImageFromBlob(blob: Blob): Promise<void> {
    try {
      // Check if blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Empty blob received');
      }

      // Create object URL for better performance (instead of data URL)
      const objectUrl = URL.createObjectURL(blob);
      
      // Preload image to ensure it's valid
      const img = new Image();
      img.onload = () => {
        // Clean up previous object URL if exists
        if (this.profileImage.startsWith('blob:')) {
          URL.revokeObjectURL(this.profileImage);
        }
        
        this.profileImage = objectUrl;
        this.cdr.detectChanges();
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        this.profileImage = 'assets/default-avatar.png';
        this.cdr.detectChanges();
      };
      
      img.src = objectUrl;
      
    } catch (error) {
      console.error('Error processing image blob:', error);
      this.profileImage = 'assets/default-avatar.png';
      this.cdr.detectChanges();
    }
  }
}
