import { Component, HostListener, OnDestroy, OnInit, PLATFORM_ID, signal, inject, NgZone } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { rafThrottle } from '../../../core/utils/performance.utils';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private isBrowser = isPlatformBrowser(this.platformId);
  private throttledScrollHandler?: () => void;

  ngOnInit(): void {
    if (this.isBrowser) {
      // Run scroll handler outside Angular's change detection to reduce reflow
      this.throttledScrollHandler = rafThrottle(() => {
        this.ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            const scrollPosition = window.scrollY;
            // Only update signal inside Angular zone
            this.ngZone.run(() => {
              this.isScrolled.set(scrollPosition > 100);
            });
          });
        });
      });
      
      // Use passive event listener for better scroll performance
      window.addEventListener('scroll', this.throttledScrollHandler, { passive: true });
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.throttledScrollHandler) {
      window.removeEventListener('scroll', this.throttledScrollHandler);
    }
  }

  // Keep @HostListener for backward compatibility but make it no-op in browser
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Handler moved to ngOnInit with better performance
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
