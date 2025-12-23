import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, inject, effect, signal, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { SectionTitle } from '../../shared/components/section-title/section-title';
import { AppButton } from '../../shared/components/app-button/app-button';
import { Banner } from '../../shared/components/banner/banner';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { FeatureService } from '../../core/services/featureService';
import { SharedFeatureService } from '../../core/services/sharedFeatureService';
import { environment } from '../../../environments/environment';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, HeroSection, SectionTitle, AppButton, Banner, ContactUsSec],
  templateUrl: './about-us.html',
  styleUrls: ['./about-us.css']
})
export class AboutUs implements OnInit, AfterViewInit {
  private featureService = inject(FeatureService);
  private sharedFeatureService = inject(SharedFeatureService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  @ViewChildren('cardElement') cards!: QueryList<ElementRef<HTMLElement>>;

  // Signals
  aboutData = this.featureService.aboutData;
  bannerSection = computed(() => this.aboutData()?.bannerSection ?? null);
  aboutInformation = computed(() => this.aboutData()?.aboutInformation ?? null);
  aboutSections = computed(() => {
    const sections = this.aboutData()?.aboutSection ?? [];
    return sections.filter(s => s.is_active).sort((a, b) => a.order - b.order);
  });

  partnersTitle = "شركاؤنا وعملاؤنا";
  contactBtnText = "تواصل معنا";
  partners = this.sharedFeatureService.partners;
  clients = this.sharedFeatureService.clients;

  constructor() {
    // Load data
    this.featureService.loadAboutData();
    this.sharedFeatureService.loadPartnersClients();
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    
    // Initialize animation when cards are available
    if (this.cards.length > 0) {
      this.initializeScrollAnimation();
    }
    
    // Handle dynamic cards
    this.cards.changes.subscribe(() => {
      if (this.cards.length > 0) {
        this.initializeScrollAnimation();
      }
    });
  }

  private initializeScrollAnimation(): void {
    if (!this.isBrowser) return;

    const cards = this.cards.toArray();
    
    cards.forEach((card, index) => {
      const element = card.nativeElement;
      
      // Set initial state
      gsap.set(element, {
        y: 100,
        opacity: 0,
        scale: 0.95,
        translateY:0,
      });

      // Create animation
      gsap.to(element, {
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse",
          onEnter: () => {
            gsap.to(element, {
              y: 0,
              opacity: 1,
              scale: 1,
              translateY:-20,
              duration: 0.8,
              delay: index * 0.15,
              ease: "power2.out"
            });
          },
          onLeaveBack: () => {
            gsap.to(element, {
              y: 100,
              opacity: 0,
              scale: 0.95,
              duration: 0.5
            });
          }
        }
      });
    });
  }

  trackByOrder(index: number, item: any): number {
    return item.order;
  }

  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image) return '/images/placeholder.png';
    
    let imageUrl = '';
    if (this.isBrowser) {
      const width = window.innerWidth;
      imageUrl = width < 768 ? (image.mobile || image.desktop || '') :
                width < 1024 ? (image.tablet || image.desktop || '') :
                (image.desktop || '');
    } else {
      imageUrl = image.desktop || '';
    }
    return this.addBaseUrlIfNeeded(imageUrl);
  }

  private addBaseUrlIfNeeded(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}/${cleanUrl}`;
  }
}