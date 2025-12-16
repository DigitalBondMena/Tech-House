import { Component, OnInit, inject, computed } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { Banner } from '../../../shared/components/banner/banner';
import { SharedFeatureService } from '../../../core/services/sharedFeatureService';

@Component({
  selector: 'app-home-banners-sec',
  imports: [SectionTitle,Banner],
  templateUrl: './home-banners-sec.html',
  styleUrl: './home-banners-sec.css'
})
export class HomeBannersSec implements OnInit {
  private sharedFeatureService = inject(SharedFeatureService);

  //! section title data
  partenersTitle = "شركاؤنا";
  clientsTitle = "عملائنا";

  //! Get partners and clients from service
  partners = computed(() => this.sharedFeatureService.partners());
  clients = computed(() => this.sharedFeatureService.clients());

  ngOnInit(): void {
    // Load partners/clients data
    this.sharedFeatureService.loadPartnersClients();
  }
}
