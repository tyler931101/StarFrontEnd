import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  message = 'Verifying your account...';
  success = false;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.message = 'Invalid or missing verification link.';
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: res => {
        this.message = 'Email verified successfully! Redirecting to login...';
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: err => {
        console.error(err);
        this.message = 'Verification failed or token expired.';
      }
    });
  }
}