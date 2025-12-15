import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
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

  activeCard: number = 2; // Default to middle card (index 1)

  constructor(private router: Router) {}

  //! method to set active card
  setActive(cardNumber: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.activeCard = cardNumber;
  }

  //! method to navigate to project details
  navigateToProjectDetails(blog: Blog, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/Project-Det'], { queryParams: { slug: blog.slug } });
  }

  // Helper method to get responsive image
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | undefined): string {
    if (!image) return '';
    return image.desktop;
  }

  // Get blogs for display (first 3)
  getDisplayBlogs(): Blog[] {
    return this.blogs.slice(0, 3);
  }
}
