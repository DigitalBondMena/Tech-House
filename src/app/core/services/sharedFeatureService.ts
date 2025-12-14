import { Injectable, inject, signal, computed } from '@angular/core';
import { API_END_POINTS } from '../constant/ApiEndPoints';
import { ApiService } from './apiService';
import { Counter, CountersResponse } from '../models/home.model';

@Injectable({
  providedIn: 'root',
})
export class SharedFeatureService {
  private apiService = inject(ApiService);

  // 🔹 Internal API Response Signal Reference
  private countersResponseSignal = signal<Counter[] | null>(null);

  // 🔹 Counters Data Signal (computed from API response)
  counters = computed(() => this.countersResponseSignal());

  // =====================
  // COUNTERS API
  // =====================
  loadCounters(): void {
    const result = this.apiService.get<CountersResponse>(API_END_POINTS.COUNTERS);
    
    // Watch the signal and update when data arrives
    const checkInterval = setInterval(() => {
      const data = result();
      if (data && data.counters) {
        this.countersResponseSignal.set(data.counters);
        clearInterval(checkInterval);
      }
    }, 50);

    // Clean up after 30 seconds if no data arrives (timeout)
    setTimeout(() => clearInterval(checkInterval), 30000);
  }
}
