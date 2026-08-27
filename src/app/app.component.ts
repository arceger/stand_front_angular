import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from './core/admin-auth.service';
import { ApiService } from './core/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  readonly auth = inject(AdminAuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly isBackendOnline = signal<boolean | null>(null);

  ngOnInit(): void {
    this.checkApiStatus();
  }

  checkApiStatus(): void {
    this.api.getFeaturedVehicles().subscribe({
      next: () => this.isBackendOnline.set(true),
      error: () => this.isBackendOnline.set(false),
    });
  }

  logout(): void {
    this.auth.clearSession();
    this.router.navigate(['/']);
  }
}
