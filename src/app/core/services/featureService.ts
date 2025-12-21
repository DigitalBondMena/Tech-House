
import { Injectable, inject, signal, computed } from '@angular/core';
import { API_END_POINTS } from '../constant/ApiEndPoints';

import { HomeResponse, AboutResponse, ServicesResponse, BlogsResponse, BlogDetailsResponse } from '../models/home.model';
import { ApiService } from './apiservice';


@Injectable({
  providedIn: 'root',
})
export class FeatureService {

  private apiService = inject(ApiService);

  // 🔹 Internal API Response Signal Reference
  private apiResponseSignal = signal<HomeResponse | null>(null);
  private aboutResponseSignal = signal<AboutResponse | null>(null);
  private servicesResponseSignal = signal<ServicesResponse | null>(null);
  private blogsResponseSignal = signal<BlogsResponse | null>(null);

  // 🔹 Home Data Signal (computed from API response)
  homeData = computed(() => this.apiResponseSignal());

  // 🔹 About Data Signal (computed from API response)
  aboutData = computed(() => this.aboutResponseSignal());

  // 🔹 Services Data Signal (computed from API response)
  servicesData = computed(() => this.servicesResponseSignal());

  // 🔹 Blogs Data Signal (computed from API response)
  blogsData = computed(() => this.blogsResponseSignal());

  // 🔹 Blog Details Signal
  private blogDetailsResponseSignal = signal<BlogDetailsResponse | null>(null);
  blogDetailsData = computed(() => this.blogDetailsResponseSignal());

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

  // =====================
  // BLOGS API
  // =====================
  loadBlogsData(page: number = 1): void {
    const endpoint = `${API_END_POINTS.BLOGS}?page=${page}`;
    const result = this.apiService.get<BlogsResponse>(endpoint);
    
    // Watch the signal and update when data arrives
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        this.blogsResponseSignal.set(data);
        clearInterval(checkInterval);
      }
    }, 50);

    // Clean up after 30 seconds if no data arrives (timeout)
    setTimeout(() => clearInterval(checkInterval), 30000);
  }

  // =====================
  // BLOG DETAILS API
  // =====================
  loadBlogDetails(slug: string): void {
    const endpoint = API_END_POINTS.BLOG_DETAILS.replace('{slug}', slug);
    const result = this.apiService.get<BlogDetailsResponse>(endpoint);
    
    // Watch the signal and update when data arrives
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        this.blogDetailsResponseSignal.set(data);
        clearInterval(checkInterval);
      }
    }, 50);

    // Clean up after 30 seconds if no data arrives (timeout)
    setTimeout(() => clearInterval(checkInterval), 30000);
  }
}