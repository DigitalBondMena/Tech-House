
import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, makeStateKey, PLATFORM_ID, signal, TransferState } from '@angular/core';
import { API_END_POINTS } from '../constant/ApiEndPoints';

import { AboutResponse, BlogDetailsResponse, BlogsResponse, HomeResponse, JobDetailsResponse, JobsResponse, ProjectDetailsResponse, ProjectsResponse, ServicesResponse } from '../models/home.model';
import { ApiService } from './apiservice';

// TransferState keys
const HOME_KEY = makeStateKey<HomeResponse>('home');


@Injectable({
  providedIn: 'root',
})
export class FeatureService {

  private apiService = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private transferState = inject(TransferState, { optional: true });
  private isBrowser = isPlatformBrowser(this.platformId);

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

  // 🔹 Projects Signal
  private projectsResponseSignal = signal<ProjectsResponse | null>(null);
  projectsData = computed(() => this.projectsResponseSignal());

  // 🔹 Project Details Signal
  projectDetailsResponseSignal = signal<ProjectDetailsResponse | null>(null);
  projectDetailsData = computed(() => this.projectDetailsResponseSignal());

  // 🔹 Jobs Signal
  private jobsResponseSignal = signal<JobsResponse | null>(null);
  jobsData = computed(() => this.jobsResponseSignal());

  // 🔹 Job Details Signal
  private jobDetailsResponseSignal = signal<JobDetailsResponse | null>(null);
  jobDetailsData = computed(() => this.jobDetailsResponseSignal());

  // =====================
  // HOME API
  // =====================
  loadHomeData(): void {
    // Check TransferState first (SSR data)
    if (this.transferState && this.isBrowser && this.transferState.hasKey(HOME_KEY)) {
      const serverData = this.transferState.get<HomeResponse>(HOME_KEY, {} as HomeResponse);
      if (serverData) {
        this.apiResponseSignal.set(serverData);
        this.transferState.remove(HOME_KEY);
        return;
      }
    }

    const result = this.apiService.get<HomeResponse>(API_END_POINTS.HOME);
    
    // Watch the signal and update when data arrives
    // Since the API service updates the signal asynchronously,
    // we'll check periodically until data is available
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        this.apiResponseSignal.set(data);
        // Save to TransferState if on server
        if (this.transferState && !this.isBrowser) {
          this.transferState.set(HOME_KEY, data);
        }
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

  // =====================
  // PROJECTS API
  // =====================
  loadProjectsData(page: number = 1, slug?: string): void {
    let endpoint = `${API_END_POINTS.PROJECTS}?page=${page}`;
    if (slug) {
      endpoint = `/projects/${slug}?page=${page}`;
    }
    const result = this.apiService.get<ProjectsResponse>(endpoint);
    
    // Watch the signal and update when data arrives
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        this.projectsResponseSignal.set(data);
        clearInterval(checkInterval);
      }
    }, 50);

    // Clean up after 30 seconds if no data arrives (timeout)
    setTimeout(() => clearInterval(checkInterval), 30000);
  }

  // =====================
  // PROJECT DETAILS API
  // =====================
  loadProjectDetails(slug: string): void {
    // Reset previous data
    this.projectDetailsResponseSignal.set(null);
    
    // Encode the slug to handle Arabic characters
    const encodedSlug = encodeURIComponent(slug);
    const endpoint = API_END_POINTS.PROJECT_DETAILS.replace('{slug}', encodedSlug);
    
    // Try both response types - sometimes API might return different structure
    const result = this.apiService.get<any>(endpoint);
    
    // Watch the signal and update when data arrives
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        
        // Check if it's ProjectDetailsResponse (has project property)
        if (data.project) {
          this.projectDetailsResponseSignal.set(data as ProjectDetailsResponse);
          clearInterval(checkInterval);
        }
        // Check if it's ProjectsResponse (has projects array) - extract the matching project
        else if (data.projects && Array.isArray(data.projects.data)) {
          const projectItem = data.projects.data.find((p: any) => p.slug === slug);
          if (projectItem) {
            this.projectDetailsResponseSignal.set({
              project: projectItem as any
            } as ProjectDetailsResponse);
            clearInterval(checkInterval);
          } else {
            console.warn('Project not found in list');
            // Set null to trigger error state
            this.projectDetailsResponseSignal.set(null);
            clearInterval(checkInterval);
          }
        }
        // If data has project at root level (direct project object)
        else if (data.id && data.slug) {
          this.projectDetailsResponseSignal.set({
            project: data
          } as ProjectDetailsResponse);
          clearInterval(checkInterval);
        }
        else {
          console.warn('Unknown data format:', data);
          this.projectDetailsResponseSignal.set(null);
          clearInterval(checkInterval);
        }
      }
    }, 50);

    // Clean up after 30 seconds if no data arrives (timeout)
    setTimeout(() => {
      clearInterval(checkInterval);
      const finalData = result();
      if (!finalData) {
        console.error('Failed to load project details after timeout');
      }
    }, 30000);
  }

  // =====================
  // JOBS API
  // =====================
  loadJobsData(categoryId?: number): void {
    let endpoint = API_END_POINTS.JOBS;
    if (categoryId) {
      endpoint = API_END_POINTS.JOB_BY_CATEGORY.replace('{category_id}', categoryId.toString());
    }
    const result = this.apiService.get<JobsResponse>(endpoint);
    
    // Watch the signal and update when data arrives
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        this.jobsResponseSignal.set(data);
        clearInterval(checkInterval);
      }
    }, 50);

    // Clean up after 30 seconds if no data arrives (timeout)
    setTimeout(() => clearInterval(checkInterval), 30000);
  }

  // =====================
  // JOB DETAILS API
  // =====================
  loadJobDetails(slug: string): void {
    // Reset previous data
    this.jobDetailsResponseSignal.set(null);
    
    // Encode the slug to handle Arabic characters
    const encodedSlug = encodeURIComponent(slug);
    const endpoint = API_END_POINTS.JOB_DETAILS.replace('{slug}', encodedSlug);
    
    const result = this.apiService.get<JobDetailsResponse>(endpoint);
    
    // Watch the signal and update when data arrives
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        this.jobDetailsResponseSignal.set(data);
        clearInterval(checkInterval);
      }
    }, 50);

    // Clean up after 30 seconds if no data arrives (timeout)
    setTimeout(() => clearInterval(checkInterval), 30000);
  }

  // =====================
  // SUBMIT JOB APPLICATION
  // =====================
  submitJobApplication(formData: FormData) {
    return this.apiService.post<any>(API_END_POINTS.SUBMIT_JOB_FORM, formData);
  }
}