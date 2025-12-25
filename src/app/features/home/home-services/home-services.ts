import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, PLATFORM_ID, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Service } from '../../../core/models/home.model';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { SectionTitle } from '../../../shared/components/section-title/section-title';

// Only register plugin in browser
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

@Component({
  selector: 'app-home-services',
  imports: [SectionTitle, AppButton, NgOptimizedImage],
  templateUrl: './home-services.html',
  styleUrl: './home-services.css',
  standalone: true
})
export class HomeServices implements AfterViewInit {
  @Input() services: Service[] = [];

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  //! section title data
  servicesTitle = "خدماتنا";

  //! button data
  btnText = "خدمات اكثر";

  // Helper method to get responsive image
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | undefined): string {
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

  // Right side elements (titles for even-indexed services)
  @ViewChild('titleRight1') titleRight1!: ElementRef;
  @ViewChild('titleBgRight1') titleBgRight1!: ElementRef;
  @ViewChild('titleRight2') titleRight2!: ElementRef;
  @ViewChild('titleBgRight2') titleBgRight2!: ElementRef;
  
  // Left side elements (titles for odd-indexed services)
  @ViewChild('titleLeft1') titleLeft1!: ElementRef;
  @ViewChild('titleBgLeft1') titleBgLeft1!: ElementRef;
  @ViewChild('titleLeft2') titleLeft2!: ElementRef;
  @ViewChild('titleBgLeft2') titleBgLeft2!: ElementRef;
  
  // Image elements
  @ViewChildren('imgEl') images!: QueryList<ElementRef>;

  ngAfterViewInit() {
    // Only run animations in browser environment
    if (!this.isBrowser) {
      return;
    }

    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      // Animate right side titles (appearing from left to right)
      if (this.titleRight1?.nativeElement && this.titleBgRight1?.nativeElement) {
        this.animateTitle(this.titleRight1.nativeElement, this.titleBgRight1.nativeElement, 'right');
      }
      if (this.titleRight2?.nativeElement && this.titleBgRight2?.nativeElement) {
        this.animateTitle(this.titleRight2.nativeElement, this.titleBgRight2.nativeElement, 'right');
      }
      
      // Animate left side titles (appearing from right to left)
      if (this.titleLeft1?.nativeElement && this.titleBgLeft1?.nativeElement) {
        this.animateTitle(this.titleLeft1.nativeElement, this.titleBgLeft1.nativeElement, 'left');
      }
      if (this.titleLeft2?.nativeElement && this.titleBgLeft2?.nativeElement) {
        this.animateTitle(this.titleLeft2.nativeElement, this.titleBgLeft2.nativeElement, 'left');
      }

      // Animate images with rotation and scale effect (no repeat on scroll)
      if (this.images && this.images.length > 0) {
        this.images.forEach((img, index) => {
          if (img?.nativeElement) {
            // Set initial state first
            gsap.set(img.nativeElement, {
              opacity: 0,
              rotateY: -90,
              scale: 0.9,
              transformStyle: "preserve-3d",
              perspective: 1000
            });

            // Create animation with ScrollTrigger
            gsap.to(img.nativeElement, {
              opacity: 1,
              rotateY: 0,
              scale: 1,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: img.nativeElement,
                start: "top 80%",
                toggleActions: "play none none none",
                once: true
              }
            });
          }
        });
      }

      // Refresh ScrollTrigger after all animations are set up
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 100);
  }

  private animateTitle(titleElement: HTMLElement, bgElement: HTMLElement, direction: 'left' | 'right') {
    // Only run in browser
    if (!this.isBrowser || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return;
    }

    // Set initial state
    gsap.set(bgElement, {
      x: direction === 'right' ? '-100%' : '100%',
      width: '100%',
      position: 'absolute',
      top: 0,
      bottom: 0,
      [direction === 'right' ? 'left' : 'right']: 0
    });

    // Create a timeline for the title animation (no repeat on scroll)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: titleElement,
        start: 'top 80%',
        toggleActions: 'play none none none',
        markers: false
      }
    });

    // Animate the background (reveal effect)
    tl.to(bgElement, {
      x: '0%',
      duration: 1.5,
      ease: 'power3.out'
    });

    // Animate the text (slight delay after background starts)
    const titleText = titleElement.querySelector('.service-title');
    if (titleText) {
      tl.fromTo(
        titleText,
        { 
          opacity: 0,
          x: direction === 'right' ? -50 : 50
        },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: 'power3.out'
        },
        '-=0.5' // Slight overlap with the background animation
      );
    }
  }


}
