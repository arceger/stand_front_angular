import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'stand-admin-token';
const USER_KEY = 'stand-admin-user';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly tokenState = signal<string | null>(this.readStorage(TOKEN_KEY));
  private readonly userState = signal<string | null>(this.readStorage(USER_KEY));

  readonly token = computed(() => this.tokenState());
  readonly userName = computed(() => this.userState());
  readonly isAuthenticated = computed(() => !!this.tokenState());

  setSession(token: string, userName: string): void {
    this.tokenState.set(token);
    this.userState.set(userName);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, userName);
  }

  clearSession(): void {
    this.tokenState.set(null);
    this.userState.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private readStorage(key: string): string | null {
    return typeof window === 'undefined' ? null : localStorage.getItem(key);
  }
}
