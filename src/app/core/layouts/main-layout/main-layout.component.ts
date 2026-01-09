import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";
import { AuthService } from '../../../../app/features/auth/services/auth.service';
import { UserStateService } from 'app/core/services/user-state.service';
import { Subject, takeUntil } from 'rxjs';

import { AvatarService } from 'app/core/services/avatar.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  imports: [RouterModule, CommonModule]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isDropdownvisible: boolean = false;
  profileImage: string = 'assets/default-avatar.png';

  private destroy$ = new Subject<void>();
  private userState = inject(UserStateService);

  constructor(
    private authService: AuthService, 
    private avatarService: AvatarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.authService.currentUserId;
    if (userId) {
      this.avatarService.getAvatar(userId).pipe(
        takeUntil(this.destroy$)
      ).subscribe(url => {
        this.profileImage = url;
        this.cdr.detectChanges();
      });
    }

    this.userState.avatarChanged$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (userId) {
        this.avatarService.loadAvatar(userId).subscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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


}
