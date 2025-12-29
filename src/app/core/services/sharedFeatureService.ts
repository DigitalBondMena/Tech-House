import { Injectable, inject, signal, computed, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { API_END_POINTS } from '../constant/ApiEndPoints';
import { Counter, CountersResponse, ContactUsData, ContactUsResponse, ServiceTitle, ServicesSectionResponse, ClientPartner, PartnersClientsResponse, PrivacyPolicyData, PrivacyPolicyResponse, ContactHero, ContactHeroResponse } from '../models/home.model';

// TransferState keys for SSR
const COUNTERS_KEY = makeStateKey<Counter[]>('counters');
const CONTACT_US_KEY = makeStateKey<ContactUsData>('contactUs');
const CONTACT_HERO_KEY = makeStateKey<ContactHero>('contactHero');
const SERVICES_SECTION_KEY = makeStateKey<ServiceTitle[]>('servicesSection');
const PARTNERS_CLIENTS_KEY = makeStateKey<PartnersClientsResponse>('partnersClients');

@Injectable({
  providedIn: 'root',
})
export class SharedFeatureService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState, { optional: true }) as TransferState | null;
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = environment.apiUrl;
  private readonly isServer = isPlatformServer(this.platformId);

  // 🔹 Internal API Response Signal Reference
  private countersResponseSignal = signal<Counter[] | null>(null);
  private contactUsResponseSignal = signal<ContactUsData | null>(null);
  private contactHeroResponseSignal = signal<ContactHero | null>(null);
  private servicesSectionSignal = signal<ServiceTitle[] | null>(null);
  private partnersClientsResponseSignal = signal<PartnersClientsResponse | null>(null);
  private privacyPolicyResponseSignal = signal<PrivacyPolicyData | null>(null);

  // 🔹 Loading flags to prevent multiple requests
  private contactUsLoading = false;
  private contactHeroLoading = false;
  private servicesSectionLoading = false;
  private countersLoading = false;
  private partnersClientsLoading = false;
  private privacyPolicyLoading = false;

  // 🔹 Counters Data Signal (computed from API response)
  counters = computed(() => this.countersResponseSignal());

  // 🔹 Contact Us Data Signal (computed from API response)
  contactUsData = computed(() => this.contactUsResponseSignal());

  // 🔹 Contact Hero Data Signal (computed from API response)
  contactHero = computed(() => this.contactHeroResponseSignal());

  // 🔹 Services Section Data Signal (computed from API response)
  servicesSection = computed(() => this.servicesSectionSignal());

  // 🔹 Partners/Clients Data Signals (computed from API response)
  partners = computed(() => {
    const data = this.partnersClientsResponseSignal();
    return data?.partners?.filter(p => p.is_active).sort((a, b) => a.order - b.order) || [];
  });

  clients = computed(() => {
    const data = this.partnersClientsResponseSignal();
    return data?.clients?.filter(c => c.is_active).sort((a, b) => a.order - b.order) || [];
  });

  // 🔹 Privacy Policy Data Signal (computed from API response)
  privacyPolicyData = computed(() => this.privacyPolicyResponseSignal());

  // =====================
  // COUNTERS API
  // =====================
  loadCounters(): void {
    // إذا كانت البيانات موجودة بالفعل أو جاري التحميل، لا تفعل شيء
    if (this.countersResponseSignal() || this.countersLoading) {
      return;
    }

    // Check TransferState first (for SSR)
    if (this.transferState && this.transferState.hasKey(COUNTERS_KEY)) {
      const data = this.transferState.get<Counter[]>(COUNTERS_KEY, []);
      if (data && data.length > 0) {
        this.countersResponseSignal.set(data);
        return;
      }
    }

    this.countersLoading = true;
    
    this.http.get<CountersResponse>(`${this.baseUrl}${API_END_POINTS.COUNTERS}`).subscribe({
      next: (data) => {
        if (data && data.counters) {
          // Store in TransferState on server
          if (this.isServer && this.transferState) {
            this.transferState.set(COUNTERS_KEY, data.counters);
          }
          this.countersResponseSignal.set(data.counters);
        }
        this.countersLoading = false;
      },
      error: (err) => {
        // Only log if it's not a network/CORS error (status 0)
        if (err.status !== 0) {
          console.error('Error loading counters:', err);
        }
        this.countersLoading = false;
      }
    });
  }

  // =====================
  // CONTACT HERO API
  // =====================
  loadContactHero(): void {
    if (this.contactHeroResponseSignal() || this.contactHeroLoading) {
      return;
    }

    this.contactHeroLoading = true;
    
    this.http.get<ContactHeroResponse | any>(`${this.baseUrl}${API_END_POINTS.CONTACT_HERO}`).subscribe({
      next: (data) => {
        let heroData: ContactHero | null = null;
        
      if (data.bannerSection) {
          heroData = {
            title: data.bannerSection.title || '',
            paragraph: data.bannerSection.text,
            image: data.bannerSection.image
          };
        }
        else if (data.contactHero) {
          heroData = data.contactHero;
        }
        else if (data.title || data.image) {
          heroData = {
            title: data.title || '',
            paragraph: data.paragraph,
            image: data.image
          };
        }
        else if (data.data) {
          if (data.data.bannerSection) {
            heroData = {
              title: data.data.bannerSection.title || '',
              paragraph: data.data.bannerSection.text,
              image: data.data.bannerSection.image
            };
          } else if (data.data.contactHero) {
            heroData = data.data.contactHero;
          } else if (data.data.title || data.data.image) {
            heroData = {
              title: data.data.title || '',
              paragraph: data.data.paragraph,
              image: data.data.image
            };
          }
        }
        
        if (heroData) {
          this.contactHeroResponseSignal.set(heroData);
        } else {
          console.warn('Contact Hero Data is null or empty:', data);
        }
        this.contactHeroLoading = false;
      },
      error: (err) => {
        // Only log if it's not a network/CORS error (status 0)
        if (err.status !== 0) {
          console.error('Error loading contact hero:', err);
        }
        this.contactHeroLoading = false;
      }
    });
  }

  // =====================
  // CONTACT US API (for Footer)
  // =====================
  loadContactUsData(): void {
    if (this.contactUsResponseSignal() || this.contactUsLoading) {
      return;
    }

    // Check TransferState first (for SSR)
    if (this.transferState && this.transferState.hasKey(CONTACT_US_KEY)) {
      const data = this.transferState.get<ContactUsData | null>(CONTACT_US_KEY, null as any);
      if (data) {
        this.contactUsResponseSignal.set(data);
        return;
      }
    }

    this.contactUsLoading = true;
    
    this.http.get<ContactUsResponse | any>(`${this.baseUrl}${API_END_POINTS.CONTACT_US}`).subscribe({
      next: (data) => {
        const contactUs = data.contactUs || data;
        
        if (contactUs) {
          const contactData: ContactUsData = {
            footer_text: contactUs.footer_text,
            working_hours: contactUs.working_hours,
            email: contactUs.email,
            phone: contactUs.phone,
            whatsapp_number: contactUs.whatsapp_number,
            address: contactUs.address,
            image: contactUs.image,
            logo: contactUs.logo,
            copyright: contactUs.copyright,
            privacyPolicyUrl: contactUs.privacyPolicyUrl,
            contactInfo: {
              email: contactUs.email,
              phone: contactUs.phone,
              address: contactUs.address
            },
              social: contactUs.social ? {
              map_url: contactUs.social.map_url,
              facebook_url: contactUs.social.facebook_url,
              instagram_url: contactUs.social.instagram_url,
              linkedin_url: contactUs.social.linkedin_url,
              tiktok_url: contactUs.social.tiktok_url,
              snapchat_url: contactUs.social.snapchat_url
            } : undefined
          };
          
          // Store in TransferState on server
          if (this.isServer && this.transferState) {
            this.transferState.set(CONTACT_US_KEY, contactData);
          }
          this.contactUsResponseSignal.set(contactData);
        }
        this.contactUsLoading = false;
      },
      error: (err) => {
        // Only log if it's not a network/CORS error (status 0)
        if (err.status !== 0) {
          console.error('Error loading contact us data:', err);
        }
        this.contactUsLoading = false;
      }
    });
  }

  // =====================
  // SERVICES SECTION API (for Footer)
  // =====================
  loadServicesSection(): void {
    if (this.servicesSectionSignal() || this.servicesSectionLoading) {
      return;
    }

    // Check TransferState first (for SSR)
    if (this.transferState && this.transferState.hasKey(SERVICES_SECTION_KEY)) {
      const data = this.transferState.get<ServiceTitle[]>(SERVICES_SECTION_KEY, []);
      if (data && data.length > 0) {
        this.servicesSectionSignal.set(data);
        return;
      }
    }

    this.servicesSectionLoading = true;
    
    this.http.get<ServicesSectionResponse | any>(`${this.baseUrl}${API_END_POINTS.SERVICESEC}`).subscribe({
      next: (data) => {
        let services: ServiceTitle[] = [];
        
        if (Array.isArray(data.serviceTitles)) {
          services = data.serviceTitles;
        }
        else if (Array.isArray(data.services)) {
          services = data.services;
        }
        else if (Array.isArray(data.titles)) {
          services = data.titles;
        }
        else if (Array.isArray(data)) {
          services = data;
        }
        else if (Array.isArray(data.data)) {
          services = data.data;
        }
        else if (Array.isArray(data.data?.serviceTitles)) {
          services = data.data.serviceTitles;
        }
        else if (Array.isArray(data.data?.services)) {
          services = data.data.services;
        }
        else if (Array.isArray(data.data?.titles)) {
          services = data.data.titles;
        }
        
        if (services.length > 0) {
          // Store in TransferState on server
          if (this.isServer && this.transferState) {
            this.transferState.set(SERVICES_SECTION_KEY, services);
          }
          this.servicesSectionSignal.set(services);
        }
        this.servicesSectionLoading = false;
      },
      error: (err) => {
        // Only log if it's not a network/CORS error (status 0)
        if (err.status !== 0) {
          console.error('Error loading services section:', err);
        }
        this.servicesSectionLoading = false;
      }
    });
  }

  // =====================
  // PARTNERS/CLIENTS API
  // =====================
  loadPartnersClients(): void {
    if (this.partnersClientsResponseSignal() || this.partnersClientsLoading) {
      return;
    }

    // Check TransferState first (for SSR)
    if (this.transferState && this.transferState.hasKey(PARTNERS_CLIENTS_KEY)) {
      const data = this.transferState.get<PartnersClientsResponse | null>(PARTNERS_CLIENTS_KEY, null as any);
      if (data) {
        this.partnersClientsResponseSignal.set(data);
        return;
      }
    }

    this.partnersClientsLoading = true;
    
    this.http.get<PartnersClientsResponse>(`${this.baseUrl}${API_END_POINTS.BANNERS}`).subscribe({
      next: (data) => {
        if (data && (data.clients || data.partners)) {
          // Store in TransferState on server
          if (this.isServer && this.transferState) {
            this.transferState.set(PARTNERS_CLIENTS_KEY, data);
          }
          this.partnersClientsResponseSignal.set(data);
        }
        this.partnersClientsLoading = false;
      },
      error: (err) => {
        if (err.status !== 0) {
          console.error('Error loading partners/clients:', err);
        }
        this.partnersClientsLoading = false;
      }
    });
  }

  // =====================
  // PRIVACY POLICY API
  // =====================
  loadPrivacyPolicy(): void {
    if (this.privacyPolicyResponseSignal() || this.privacyPolicyLoading) {
      return;
    }

    this.privacyPolicyLoading = true;
    
    this.http.get<PrivacyPolicyResponse | any>(`${this.baseUrl}${API_END_POINTS.PRIVACYPOLICY}`).subscribe({
      next: (data) => {
        let privacyData: PrivacyPolicyData | null = null;
        
        if (data.bannerSection) {
          privacyData = {
            title: data.bannerSection.title || '',
            paragraph: data.bannerSection.text,
            image: data.bannerSection.image,
            sections: data.sections || [],
            bannerSection: data.bannerSection,
            privacyPolicy: data.privacyPolicy
          };
        }
        else if (data.privacyPolicy && (data.privacyPolicy.title || data.privacyPolicy.text)) {
          privacyData = {
            title: data.title || '',
            paragraph: data.paragraph,
            image: data.image || { desktop: '', tablet: '', mobile: '' },
            sections: data.sections || [],
            privacyPolicy: data.privacyPolicy
          };
        }
        else if (data.title || data.image) {
          privacyData = {
            title: data.title || '',
            paragraph: data.paragraph,
            image: data.image,
            sections: data.sections || []
          };
        }
        else if (data.data) {
          if (data.data.bannerSection) {
            privacyData = {
              title: data.data.bannerSection.title || '',
              paragraph: data.data.bannerSection.text,
              image: data.data.bannerSection.image,
              sections: data.data.sections || [],
              bannerSection: data.data.bannerSection,
              privacyPolicy: data.data.privacyPolicy || data.privacyPolicy
            };
          } else if (data.data.privacyPolicy) {
            privacyData = {
              ...data.data.privacyPolicy,
              privacyPolicy: data.data.privacyPolicy
            };
          } else if (data.data.title || data.data.image) {
            privacyData = {
              title: data.data.title || '',
              paragraph: data.data.paragraph,
              image: data.data.image,
              sections: data.data.sections || [],
              privacyPolicy: data.data.privacyPolicy || data.privacyPolicy
            };
          }
        }

        if (!privacyData && data.privacyPolicy) {
          privacyData = {
            title: data.bannerSection?.title || data.title || '',
            paragraph: data.bannerSection?.text || data.paragraph,
            image: data.bannerSection?.image || data.image || { desktop: '', tablet: '', mobile: '' },
            sections: data.sections || [],
            bannerSection: data.bannerSection,
            privacyPolicy: data.privacyPolicy
          };
        }
        
        if (privacyData) {
          this.privacyPolicyResponseSignal.set(privacyData);
        }
        this.privacyPolicyLoading = false;
      },
      error: (err) => {
        if (err.status !== 0) {
          console.error('Error loading privacy policy:', err);
        }
        this.privacyPolicyLoading = false;
      }
    });
  }
}



