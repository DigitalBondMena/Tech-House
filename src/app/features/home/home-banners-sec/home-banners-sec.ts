import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, computed, effect, inject, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { SharedFeatureService } from '../../../core/services/sharedFeatureService';
import { Banner } from '../../../shared/components/banner/banner';
import { SectionTitle } from '../../../shared/components/section-title/section-title';

@Component({
  selector: 'app-home-banners-sec',
  imports: [SectionTitle,Banner],
  templateUrl: './home-banners-sec.html',
  styleUrl: './home-banners-sec.css'
})
export class HomeBannersSec implements OnInit, AfterViewInit {
  private sharedFeatureService = inject(SharedFeatureService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('partnersBanner') partnersBanner!: Banner;
  @ViewChild('clientsBanner') clientsBanner!: Banner;

  //! section title data
  partenersTitle = "شركاؤنا";
  clientsTitle = "عملائنا";

  //! Get partners and clients from service
  partners = computed(() => this.sharedFeatureService.partners());
  clients = computed(() => this.sharedFeatureService.clients());

  // Signal to control when to start animations (both banners together)
  startAnimations = signal(false);
  private animationStarted = false;

  constructor() {
    // Use effect to wait for both banners to have data
    effect(() => {
      const partnersData = this.partners();
      const clientsData = this.clients();
      
      // Start animations when both have data
      if (partnersData.length > 0 && clientsData.length > 0 && !this.animationStarted) {
        // Wait a bit for DOM to be ready
        setTimeout(() => {
          this.startAnimationsTogether();
        }, 200);
      }
    });
  }

  ngOnInit(): void {
    // Load partners/clients data
    this.sharedFeatureService.loadPartnersClients();
  }

  ngAfterViewInit(): void {
    // Check if data is already loaded
    if (this.partners().length > 0 && this.clients().length > 0 && !this.animationStarted) {
      setTimeout(() => {
        this.startAnimationsTogether();
      }, 300);
    }
  }

  private startAnimationsTogether(): void {
    if (this.animationStarted) return;
    
    const isBrowser = isPlatformBrowser(this.platformId);
    if (!isBrowser) return;
    
    // Wait for DOM to be ready, then initialize animations directly (not paused)
    setTimeout(() => {
      // Start animations directly without pausing first
      if (this.partnersBanner && this.partners().length > 0) {
        this.partnersBanner.startAnimationNow();
      }
      if (this.clientsBanner && this.clients().length > 0) {
        this.clientsBanner.startAnimationNow();
      }
      
      this.animationStarted = true;
    }, 300); // Give time for DOM to be ready and images to load
  }
}
