import { Component, Input, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { Testimonial } from '../../../core/models/home.model';
import { NgOptimizedImage } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-home-clients-review',
  imports: [NgOptimizedImage, SkeletonModule],
  templateUrl: './home-clients-review.html',
  styleUrl: './home-clients-review.css'
})
export class HomeClientsReview implements OnChanges {
  @Input() testimonials: Testimonial[] = [];

  // 🔹 Loading state as signal
  private isLoadingSignal = signal(true);
  isLoading = computed(() => this.isLoadingSignal());

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['testimonials']) {
      this.isLoadingSignal.set(!this.testimonials || this.testimonials.length === 0);
    }
  }

  // Helper method to get responsive image
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image || !image.desktop) {
      return '/images/placeholder.png';
    }
    return image.desktop;
  }

}
