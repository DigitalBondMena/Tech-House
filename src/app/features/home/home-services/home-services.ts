import { Component, ElementRef, QueryList, ViewChildren, ViewChild, AfterViewInit, Input } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { Service } from '../../../core/models/home.model';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home-services',
  imports: [SectionTitle, AppButton],
  templateUrl: './home-services.html',
  styleUrl: './home-services.css',
  standalone: true
})
export class HomeServices implements AfterViewInit {
  @Input() services: Service[] = [];

  //! section title data
  servicesTitle = "خدماتنا";

  //! button data
  btnText = "خدمات اكثر";

  // Helper method to get responsive image
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string }): string {
    return image.desktop;
  }

  // Right side elements
  @ViewChild('titleRight1') titleRight1!: ElementRef;
  @ViewChild('titleBgRight1') titleBgRight1!: ElementRef;
  @ViewChild('titleRight2') titleRight2!: ElementRef;
  @ViewChild('titleBgRight2') titleBgRight2!: ElementRef;
  
  // Left side elements
  @ViewChild('titleLeft1') titleLeft1!: ElementRef;
  @ViewChild('titleBgLeft1') titleBgLeft1!: ElementRef;
  @ViewChild('titleLeft2') titleLeft2!: ElementRef;
  @ViewChild('titleBgLeft2') titleBgLeft2!: ElementRef;
  
  // Image elements
  @ViewChildren('imgEl') images!: QueryList<ElementRef>;

  ngAfterViewInit() {
    // Animate right side titles (appearing from left to right)
    this.animateTitle(this.titleRight1.nativeElement, this.titleBgRight1.nativeElement, 'right');
    this.animateTitle(this.titleRight2.nativeElement, this.titleBgRight2.nativeElement, 'right');
    
    // Animate left side titles (appearing from right to left)
    this.animateTitle(this.titleLeft1.nativeElement, this.titleBgLeft1.nativeElement, 'left');
    this.animateTitle(this.titleLeft2.nativeElement, this.titleBgLeft2.nativeElement, 'left');

    // Animate images with rotation and scale effect (no repeat on scroll)
    this.images.forEach((img, index) => {
      gsap.fromTo(img.nativeElement,
        { 
          opacity: 0,
          rotateY: -90,
          scale: 0.9
        },
        {
          opacity: 1,
          rotateY: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: img.nativeElement,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }

  private animateTitle(titleElement: HTMLElement, bgElement: HTMLElement, direction: 'left' | 'right') {
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
    tl.fromTo(
      titleElement.querySelector('.service-title'),
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
