import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, computed, effect, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { FeatureService } from '../../core/services/featureService';
import { SharedFeatureService } from '../../core/services/sharedFeatureService';
import { CircleSidebar } from '../../shared/components/circle-sidebar/circle-sidebar';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { HomeAbout } from './home-about/home-about';
import { HomeBanner } from './home-banner/home-banner';
import { HomeBannersSec } from './home-banners-sec/home-banners-sec';
import { HomeBlogs } from './home-blogs/home-blogs';
import { HomeBooking } from './home-booking/home-booking';
import { HomeClientsReview } from './home-clients-review/home-clients-review';
import { HomeProjects } from './home-projects/home-projects';
import { HomeServices } from './home-services/home-services';

@Component({
  selector: 'app-home',
  imports: [HeroSection ,HomeBanner , HomeAbout,HomeBannersSec , HomeServices, HomeProjects, HomeBooking, HomeClientsReview, HomeBlogs, ContactUsSec , CircleSidebar, SkeletonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit {
  private featureService = inject(FeatureService);
  private sharedFeatureService = inject(SharedFeatureService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private scrollEnabled = false;

  // 🔹 Home Data from API
  homeData = computed(() => this.featureService.homeData());

  // 🔹 Counters from SharedFeatureService
  counters = computed(() => this.sharedFeatureService.counters());

  constructor() {
    // Watch for data loading completion and enable scroll when ready
    if (this.isBrowser) {
      effect(() => {
        const allLoaded = this.isAllDataLoaded();
        if (allLoaded && !this.scrollEnabled) {
          // Wait a bit for DOM to settle
          setTimeout(() => {
            this.enableScroll();
          }, 100);
        }
      });
    }
  }

  // 🔹 Computed properties for sections
  heroSection = computed(() => this.homeData()?.heroSection ?? null);
  aboutHome = computed(() => this.homeData()?.aboutHome ?? null);
  services = computed(() => this.homeData()?.services ?? []);
  projects = computed(() => this.homeData()?.projects ?? []);
  testimonials = computed(() => this.homeData()?.testimonials ?? []);
  blogs = computed(() => this.homeData()?.blogs ?? []);
  ctasection = computed(() => this.homeData()?.ctasection ?? null);

  // 🔹 Check if all data is loaded
  isAllDataLoaded = computed(() => {
    const data = this.homeData();
    const countersData = this.counters();
    
    if (!data) return false;
    
    return !!(
      data.heroSection &&
      data.aboutHome &&
      data.services?.length > 0 &&
      data.projects?.length > 0 &&
      data.testimonials?.length > 0 &&
      data.blogs?.length > 0 &&
      data.ctasection &&
      countersData &&
      countersData.length > 0
    );
  });

  // 🔹 Helper method to get responsive image based on screen size
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | undefined): string {
    if (!image) return '';
    // For now, return desktop. In a real app, you'd detect screen size
    return image.desktop;
  }

  ngOnInit(): void {
    // Scroll to top FIRST before loading data to prevent scroll jump
    if (this.isBrowser) {
      // Force scroll to top immediately
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Prevent scroll during page load - more robust method
      this.disableScroll();
    }
  }

  ngAfterViewInit(): void {
    // Load home data when view initializes
    this.featureService.loadHomeData();
    
    // Load counters data (needed for home-about section)
    this.sharedFeatureService.loadCounters();
  }

  private disableScroll(): void {
    if (!this.isBrowser) return;
    
    // Save current scroll position
    const scrollY = window.scrollY;
    
    // Prevent scroll with multiple methods
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    this.scrollEnabled = false;
  }

  private enableScroll(): void {
    if (!this.isBrowser || this.scrollEnabled) return;
    
    // Get the scroll position that was saved
    const scrollY = document.body.style.top;
    
    // Restore scroll
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Force scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Double check after a small delay
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 50);
    
    this.scrollEnabled = true;
  }
}
