import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // CommonModule for directives like *ngIf
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    const loginData = { email: this.email, password: this.password };

    this.authService.login(loginData).subscribe({
      next: () => {
        console.log('Login successful:', this.email);
        this.router.navigate(['/dashboard']); // ✅ redirect after login
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
      },
    });
  }
}
