import { Component } from '@angular/core';
import { AuthService } from '../../viewmodels/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginUser } from '../../models/login.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginUser: LoginUser = { email: '', password: '' };

  constructor(private auth: AuthService) {}

  login(form: NgForm) {
    if(form.invalid) return;
    this.auth.login(this.loginUser).subscribe({
      next: res => console.log('Logged in'),
      error: err => console.log(err)
    });
  }
}
