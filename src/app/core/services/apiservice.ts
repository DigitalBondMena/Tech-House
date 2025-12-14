import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
 
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // 🔹 Global API State Signals
  loading = signal(false);
  error = signal<string | null>(null);

  // 🔹 App Info Signal
  apiInfo = signal({
    baseUrl: this.baseUrl,
    appName: environment.appName,
    version: environment.version,
    isProduction: environment.production
  });

  // =======================
  // 🔹 Generic GET
  // =======================
  get<T>(endpoint: string) {
    const data = signal<T | null>(null);

    this.loading.set(true);
    this.error.set(null);

    this.http.get<T>(`${this.baseUrl}${endpoint}`).subscribe({
      next: (res) => data.set(res),
      error: (err) => {
        this.error.set(err.message ?? 'Error');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });

    return data;
  }

  // =======================
  // 🔹 POST
  // =======================
  post<T>(endpoint: string, body: unknown) {
    const data = signal<T | null>(null);

    this.loading.set(true);
    this.error.set(null);

    this.http.post<T>(`${this.baseUrl}${endpoint}`, body).subscribe({
      next: (res) => data.set(res),
      error: (err) => {
        this.error.set(err.message ?? 'Error');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });

    return data;
  }

  // =======================
  patch<T>(endpoint: string, body: unknown) {
    const data = signal<T | null>(null);

    this.loading.set(true);
    this.error.set(null);

    this.http.patch<T>(`${this.baseUrl}${endpoint}`, body).subscribe({
      next: (res) => data.set(res),
      error: (err) => {
        this.error.set(err.message ?? 'Error');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });

    return data;
  }

  // =======================
  put<T>(endpoint: string, body: unknown) {
    const data = signal<T | null>(null);

    this.loading.set(true);
    this.error.set(null);

    this.http.put<T>(`${this.baseUrl}${endpoint}`, body).subscribe({
      next: (res) => data.set(res),
      error: (err) => {
        this.error.set(err.message ?? 'Error');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });

    return data;
  }

  // =======================
  delete<T>(endpoint: string) {
    const data = signal<T | null>(null);

    this.loading.set(true);
    this.error.set(null);

    this.http.delete<T>(`${this.baseUrl}${endpoint}`).subscribe({
      next: (res) => data.set(res),
      error: (err) => {
        this.error.set(err.message ?? 'Error');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });

    return data;
  }
}
