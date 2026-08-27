import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AdminAuthService } from '../../core/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  email = 'admin@stand.local';
  password = 'Admin123!';

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  submitLogin(): void {
    if (!this.email.trim() || !this.password) {
      this.errorMessage.set('Preencha o e-mail e a senha.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.api.login(this.email.trim(), this.password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.auth.setSession(response.token, response.fullName);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error('Erro de login:', err);
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message ||
            'Credenciais inválidas. Verifique o e-mail e a senha informados.'
        );
      },
    });
  }
}

