import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// If you already have an AuthService in your project use that.
// This assumes an AuthService with `currentUser` and `logout()` methods.
// If your service shape differs, adapt the property names accordingly.
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  currentYear = new Date().getFullYear();
  private auth = inject(AuthService);
  private router = inject(Router);

  get userName(): string | null {
    return this.auth.getCurrentUser()?.fullName ?? null;
  }

  logout(): void {
    // keep logout logic in AuthService (best practice). Then navigate to login.
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
