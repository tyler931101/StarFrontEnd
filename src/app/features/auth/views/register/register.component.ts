import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RegisterUser } from '../../models/register.model';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})

export class RegisterComponent {
  registerUser: RegisterUser = { username: '', email: '', password: '', confirm: '' };

  constructor(private auth: AuthService) {}

  register(form: NgForm) {
    if(form.invalid || this.registerUser.password !== this.registerUser.confirm) return;
    return this.auth.register(this.registerUser).subscribe({
      next: res => {
        console.log('register', res);
        alert(res.message || 'Registration successful. Please check your email to verify your account.');
        form.reset();
      },
      error: err => {
        console.error(err);
        alert(err.error || 'Registration failed. Try again.');
      }
    })
  }
}
