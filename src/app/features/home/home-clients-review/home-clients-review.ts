import { Component, Input } from '@angular/core';
import { Testimonial } from '../../../core/models/home.model';

@Component({
  selector: 'app-home-clients-review',
  imports: [],
  templateUrl: './home-clients-review.html',
  styleUrl: './home-clients-review.css'
})
export class HomeClientsReview {
  @Input() testimonials: Testimonial[] = [];

  // Helper method to get responsive image
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string }): string {
    return image.desktop;
  }

}
