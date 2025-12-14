import { Component, Input } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { Blog } from '../../../core/models/home.model';

@Component({
  selector: 'app-home-blogs',
  imports: [SectionTitle, AppButton],
  templateUrl: './home-blogs.html',
  styleUrl: './home-blogs.css'
})
export class HomeBlogs {
  @Input() blogs: Blog[] = [];

  //! section title data
  projectsTitle = " المقالات";

  //! button data
  btnText = "مقالات اكثر";

  activeCard: number = 1; // Default to middle card (index 1)

  //! method to set active card
  setActive(cardNumber: number) {
    this.activeCard = cardNumber;
  }

  // Helper method to get responsive image
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string }): string {
    return image.desktop;
  }

  // Get blogs for display (first 3)
  getDisplayBlogs(): Blog[] {
    return this.blogs.slice(0, 3);
  }
}
