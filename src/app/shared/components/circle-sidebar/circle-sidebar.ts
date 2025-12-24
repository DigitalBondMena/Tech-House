import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { SharedFeatureService } from '../../../core/services/sharedFeatureService';

@Component({
  selector: 'app-circle-sidebar',
  imports: [CommonModule],
  templateUrl: './circle-sidebar.html',
  styleUrl: './circle-sidebar.css',
  standalone: true
})
export class CircleSidebar implements OnInit {
  private sharedFeatureService = inject(SharedFeatureService);

  // Contact Us Data from API
  contactUsData = this.sharedFeatureService.contactUsData;

  ngOnInit(): void {
    // Load contact us data
    this.sharedFeatureService.loadContactUsData();
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

