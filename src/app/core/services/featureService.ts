import { Injectable, inject, signal, computed } from '@angular/core';
import { API_END_POINTS } from '../constant/ApiEndPoints';

import { HomeResponse, AboutResponse, ServicesResponse } from '../models/home.model';
import { ApiService } from './apiService';


@Injectable({
  providedIn: 'root',
})
export class FeatureService {

  private apiService = inject(ApiService);

  // 🔹 Internal API Response Signal Reference
  private apiResponseSignal = signal<HomeResponse | null>(null);
  private aboutResponseSignal = signal<AboutResponse | null>(null);
  private servicesResponseSignal = signal<ServicesResponse | null>(null);

  // 🔹 Home Data Signal (computed from API response)
  homeData = computed(() => this.apiResponseSignal());

  // 🔹 About Data Signal (computed from API response)
  aboutData = computed(() => this.aboutResponseSignal());

  // 🔹 Services Data Signal (computed from API response)
  servicesData = computed(() => this.servicesResponseSignal());

  // =====================
  // HOME API
  // =====================
  loadHomeData(): void {
    const result = this.apiService.get<HomeResponse>(API_END_POINTS.HOME);
    
    // Watch the signal and update when data arrives
    // Since the API service updates the signal asynchronously,
    // we'll check periodically until data is available
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        this.apiResponseSignal.set(data);
        clearInterval(checkInterval);
      }
    }, 50);

    // Clean up after 30 seconds if no data arrives (timeout)
    setTimeout(() => clearInterval(checkInterval), 30000);
  }

  // =====================
  // ABOUT API
  // =====================
  loadAboutData(): void {
    const result = this.apiService.get<AboutResponse>(API_END_POINTS.ABOUT);
    
    // Watch the signal and update when data arrives
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        this.aboutResponseSignal.set(data);
        clearInterval(checkInterval);
      }
    }, 50);

    // Clean up after 30 seconds if no data arrives (timeout)
    setTimeout(() => clearInterval(checkInterval), 30000);
  }

  // =====================
  // SERVICES API
  // =====================
  loadServicesData(): void {
    const result = this.apiService.get<ServicesResponse>(API_END_POINTS.SERVICES);
    
    // Watch the signal and update when data arrives
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        this.servicesResponseSignal.set(data);
        clearInterval(checkInterval);
      }
    }, 50);

    // Clean up after 30 seconds if no data arrives (timeout)
    setTimeout(() => clearInterval(checkInterval), 30000);
  }
}