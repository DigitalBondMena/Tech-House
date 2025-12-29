import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, PLATFORM_ID, QueryList, ViewChildren, computed, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { environment } from '../../../environments/environment';
import { FeatureService } from '../../core/services/featureService';
import { SharedFeatureService } from '../../core/services/sharedFeatureService';
import { AppButton } from '../../shared/components/app-button/app-button';
import { Banner } from '../../shared/components/banner/banner';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { SectionTitle } from '../../shared/components/section-title/section-title';

// Register GSAP plugins only in browser
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
    // Constructor should not load data - moved to ngAfterViewInit
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Load data on server-side (SSR) - this runs on both server and client
    // On server, data will be fetched and stored in TransferState
    // On client, data will be retrieved from TransferState if available
    this.featureService.loadAboutData();
    this.sharedFeatureService.loadPartnersClients();
  }

  ngAfterViewInit(): void {
    // On client-side, ensure data is loaded (in case SSR didn't run)
    if (!this.aboutData()) {
      this.featureService.loadAboutData();
    }
    if (!this.partners().length || !this.clients().length) {
      this.sharedFeatureService.loadPartnersClients();
    }

    if (this.isBrowser) {
      // Wait for cards to be rendered
      setTimeout(() => {
        this.animateCards();
      }, 100);
    }
  }

  private animateCards(): void {
    if (!this.cards || this.cards.length === 0) return;

    this.cards.forEach((card, index) => {
      const element = card.nativeElement;
      
      // Set initial state
      gsap.set(element, {
        scale: 0.8,
        opacity: 0,
        y: 50
      });

      // Animate on scroll
      gsap.to(element, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: index * 0.15, // Stagger effect
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none none'
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