import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { AfterViewInit, Component, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { FeatureService } from '../../core/services/featureService';
import { SharedFeatureService } from '../../core/services/sharedFeatureService';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { HeroSection } from '../../shared/components/hero-section/hero-section';

@Component({
  selector: 'app-services',
  imports: [CommonModule, NgOptimizedImage, RouterModule, HeroSection, ContactUsSec],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services implements OnInit, AfterViewInit {
  private featureService = inject(FeatureService);
  private sharedFeatureService = inject(SharedFeatureService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  servicesData = computed(() => this.featureService.servicesData());
  bannerSection = computed(() => this.servicesData()?.bannerSection ?? null);
  services = computed(() => {
    const services = this.servicesData()?.services ?? [];
    return services.filter(s => s.is_active);
  });
  serviceTitles = computed(() => this.sharedFeatureService.servicesSection() ?? []);

  ngOnInit(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  ngAfterViewInit(): void {
    // Load services data when view initializes
    this.featureService.loadServicesData();
    // Load service titles for slug matching
    this.sharedFeatureService.loadServicesSection();
  }

  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image) return '/images/placeholder.webp';
    let imageUrl = '';
    if (this.isBrowser) {
      const width = window.innerWidth;
      if (width < 768) imageUrl = image.mobile || image.desktop || '';
      else if (width < 1024) imageUrl = image.tablet || image.desktop || '';
      else imageUrl = image.desktop || '';
    } else imageUrl = image.desktop || '';
    return this.addBaseUrlIfNeeded(imageUrl);
  }

  private addBaseUrlIfNeeded(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}/${cleanUrl}`;
  }

  getProjectsUrl(service: any): string {
    return '/Projects';
  }

  getServiceQueryParams(service: any): { service?: string } {
    // Try to find matching service title by title to get slug
    const matchingServiceTitle = this.serviceTitles().find(st => st.title === service.title);
    if (matchingServiceTitle?.slug) {
      return { service: matchingServiceTitle.slug };
    }
    return {};
  }
}
