import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, Subscription } from 'rxjs';
import { hasActiveRequests, setAutoHideSpinner } from '../../core/interceptors/loading-interceptor';
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
    // Wait for HTTP requests to complete
    // Check every 100ms until no active requests
    
    this.checkInterval = setInterval(() => {
      const noActiveRequests = !hasActiveRequests();
      
      if (noActiveRequests) {
        // All requests completed - show content and hide spinner at the same time
        clearInterval(this.checkInterval);
        this.isContentReady.set(true);
        
        // Small delay to ensure smooth transition (50ms)
        setTimeout(() => {
          this.spinner.hide();
          // Re-enable auto-hide for future requests
          setAutoHideSpinner(true);
        }, 50);
      }
    }, 100);
    
    // Fallback: show content after maximum wait time (10 seconds)
    setTimeout(() => {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
      this.isContentReady.set(true);
      this.spinner.hide();
      setAutoHideSpinner(true);
    }, 10000);
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
