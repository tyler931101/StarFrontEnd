import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginUser } from '../../models/login.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginUser: LoginUser = { email: '', password: '' };
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login(form: NgForm) {
    if (form.invalid) return;
    this.auth.login(this.loginUser).subscribe({
      next: (res) => console.log(''),
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Login Failed.';
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register'])
  }
}
