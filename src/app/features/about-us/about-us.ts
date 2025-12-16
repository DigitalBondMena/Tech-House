import { Component, OnInit, AfterViewInit, inject, computed, PLATFORM_ID, ViewChildren, QueryList, ElementRef, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { SectionTitle } from '../../shared/components/section-title/section-title';
import { AppButton } from '../../shared/components/app-button/app-button';
import { Banner } from '../../shared/components/banner/banner';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { FeatureService } from '../../core/services/featureService';
import { AboutSection } from '../../core/models/home.model';
import { environment } from '../../../environments/environment';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-us',
  imports: [
    HeroSection,
    SectionTitle,
    AppButton,
    Banner,
    ContactUsSec,
    CommonModule,
    NgOptimizedImage
  ],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css'
})
export class AboutUs implements OnInit, AfterViewInit {
  private featureService = inject(FeatureService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  @ViewChildren('cardElement') cardElements!: QueryList<ElementRef<HTMLElement>>;

  // 🔹 About Data from API
  aboutData = computed(() => this.featureService.aboutData());

  // 🔹 Computed properties for sections
  bannerSection = computed(() => this.aboutData()?.bannerSection ?? null);
  aboutInformation = computed(() => this.aboutData()?.aboutInformation ?? null);
  aboutSections = computed(() => {
    const sections = this.aboutData()?.aboutSection ?? [];
    return sections.filter(s => s.is_active).sort((a, b) => a.order - b.order);
  });

  // Partners and Clients Section Data
  partnersTitle = "شركاؤنا وعملائنا";
  contactBtnText = "تواصل معنا";

  private viewReady = false;
  private cardsAnimated = false;

  constructor() {
    // Watch for data changes and animate cards when ready
    effect(() => {
      const sections = this.aboutSections();
      if (sections.length > 0 && this.viewReady && !this.cardsAnimated && this.isBrowser) {
        setTimeout(() => {
          this.animateCards();
        }, 200);
      }
    });
  }

  // 🔹 Helper method to add base URL if image is relative
  private addBaseUrlIfNeeded(url: string): string {
    if (!url) return '';
    
    // If URL is already absolute (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If URL starts with /, it's relative to root, return as is
    if (url.startsWith('/')) {
      return url;
    }
    
    // Otherwise, add base URL from environment (remove /api and add image path)
    // API URL is: https://dashboard.techhouseksa.com/api
    // Base URL should be: https://dashboard.techhouseksa.com
    const baseUrl = environment.apiUrl.replace('/api', '');
    
    // Remove leading slash from url if exists to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    const fullUrl = `${baseUrl}/${cleanUrl}`;
    
    console.log('About Us - Image URL transformation:', { original: url, baseUrl, cleanUrl, fullUrl });
    
    return fullUrl;
  }

  // 🔹 Helper method to get responsive image based on screen size
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image) {
      console.log('About Us - getResponsiveImage: No image provided');
      return '/images/placeholder.png';
    }
    
    console.log('About Us - getResponsiveImage: Image object:', image);
    
    let imageUrl = '';
    if (this.isBrowser) {
      const width = window.innerWidth;
      if (width < 768) {
        imageUrl = image.mobile || image.desktop || '';
      } else if (width < 1024) {
        imageUrl = image.tablet || image.desktop || '';
      } else {
        imageUrl = image.desktop || '';
      }
    } else {
      imageUrl = image.desktop || '';
    }
    
    console.log('About Us - getResponsiveImage: Selected image URL:', imageUrl);
    
    if (!imageUrl) {
      console.log('About Us - getResponsiveImage: No image URL found, using placeholder');
      return '/images/placeholder.png';
    }
    
    // Add base URL if needed
    const finalUrl = this.addBaseUrlIfNeeded(imageUrl);
    console.log('About Us - getResponsiveImage: Final URL:', finalUrl);
    return finalUrl;
  }

  ngOnInit(): void {
    // Load about data when component initializes
    this.featureService.loadAboutData();
    
    // Scroll to top when about page loads
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.viewReady = true;

    // Try to animate cards if data is already available
    const sections = this.aboutSections();
    if (sections.length > 0) {
      setTimeout(() => {
        this.animateCards();
      }, 200);
    }
  }

  private animateCards(): void {
    if (!this.isBrowser || this.cardElements.length === 0 || this.cardsAnimated) return;
  
    this.cardsAnimated = true;
  
    const cards = this.cardElements.toArray().map(c => c.nativeElement);
  
    if (cards.length === 0) return;
  
    const baseCard = cards[0];        // ✅ أول كارد (ثابتة)
    const stackedCards = cards.slice(1, 3); // ✅ الكاردين التاليين فقط (2 كارد)
  
    if (stackedCards.length === 0) return;
  
    // 🔹 الحصول على ارتفاع أول كارد
    const baseCardHeight = baseCard.offsetHeight;
    
    // 🔹 الأولى ثابتة تمامًا
    gsap.set(baseCard, { 
      y: 0,
      zIndex: 1
    });
  
    // 🔹 الكروت التالية تبدأ من تحت أول كارد
    stackedCards.forEach((card, index) => {
      gsap.set(card, {
        y: baseCardHeight + 40 + (index * 30), // تبدأ من تحت أول كارد
        zIndex: 2 + index // z-index أعلى للكارد الثاني والثالث
      });
    });
  
    // 🔹 حساب المسافة المطلوبة للـ scroll
    const scrollDistance = stackedCards.length * 500;
    
    const container = document.querySelector('.sticky-cards-container') as HTMLElement;
    if (!container) return;
  
    // 🔹 إنشاء ScrollTrigger للتأثير
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        markers: false, // يمكنك تفعيله للـ debugging
      }
    });
  
    // 🔹 كل كارد يتحرك للأعلى ويتكدس فوق الأولى
    stackedCards.forEach((card, index) => {
      const targetY = -(baseCardHeight - 20) - (index * 15); // يتكدس فوق الأولى مع مسافة بسيطة
      tl.to(card, {
        y: targetY,
        duration: 1,
        ease: 'none'
      }, index * 0.3); // تبدأ كل كارد بعد الأخرى
    });
  
    ScrollTrigger.refresh();
  }
  
  
}
