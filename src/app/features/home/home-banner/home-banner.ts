import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, PLATFORM_ID, SimpleChanges, ViewChild, inject } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-home-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-banner.html',
  styleUrl: './home-banner.css'
})
export class HomeBanner implements AfterViewInit, OnChanges {
  @Input() scrollTitle?: string;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private animationInitialized = false;
  private timeline: gsap.core.Tween | gsap.core.Timeline | null = null;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  ngOnChanges(changes: SimpleChanges) {
    // Only run animations in browser, not in SSR
    if (!this.isBrowser) {
      return;
    }

    // If scrollTitle changed, re-initialize animation
    if (changes['scrollTitle'] && !changes['scrollTitle'].firstChange) {
      this.animationInitialized = false;
      setTimeout(() => {
        this.privateInitAnimation();
      }, 200);
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

    if (this.scrollTitle && this.scrollContainer) {
      setTimeout(() => {
        if (!this.animationInitialized && this.scrollContainer) {
          this.privateInitAnimation();
        }
      }, 100);
    } else if (!this.scrollTitle) {
      // If no scrollTitle yet, try again after a delay (for when data loads)
      setTimeout(() => {
        this.tryInitAnimation();
      }, 500);
    }
  }

  private privateInitAnimation() {
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
    
    // Wait a bit for DOM to calculate scrollWidth properly
    setTimeout(() => {
      const containerWidth = container.scrollWidth;
      
      if (containerWidth === 0) {
        this.animationInitialized = false;
        return;
      }

      // Calculate the width of one set of items
      // We have 5 sets in the HTML, so one set width = total width / 5
      // This ensures seamless infinite loop
      const firstSetWidth = containerWidth / 5;

      // Kill any existing tweens on the container
      gsap.killTweensOf(container);

      // Reset position to start
      gsap.set(container, { x: 0 });

      // Create infinite scroll animation with seamless loop
      // Speed = 60 pixels per second (adjust this value to change speed - higher = faster)
      const pixelsPerSecond = 60;
      const duration = Math.abs(firstSetWidth) / pixelsPerSecond;

      // Scroll from right to left (negative x direction)
      const targetX = -firstSetWidth;
      
      // Create seamless infinite scroll animation
      // Using repeat: -1 for infinite loop that never stops
      // The HTML has 5 duplicate sets, so when animation resets, it's seamless
      // Using fromTo ensures the animation starts from 0 and resets seamlessly
      const tween = gsap.fromTo(container, 
        { x: 0 },
        {
          x: targetX,
          duration: duration,
          ease: 'none',
          repeat: -1, // Infinite repeat - keeps looping forever, never stops
          immediateRender: true,
          force3D: true // Enable hardware acceleration for smoother animation
        }
      );
      
      this.timeline = tween;
      this.animationInitialized = true;
    }, 100);
  }
}
