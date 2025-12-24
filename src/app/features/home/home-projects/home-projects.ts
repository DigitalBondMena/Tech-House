import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, PLATFORM_ID, QueryList, ViewChildren, inject } from '@angular/core';
import { gsap } from 'gsap';
import { Flip } from 'gsap/all';
import { Project } from '../../../core/models/home.model';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { SectionTitle } from '../../../shared/components/section-title/section-title';

@Component({
  selector: 'app-home-projects',
  imports: [SectionTitle, AppButton, NgOptimizedImage],
  templateUrl: './home-projects.html',
  styleUrl: './home-projects.css'
})
export class HomeProjects implements AfterViewInit {
  @Input() projects: Project[] = [];

  //! section title data
  projectsTitle = "مشاريعنا";

  //! button data
  btnText = "مشاريع اكثر";

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Helper method to get responsive image
  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image || !image.desktop) {
      return '/images/placeholder.png'; // Fallback image
    }
    return image.desktop;
  }

  // Track the active card index
  private activeCardIndex = 1; // Start with the middle card active
  
  // Reference to the cards container
  @ViewChildren('projectCard') projectCards!: QueryList<ElementRef>;

  constructor() {
    // Register GSAP plugins only in browser
    if (this.isBrowser && typeof window !== 'undefined') {
      gsap.registerPlugin(Flip);
    }
  }

  ngAfterViewInit() {
    // Only run in browser, not in SSR
    if (!this.isBrowser) {
      return;
    }

    // Initial setup - make sure the middle card is on top (only on large screens)
    if (window.innerWidth >= 1024) {
      this.updateCardStates();
    }
  }

  // Handle card click
  onCardClick(clickedIndex: number) {
    // Only run in browser, not in SSR
    if (!this.isBrowser) {
      return;
    }

    // Only apply animations on large screens
    if (window.innerWidth < 1024) return;

    if (clickedIndex === this.activeCardIndex) return; // Don't do anything if clicking the active card

    // Get all card elements
    const cards = this.projectCards.toArray().map(card => card.nativeElement);
    const activeCard = cards[this.activeCardIndex];
    const clickedCard = cards[clickedIndex];

    // Temporarily remove transition for the active card to prevent jump
    gsap.set(activeCard, { transition: 'none' });
    gsap.set(clickedCard, { transition: 'none' });

    // Get the current state
    const state = Flip.getState(".project-card");
    
    // Update the active index
    this.activeCardIndex = clickedIndex;
    this.updateCardStates();
    
    // Apply the new state with animation
    Flip.from(state, {
      duration: 0.8,
      ease: "power1.inOut",
      onComplete: () => {
        // Restore transitions after animation
        gsap.set(cards, { clearProps: 'all' });
      }
    });
  }

  // Update z-index and classes based on active card
  private updateCardStates() {
    this.projectCards.forEach((card, index) => {
      const element = card.nativeElement;
      const diff = Math.abs(index - this.activeCardIndex);
      
      // Set z-index based on distance from active card
      gsap.set(element, { zIndex: 100 - diff * 10 });
      
      // Add/remove active class
      if (index === this.activeCardIndex) {
        element.classList.add('active-card');
        element.classList.remove('back-card', 'front-card');
      } else if (index < this.activeCardIndex) {
        element.classList.add('back-card');
        element.classList.remove('active-card', 'front-card');
      } else {
        element.classList.add('front-card');
        element.classList.remove('active-card', 'back-card');
      }
    });
  }
}
