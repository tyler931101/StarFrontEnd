import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserStateService } from '../../services/user-state.service';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {
  user: any;
  dropdownOpen = signal(false);

  constructor(
    private userState: UserStateService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.userState.user;
  }

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  goProfile() {
    this.dropdownOpen.set(false);
    this.router.navigate(['/profile']);
  }

  logout() {
    this.dropdownOpen.set(false);
    this.auth.logout().subscribe();
  }
}