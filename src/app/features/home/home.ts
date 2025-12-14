import { Component, OnInit, inject, computed } from '@angular/core';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { HomeAbout } from './home-about/home-about';
import { HomeServices } from './home-services/home-services';
import { HomeProjects } from './home-projects/home-projects';
import { HomeBooking } from './home-booking/home-booking';
import { HomeClientsReview } from './home-clients-review/home-clients-review';
import { HomeBanner } from './home-banner/home-banner';
import { HomeBlogs } from './home-blogs/home-blogs';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { Banner } from "../../shared/components/banner/banner";
import { HomeBannersSec } from './home-banners-sec/home-banners-sec';
import { CircleSidebar } from '../../shared/components/circle-sidebar/circle-sidebar';
import { FeatureService } from '../../core/services/featureService';
import { HomeResponse } from '../../core/models/home.model';

@Component({
  selector: 'app-home',
  imports: [HeroSection ,HomeBanner , HomeAbout,HomeBannersSec , HomeServices, HomeProjects, HomeBooking, HomeClientsReview, HomeBlogs, ContactUsSec , CircleSidebar],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private featureService = inject(FeatureService);

  // 🔹 Home Data from API
  homeData = computed(() => this.featureService.homeData());

  // 🔹 Computed properties for sections
  heroSection = computed(() => this.homeData()?.heroSection ?? null);
  aboutHome = computed(() => this.homeData()?.aboutHome ?? null);
  services = computed(() => this.homeData()?.services ?? []);
  projects = computed(() => this.homeData()?.projects ?? []);
  testimonials = computed(() => this.homeData()?.testimonials ?? []);
  blogs = computed(() => this.homeData()?.blogs ?? []);

  // 🔹 Helper method to get responsive image based on screen size
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | undefined): string {
    if (!image) return '';
    // For now, return desktop. In a real app, you'd detect screen size
    return image.desktop;
  }

  ngOnInit(): void {
    // Load home data when component initializes
    this.featureService.loadHomeData();
    
    // Scroll to top when home page loads
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
}
