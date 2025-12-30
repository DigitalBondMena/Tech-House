import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
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
    // Load data in ngOnInit (runs on both server and client)
    // Note: These may be called from other components as well, but services have guards to prevent duplicate calls
    this.sharedFeatureService.loadContactUsData();
    this.sharedFeatureService.loadServicesSection();
  }

  ngAfterViewInit(): void {
    // View initialization logic (if needed)
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
