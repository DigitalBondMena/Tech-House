
import { Injectable, inject, signal, computed } from '@angular/core';
import { API_END_POINTS } from '../constant/ApiEndPoints';

import { HomeResponse, AboutResponse, ServicesResponse, BlogsResponse, BlogDetailsResponse, ProjectsResponse, ProjectDetailsResponse, JobsResponse } from '../models/home.model';
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

  // 🔹 Projects Signal
  private projectsResponseSignal = signal<ProjectsResponse | null>(null);
  projectsData = computed(() => this.projectsResponseSignal());

  // 🔹 Project Details Signal
  projectDetailsResponseSignal = signal<ProjectDetailsResponse | null>(null);
  projectDetailsData = computed(() => this.projectDetailsResponseSignal());

  // 🔹 Jobs Signal
  private jobsResponseSignal = signal<JobsResponse | null>(null);
  jobsData = computed(() => this.jobsResponseSignal());

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
    
    console.log('Loading project details for slug:', slug);
    console.log('Encoded slug:', encodedSlug);
    console.log('Endpoint:', endpoint);
    
    // Try both response types - sometimes API might return different structure
    const result = this.apiService.get<any>(endpoint);
    
    // Watch the signal and update when data arrives
    const checkInterval = setInterval(() => {
      const data = result();
      if (data) {
        console.log('Raw API response:', data);
        
        // Check if it's ProjectDetailsResponse (has project property)
        if (data.project) {
          console.log('Data is ProjectDetailsResponse format');
          this.projectDetailsResponseSignal.set(data as ProjectDetailsResponse);
          clearInterval(checkInterval);
        }
        // Check if it's ProjectsResponse (has projects array) - extract the matching project
        else if (data.projects && Array.isArray(data.projects.data)) {
          console.log('Data is ProjectsResponse format, searching for project...');
          const projectItem = data.projects.data.find((p: any) => p.slug === slug);
          if (projectItem) {
            console.log('Found project in list:', projectItem);
            // Convert ProjectItem to ProjectDetail format
            // Note: This might not have all fields, so we need to make another API call
            // For now, let's try to get full details
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
          console.log('Data is direct project object');
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
}