import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, PLATFORM_ID, SimpleChanges, ViewChild, inject, NgZone } from '@angular/core';
import { gsap } from 'gsap';
import { ClientPartner } from '../../../core/models/home.model';

@Component({
  selector: 'app-banner',
  imports: [NgOptimizedImage],
  templateUrl: './banner.html',
  styleUrl: './banner.css'
})
export class Banner implements AfterViewInit, OnChanges {
  @Input() customClass: string = '';
  @Input() direction: 'left' | 'right' = 'left'; // 'left' for right-to-left, 'right' for left-to-right
  @Input() items: ClientPartner[] = []; // Array of client/partner items
  @Input() startAnimation?: boolean; // Control when to start animation (optional)

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private animationInitialized = false;
  private timeline: gsap.core.Tween | gsap.core.Timeline | null = null;
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Helper method to get responsive image
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image) return '/images/placeholder.png';
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) {
        return image.mobile || image.desktop || '/images/placeholder.png';
      } else if (width < 1024) {
        return image.tablet || image.desktop || '/images/placeholder.png';
      }
    }
    return image.desktop || '/images/placeholder.png';
  }

  // Get items to display (duplicate for seamless infinite loop)
  getDisplayItems(): ClientPartner[] {
    if (this.items.length === 0) return [];
    // Duplicate items enough times for seamless infinite scrolling (at least 2 sets)
    return [...this.items, ...this.items, ...this.items];
  }

  ngOnChanges(changes: SimpleChanges) {
    // Only run animations in browser, not in SSR
    if (!this.isBrowser) {
      return;
    }

    // If items changed, re-initialize animation
    if (changes['items'] && !changes['items'].firstChange) {
      this.animationInitialized = false;
      setTimeout(() => {
        this.privateInitAnimation();
      }, 200);
    }

    // If startAnimation changed to true and we haven't started yet, start the animation
    if (changes['startAnimation']) {
      if (this.startAnimation === true && !this.animationInitialized) {
        setTimeout(() => {
          this.tryInitAnimation();
        }, 100);
      } else if (this.startAnimation === false && this.animationInitialized) {
        // If startAnimation changed to false, stop animation
        if (this.timeline) {
          this.timeline.kill();
          this.timeline = null;
        }
        this.animationInitialized = false;
      }
    }
  }

  ngAfterViewInit() {
    // Only run animations in browser, not in SSR
    if (!this.isBrowser) {
      return;
    }

    // Try to initialize animation
    this.tryInitAnimation();
  }

  private tryInitAnimation() {
    // Only run animations in browser, not in SSR
    if (!this.isBrowser) {
      return;
    }

    // If startAnimation is explicitly set to false, wait for it to become true
    // If it's undefined (not provided), start normally
    if (this.startAnimation === false) {
      // We're waiting for startAnimation to be true
      return;
    }

    // If startAnimation is undefined (not provided), start normally
    // If startAnimation is true, start immediately
    if (this.startAnimation === undefined || this.startAnimation === true) {
      if (this.items.length > 0 && this.scrollContainer) {
        setTimeout(() => {
          if (!this.animationInitialized && this.scrollContainer) {
            this.privateInitAnimation();
          }
        }, 100);
      } else if (this.items.length === 0) {
        // If no items yet, try again after a delay (for when data loads)
        setTimeout(() => {
          this.tryInitAnimation();
        }, 500);
      }
    }
  }

  // Public method to prepare animation (create timeline but don't start)
  public prepareAnimation(): void {
    if (!this.isBrowser || this.animationInitialized) {
      return;
    }

    // Prepare the animation immediately
    this.privateInitAnimation(true); // true = paused
  }

  // Public method to get the timeline (for parent to control)
  public getTimeline(): gsap.core.Tween | gsap.core.Timeline | null {
    return this.timeline;
  }

  // Public method to start animation (called by parent when both banners are ready)
  public startAnimationNow(): void {
    if (!this.isBrowser) {
      return;
    }

    // If animation is already initialized, just play it
    if (this.timeline && this.timeline.paused()) {
      this.timeline.play();
      return;
    }

    // Otherwise prepare and start
    this.privateInitAnimation(false); // false = start immediately
  }

  private privateInitAnimation(paused: boolean = false) {
    // Only run animations in browser, not in SSR
    if (!this.isBrowser) {
      return;
    }

    // Kill existing animation if any
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }

    if (!this.scrollContainer || !this.scrollContainer.nativeElement) {
      this.animationInitialized = false;
      return;
    }

    const container = this.scrollContainer.nativeElement;
    
    // Run measurements outside Angular's change detection to reduce reflow
    this.ngZone.runOutsideAngular(() => {
      // Use requestAnimationFrame to ensure DOM is ready and reduce reflow
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Measure container width in RAF to avoid force reflow
          requestAnimationFrame(() => {
            const containerWidth = container.scrollWidth;
            
            if (containerWidth === 0) {
              this.animationInitialized = false;
              return;
            }

            // Calculate the width of one set of items (original items)
            // Since we duplicated items 3 times, one set is containerWidth / 3
            const singleSetWidth = containerWidth / 3;
            
            // Run animation setup back inside Angular zone
            this.ngZone.run(() => {
              this.setupAnimation(container, singleSetWidth, paused);
            });
          });
        }, 100); // Reduced delay since we're using RAF
      });
    });
  }

  private setupAnimation(container: HTMLElement, singleSetWidth: number, paused: boolean = false): void {
    if (!this.isBrowser) {
      return;
    }

    // Kill any existing tweens on the container
    gsap.killTweensOf(container);

    const isRightToLeft = this.direction === 'left'; // Default direction is right-to-left when direction is 'left'

    // Reset position to start
    gsap.set(container, { x: 0 });

    // Create infinite scroll animation with seamless loop
    // Calculate duration based on distance to maintain consistent speed (pixels per second)
    // Speed = 60 pixels per second (faster - adjust this value to change speed - higher = faster)
    const pixelsPerSecond = 60;
    const duration = Math.abs(singleSetWidth) / pixelsPerSecond;

    const targetX = isRightToLeft ? -singleSetWidth : singleSetWidth;
    
    // Create seamless infinite scroll using fromTo for proper seamless loop
    // fromTo ensures that when repeat happens, it starts from 0 again seamlessly
    // Since items are duplicated (3 sets), when we move by singleSetWidth and repeat from 0,
    // the duplicated items will be in the same position, creating a seamless loop
    const tween = gsap.fromTo(container,
      { x: 0 },
      {
        x: targetX,
        duration: duration,
        ease: 'none',
        repeat: -1,
        paused: paused,
        immediateRender: false
      }
    );
    
    this.timeline = tween;
    
    this.animationInitialized = true;
  }
}