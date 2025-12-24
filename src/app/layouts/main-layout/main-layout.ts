import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, Subscription } from 'rxjs';
import { hasActiveRequests, setAutoHideSpinner } from '../../core/interceptors/loading-interceptor';
import { FeatureService } from '../../core/services/featureService';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit, OnDestroy {
  private router = inject(Router);
  private spinner = inject(NgxSpinnerService);
  private featureService = inject(FeatureService);
  private routerSubscription?: Subscription;
  private isInitialLoad = true;
  private checkInterval?: ReturnType<typeof setInterval>;
  
  // Signal to control visibility of layout elements
  isContentReady = signal(false);

  ngOnInit() {
    // Disable auto-hide for initial load (we'll control it manually)
    setAutoHideSpinner(false);
    
    // Hide layout initially on first load
    this.isContentReady.set(false);
    
    // Show spinner initially while content is loading
    this.spinner.show();
    
    // Listen to router events to detect when navigation completes
    this.routerSubscription = this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isInitialLoad) {
          // First load - wait for everything to be ready
          this.isInitialLoad = false;
          this.waitForInitialLoad();
        } else {
          // Subsequent navigations - enable auto-hide and show spinner
          setAutoHideSpinner(true);
          this.spinner.show();
        }
      });

    // Fallback: if router doesn't fire, start waiting after delay
    setTimeout(() => {
      if (this.isInitialLoad) {
        this.isInitialLoad = false;
        this.waitForInitialLoad();
      }
    }, 100);
  }

  private waitForInitialLoad() {
    // Wait for:
    // 1. HTTP requests to complete
    // 2. Home data to be loaded (if on home page)
    // 3. Hero section to be ready (if on home page)
    // 4. Hero image to be loaded
    
    let heroImageLoaded = false;
    let heroImageCheckStarted = false;
    
    this.checkInterval = setInterval(() => {
      const noActiveRequests = !hasActiveRequests();
      const currentUrl = this.router.url;
      const isHomePage = currentUrl.includes('/Home') || currentUrl === '/' || currentUrl === '';
      
      // Check if home data and hero section are loaded (only for home page)
      let heroReady = true;
      if (isHomePage) {
        const homeData = this.featureService.homeData();
        const heroSection = homeData?.heroSection;
        heroReady = !!heroSection;
        
        // Check if hero image is loaded (only once)
        if (heroReady && heroSection?.image && !heroImageCheckStarted) {
          heroImageCheckStarted = true;
          const heroImage = heroSection.image.desktop || heroSection.image.tablet || heroSection.image.mobile;
          if (heroImage) {
            // Check if image is loaded
            const img = new Image();
            img.onload = () => {
              heroImageLoaded = true;
            };
            img.onerror = () => {
              // If image fails to load, still proceed after a delay
              setTimeout(() => {
                heroImageLoaded = true;
              }, 1000);
            };
            img.src = heroImage;
            
            // If image is already cached, it might be loaded immediately
            if (img.complete && img.naturalWidth > 0) {
              heroImageLoaded = true;
            }
          } else {
            // No image to load
            heroImageLoaded = true;
          }
        }
        
        // Hero is ready only if data exists and image is loaded (or no image)
        heroReady = heroReady && (heroImageLoaded || !heroImageCheckStarted);
      }
      
      if (noActiveRequests && heroReady) {
        // All requests completed and hero is ready - show content and hide spinner
        clearInterval(this.checkInterval);
        this.isContentReady.set(true);
        
        // Small delay to ensure smooth transition (100ms)
        setTimeout(() => {
          this.spinner.hide();
          // Re-enable auto-hide for future requests
          setAutoHideSpinner(true);
        }, 100);
      }
    }, 150);
    
    // Fallback: show content after maximum wait time (10 seconds)
    setTimeout(() => {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
      this.isContentReady.set(true);
      this.spinner.hide();
      setAutoHideSpinner(true);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.routerSubscription?.unsubscribe();
    // Re-enable auto-hide when component is destroyed
    setAutoHideSpinner(true);
  }
}
