import { Component, OnInit, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { FeatureService } from '../../core/services/featureService';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-services',
  imports: [CommonModule, NgOptimizedImage, RouterModule, HeroSection, ContactUsSec],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services implements OnInit {
  private featureService = inject(FeatureService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  servicesData = computed(() => this.featureService.servicesData());
  bannerSection = computed(() => this.servicesData()?.bannerSection ?? null);
  services = computed(() => {
    const services = this.servicesData()?.services ?? [];
    return services.filter(s => s.is_active);
  });

  ngOnInit(): void {
    this.featureService.loadServicesData();

    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image) return '/images/placeholder.png';
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
    return `/Projects`;
  }
}
