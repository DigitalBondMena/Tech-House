import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { SharedFeatureService } from '../../../core/services/sharedFeatureService';

@Component({
  selector: 'app-circle-sidebar',
  imports: [CommonModule],
  templateUrl: './circle-sidebar.html',
  styleUrl: './circle-sidebar.css',
  standalone: true
})
export class CircleSidebar implements OnInit, AfterViewInit {
  private sharedFeatureService = inject(SharedFeatureService);

  // Contact Us Data from API
  contactUsData = this.sharedFeatureService.contactUsData;

  ngOnInit(): void {
    // Load data on server-side (SSR) - this runs on both server and client
    // On server, data will be fetched and stored in TransferState
    // On client, data will be retrieved from TransferState if available
    this.sharedFeatureService.loadContactUsData();
  }

  ngAfterViewInit(): void {
    // On client-side, ensure data is loaded (in case SSR didn't run)
    // Data should already be loaded from ngOnInit, but ensure it's there
    if (!this.contactUsData()) {
      this.sharedFeatureService.loadContactUsData();
    }
  }

  // Helper method to format WhatsApp URL
  getWhatsAppUrl(phoneNumber: string | undefined): string {
    if (!phoneNumber) return '#';
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Format as WhatsApp URL
    return `https://wa.me/${cleaned}`;
  }
}

