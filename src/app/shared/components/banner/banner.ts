import { Component, Input, AfterViewInit, OnChanges, SimpleChanges, ViewChildren, ElementRef, QueryList, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ClientPartner } from '../../../core/models/home.model';
import { NgOptimizedImage } from '@angular/common';

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

  @ViewChildren('iconRef') icons!: QueryList<ElementRef>;

  private animationInitialized = false;
  private timeline: gsap.core.Timeline | null = null;
  private platformId = inject(PLATFORM_ID);
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

  // Get items to display (duplicate for seamless loop)
  getDisplayItems(): ClientPartner[] {
    if (this.items.length === 0) return [];
    // Duplicate items multiple times for seamless scrolling
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

    // Subscribe to QueryList changes to handle dynamic items
    this.icons.changes.subscribe(() => {
      if (this.items.length > 0 && this.icons.length > 0 && !this.animationInitialized) {
        // Only start if startAnimation is not false (i.e., true or undefined)
        if (this.startAnimation === undefined || this.startAnimation === true) {
          setTimeout(() => {
            this.privateInitAnimation();
          }, 100);
        }
      }
    });

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
      if (this.items.length > 0 && this.icons.length > 0) {
        setTimeout(() => {
          if (!this.animationInitialized && this.icons.length > 0) {
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
  public getTimeline(): gsap.core.Timeline | null {
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

    if (this.icons.length === 0) {
      this.animationInitialized = false;
      return;
    }

    const elements = this.icons.toArray().map(el => el.nativeElement).filter(el => el);
    if (elements.length === 0) {
      this.animationInitialized = false;
      return;
    }

    // Kill any existing tweens on these elements
    gsap.killTweensOf(elements);

    const isRightToLeft = this.direction === 'left'; // Default direction is right-to-left when direction is 'left'
    const startX = isRightToLeft ? 200 : -200;
    const endX = isRightToLeft ? -1000 : 1000;

    // Reset positions first
    gsap.set(elements, { x: 0, opacity: 1 });

    // Create timeline with paused: true, then play it
    this.timeline = gsap.timeline({ repeat: -1, paused: paused });

    // 1) Enter animation
    this.timeline.from(elements, {
      x: startX,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // 2) Continuous movement
    this.timeline.to(elements, {
      x: endX,
      duration: 5,
      ease: 'none',
    }, '>');

    // 3) Exit animation
    this.timeline.to(elements, {
      x: isRightToLeft ? (endX - 200) : (endX + 200),
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.in'
    }, '>');

    // Play the timeline if not paused
    if (!paused) {
      this.timeline.play();
    }
    this.animationInitialized = true;
  }
}