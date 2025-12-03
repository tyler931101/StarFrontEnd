import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RegisterUser } from '../../models/register.model';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})

export class RegisterComponent {
  registerUser: RegisterUser = { username: '', email: '', password: '', confirm: '' };

  constructor(private auth: AuthService) {}

  register(form: NgForm) {
    if(form.invalid || this.registerUser.password !== this.registerUser.confirm) return;
    return this.auth.register(this.registerUser).subscribe({
      next: res => {
        form.reset();
      },
      error: err => {
        console.error(err);
      }
    })
  }
}
