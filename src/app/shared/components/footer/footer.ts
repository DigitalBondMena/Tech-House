import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SharedFeatureService } from '../../../core/services/sharedFeatureService';
import { ResponsiveImage } from '../../../core/models/home.model';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer implements OnInit {
  private sharedFeatureService = inject(SharedFeatureService);
  private sanitizer = inject(DomSanitizer);

  // Contact Us Data from API
  contactUsData = this.sharedFeatureService.contactUsData;

  // Services Section Data from API
  servicesSection = this.sharedFeatureService.servicesSection;

  ngOnInit(): void {
    // Load contact us data when component initializes
    this.sharedFeatureService.loadContactUsData();
    // Load services section data for footer
    this.sharedFeatureService.loadServicesSection();
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
