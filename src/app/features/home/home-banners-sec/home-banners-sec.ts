import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, AfterViewInit, Component, computed, effect, inject, OnDestroy, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { SharedFeatureService } from '../../../core/services/sharedFeatureService';
import { BannerReverse } from '../../../shared/components/banner-reverse/banner-reverse';
import { Banner } from '../../../shared/components/banner/banner';
import { SectionTitle } from '../../../shared/components/section-title/section-title';

@Component({
  selector: 'app-home-banners-sec',
  imports: [SectionTitle, Banner, BannerReverse, SkeletonModule],
  templateUrl: './home-banners-sec.html',
  styleUrl: './home-banners-sec.css'
})
export class HomeBannersSec implements OnInit, AfterViewInit, OnDestroy {
  private sharedFeatureService = inject(SharedFeatureService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('partnersBanner', { static: false }) partnersBanner!: Banner;
  @ViewChild('clientsBanner', { static: false }) clientsBanner!: BannerReverse;

  //! section title data
  partenersTitle = "شركاؤنا";
  clientsTitle = "عملائنا";

  //! Get partners and clients from service
  partners = computed(() => this.sharedFeatureService.partners());
  clients = computed(() => this.sharedFeatureService.clients());

  // Signal to control when to start animations (both banners together)
  startAnimations = signal(false);
  private animationStarted = false;
  private intersectionObserver?: IntersectionObserver;
  private sectionElement?: HTMLElement;

  constructor() {
    // Use effect to wait for both banners to have data
    effect(() => {
      const partnersData = this.partners();
      const clientsData = this.clients();
      
      // Start animations when both have data - but only when in viewport
      if (partnersData.length > 0 && clientsData.length > 0 && !this.animationStarted) {
        // Use IntersectionObserver to delay animations until section is visible
        this.setupIntersectionObserver();
      }
    });
  }

  ngOnInit(): void {
    // Load data in ngOnInit (runs on both server and client)
    // Note: This may be called from parent component (home) as well, but loadPartnersClients has guard to prevent duplicate calls
    // Subscribe to Observable - data will be set in signal automatically
    this.sharedFeatureService.loadPartnersClients().subscribe();
  }

  ngAfterViewInit(): void {
    // Check if data is already loaded
    if (this.partners().length > 0 && this.clients().length > 0 && !this.animationStarted) {
      // Setup intersection observer to delay animations until visible
      afterNextRender(() => {
        this.setupIntersectionObserver();
      });
    }
  }

  private setupIntersectionObserver(): void {
    const isBrowser = isPlatformBrowser(this.platformId);
    if (!isBrowser || this.animationStarted) return;

    // Clean up existing observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      const element = document.querySelector('app-home-banners-sec');
      if (!element) {
        // Fallback: start animations after a delay if element not found
        setTimeout(() => {
          if (!this.animationStarted) {
            this.startAnimationsTogether();
          }
        }, 1000);
        return;
      }

      this.sectionElement = element as HTMLElement;

      // Create IntersectionObserver to start animations only when section is visible
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.animationStarted) {
              // Section is visible, start animations
              this.startAnimationsTogether();
              // Disconnect observer after starting animations
              if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
              }
            }
          });
        },
        {
          rootMargin: '150px', // Start loading 150px before section is visible
          threshold: 0.05 // Trigger when 5% of section is visible
        }
      );

      this.intersectionObserver.observe(this.sectionElement);
    }, 100);
  }

  private startAnimationsTogether(): void {
    if (this.animationStarted) return;
    
    const isBrowser = isPlatformBrowser(this.platformId);
    if (!isBrowser) return;
    
    // Retry mechanism for @defer blocks - ViewChild may not be available immediately
    const maxRetries = 15;
    let retryCount = 0;
    
    const tryStartAnimations = () => {
      if (this.partnersBanner && this.clientsBanner) {
        // Both ViewChild references are available
        // Use requestIdleCallback for better performance if available
        const startAnimations = () => {
          if (this.partners().length > 0) {
            this.partnersBanner.startAnimationNow();
          }
          if (this.clients().length > 0) {
            this.clientsBanner.startAnimationNow();
          }
          this.animationStarted = true;
        };

        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(startAnimations, { timeout: 1000 });
        } else {
          setTimeout(startAnimations, 0);
        }
      } else if (retryCount < maxRetries) {
        // ViewChild not available yet, retry after a short delay
        retryCount++;
        setTimeout(tryStartAnimations, 150);
      }
    };
    
    // Start trying after a short delay
    setTimeout(tryStartAnimations, 300);
  }

  ngOnDestroy(): void {
    // Clean up intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}
