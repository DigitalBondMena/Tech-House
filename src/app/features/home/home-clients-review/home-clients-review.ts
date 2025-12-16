import { Component, Input } from '@angular/core';
import { Testimonial } from '../../../core/models/home.model';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-home-clients-review',
  imports: [NgOptimizedImage],
  templateUrl: './home-clients-review.html',
  styleUrl: './home-clients-review.css'
})
export class HomeClientsReview {
  @Input() testimonials: Testimonial[] = [];

  // Helper method to get responsive image
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image || !image.desktop) {
      return '/images/placeholder.png';
    }
    return image.desktop;
  }

}
