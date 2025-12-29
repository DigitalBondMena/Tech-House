import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ResponsiveImage } from '../../../core/models/home.model';
import { SharedFeatureService } from '../../../core/services/sharedFeatureService';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer implements OnInit, AfterViewInit {
  private sharedFeatureService = inject(SharedFeatureService);
  private sanitizer = inject(DomSanitizer);

  // Contact Us Data from API
  contactUsData = this.sharedFeatureService.contactUsData;

  // Services Section Data from API
  servicesSection = this.sharedFeatureService.servicesSection;

  ngOnInit(): void {
    // Load data on server-side (SSR) - this runs on both server and client
    // On server, data will be fetched and stored in TransferState
    // On client, data will be retrieved from TransferState if available
    this.sharedFeatureService.loadContactUsData();
    this.sharedFeatureService.loadServicesSection();
  }

  ngAfterViewInit(): void {
    // On client-side, ensure data is loaded (in case SSR didn't run)
    // Data should already be loaded from ngOnInit, but ensure it's there
    if (!this.contactUsData()) {
      this.sharedFeatureService.loadContactUsData();
    }
    if (!this.servicesSection()) {
      this.sharedFeatureService.loadServicesSection();
    }
  }

  // Helper method to get responsive image
  getResponsiveImage(image: ResponsiveImage | undefined): string {
    if (!image) return '/images/logo/logo-light.webp';
    // For now, return desktop. In a real app, you'd detect screen size
    return image.desktop;
  }

  // Helper method to sanitize HTML content
  getSanitizedHtml(html: string | undefined): SafeHtml {
    if (!html) return '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Helper method to create Google Maps URL from address
  getGoogleMapsUrl(address: string | undefined): string {
    if (!address) return '#';
    // Encode the address for Google Maps
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  }
}
