import { Component, OnInit, AfterViewInit, ViewChild, inject, computed, signal, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { Banner } from '../../../shared/components/banner/banner';
import { SharedFeatureService } from '../../../core/services/sharedFeatureService';

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
    
    // First, prepare both animations (create timelines but keep them paused)
    if (this.partnersBanner) {
      this.partnersBanner.prepareAnimation();
    }
    if (this.clientsBanner) {
      this.clientsBanner.prepareAnimation();
    }
    
    // Wait a tiny bit for timelines to be created, then start both at the exact same time
    setTimeout(() => {
      // Check if we're in browser environment before using requestAnimationFrame
      if (isPlatformBrowser(this.platformId)) {
        // Use requestAnimationFrame to ensure both start at the exact same frame
        requestAnimationFrame(() => {
          // Get both timelines
          const partnersTimeline = this.partnersBanner?.getTimeline();
          const clientsTimeline = this.clientsBanner?.getTimeline();
          
          // Start both timelines at the exact same moment - call play() in sequence without delay
          // This ensures they start in the same JavaScript execution cycle
          if (partnersTimeline && partnersTimeline.paused()) {
            partnersTimeline.play();
          }
          if (clientsTimeline && clientsTimeline.paused()) {
            clientsTimeline.play();
          }
          
          this.animationStarted = true;
        });
      } else {
        // Fallback for server-side: start animations directly without requestAnimationFrame
        const partnersTimeline = this.partnersBanner?.getTimeline();
        const clientsTimeline = this.clientsBanner?.getTimeline();
        
        if (partnersTimeline && partnersTimeline.paused()) {
          partnersTimeline.play();
        }
        if (clientsTimeline && clientsTimeline.paused()) {
          clientsTimeline.play();
        }
        
        this.animationStarted = true;
      }
    }, 10); // Very small delay to ensure timelines are ready
  }
}
