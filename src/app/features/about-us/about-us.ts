import { Component, OnInit, AfterViewInit, OnDestroy, inject, computed, PLATFORM_ID, ViewChildren, QueryList, ElementRef, effect, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { SectionTitle } from '../../shared/components/section-title/section-title';
import { AppButton } from '../../shared/components/app-button/app-button';
import { Banner } from '../../shared/components/banner/banner';
import { CommonModule } from '@angular/common';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { FeatureService } from '../../core/services/featureService';
import { SharedFeatureService } from '../../core/services/sharedFeatureService';
import { environment } from '../../../environments/environment';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-us',
  imports: [HeroSection, SectionTitle, AppButton, Banner, ContactUsSec, CommonModule],
  templateUrl: './about-us.html',
  styleUrls: ['./about-us.css']
})
export class AboutUs implements OnInit, AfterViewInit, OnDestroy {
  private featureService = inject(FeatureService);
  private sharedFeatureService = inject(SharedFeatureService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  @ViewChildren('cardElement') cards!: QueryList<ElementRef<HTMLElement>>;

  aboutData = computed(() => this.featureService.aboutData());
  bannerSection = computed(() => this.aboutData()?.bannerSection ?? null);
  aboutInformation = computed(() => this.aboutData()?.aboutInformation ?? null);
  aboutSections = computed(() => {
    const sections = this.aboutData()?.aboutSection ?? [];
    return sections.filter(s => s.is_active).sort((a, b) => a.order - b.order);
  });

  partnersTitle = "شركاؤنا وعملائنا";
  contactBtnText = "تواصل معنا";
  partners = computed(() => this.sharedFeatureService.partners());
  clients = computed(() => this.sharedFeatureService.clients());

  animating = signal(false);
  allowScroll = signal(true);
  private viewReady = false;

  private tl!: gsap.core.Timeline;

  ngOnInit(): void {
    this.featureService.loadAboutData();
    this.sharedFeatureService.loadPartnersClients();

    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.viewReady = true;

    effect(() => {
      if (this.aboutSections().length > 0 && this.viewReady) {
        // مباشرة بعد التأكد من وجود البطاقات
        this.cards.changes.subscribe(() => {
        });

        // لو العناصر موجودة بالفعل عند التحميل
      
      }
    });
  }

  trackByOrder(index: number, item: any) {
    return item.order;
  }

  ngOnDestroy(): void {
    // Clean up ScrollTriggers when component is destroyed
    if (this.tl) {
      this.tl.kill();
    }
    ScrollTrigger.getAll().forEach(st => {
      const trigger = st.vars.trigger;
      if (trigger && typeof trigger !== 'string' && trigger instanceof Element) {
        if (trigger.classList?.contains('cards-section')) {
          st.kill();
        }
      } else if (trigger === '.cards-section') {
        st.kill();
      }
    });
  }

 

  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image) return '/images/placeholder.png';
    let imageUrl = '';
    if (this.isBrowser) {
      const width = window.innerWidth;
      if (width < 768) imageUrl = image.mobile || image.desktop || '';
      else if (width < 1024) imageUrl = image.tablet || image.desktop || '';
      else imageUrl = image.desktop || '';
    } else imageUrl = image.desktop || '';
    return this.addBaseUrlIfNeeded(imageUrl);
  }

  private addBaseUrlIfNeeded(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}/${cleanUrl}`;
  }
}
