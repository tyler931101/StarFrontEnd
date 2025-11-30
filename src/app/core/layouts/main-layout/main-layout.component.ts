import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";
import { AuthService } from '../../../../app/features/auth/services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  imports: [RouterModule, CommonModule]
})
export class MainLayoutComponent {
  isDropdownvisible: boolean = false;
  constructor(private authService: AuthService) {}

  toggleDropdown() {
    this.isDropdownvisible = !this.isDropdownvisible;
  }

  logout() {
    this.authService.logout();
  }

  viewProfile() {
    this.authService.navigateToProfile();
  }
}
