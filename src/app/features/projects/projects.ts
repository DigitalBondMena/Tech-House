import { Component, OnInit, computed, inject, NgZone, PLATFORM_ID, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { FeatureService } from '../../core/services/featureService';
import { SharedFeatureService } from '../../core/services/sharedFeatureService';
import { environment } from '../../../environments/environment';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { debounce } from '../../core/utils/performance.utils';

@Component({
  selector: 'app-projects',
  imports: [
    CommonModule,
    HeroSection,
    ContactUsSec,
    PaginatorModule
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects implements OnInit, AfterViewInit, OnDestroy {
  private featureService = inject(FeatureService);
  private sharedFeatureService = inject(SharedFeatureService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private ngZone = inject(NgZone);

  @ViewChild('arrowElement', { static: false }) arrowElement!: ElementRef<HTMLDivElement>;
  @ViewChild('sidebarContainer', { static: false }) sidebarContainer!: ElementRef<HTMLDivElement>;

  projectsData = computed(() => this.featureService.projectsData());
  bannerSection = computed(() => this.projectsData()?.bannerSection ?? null);
  projects = computed(() => this.projectsData()?.projects ?? null);
  projectItems = computed(() => this.projects()?.data ?? []);
  
  // Service titles from /titles API
  serviceTitles = computed(() => this.sharedFeatureService.servicesSection() ?? []);
  
  // Selected service slug for filtering
  selectedSlug = signal<string | null>(null);
  
  // Pagination state
  rows = signal(9);
  totalRecords = computed(() => this.projects()?.total ?? 0);
  currentPage = computed(() => this.projects()?.current_page ?? 1);
  totalPages = computed(() => this.projects()?.last_page ?? 1);
  first = computed(() => (this.currentPage() - 1) * this.rows());

  // Arrow rotation angle
  arrowRotation = signal(0);
  selectedIndex = signal<number | null>(null);
  arrowPosition = signal(0);

  ngOnInit(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Load data on server-side (SSR) - this runs on both server and client
    // On server, data will be fetched and stored in TransferState
    // On client, data will be retrieved from TransferState if available
    this.sharedFeatureService.loadServicesSection();
  }

  ngAfterViewInit(): void {
    // On client-side, ensure data is loaded (in case SSR didn't run)
    if (!this.serviceTitles().length) {
      this.sharedFeatureService.loadServicesSection();
    }
    
    // Load projects initially
    this.loadProjects(1);

    if (this.isBrowser && this.selectedIndex() === null) {
      setTimeout(() => {
        this.selectService(null, 0);
      }, 300);
    }
  }

  loadProjects(page: number, slug?: string | null): void {
    this.featureService.loadProjectsData(page, slug || undefined);
  }

  selectService(slug: string | null, index: number): void {
    this.selectedSlug.set(slug);
    this.selectedIndex.set(index);
    this.loadProjects(1, slug);
    
    // Rotate arrow to point to selected service
    if (this.isBrowser && this.arrowElement && this.sidebarContainer) {
      this.rotateArrowToService(index);
    }
  }

  rotateArrowToService(index: number): void {
    if (!this.arrowElement || !this.sidebarContainer) return;

    const sidebarItems = this.sidebarContainer.nativeElement.querySelectorAll('.service-item');
    if (sidebarItems.length === 0) return;

    const selectedItem = sidebarItems[index] as HTMLElement;
    if (!selectedItem) return;

    // Run measurements outside Angular's change detection to reduce reflow
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const sidebarRect = this.sidebarContainer!.nativeElement.getBoundingClientRect();
        const itemRect = selectedItem.getBoundingClientRect();
        
        // Calculate the center position of the selected item relative to sidebar top
        const itemCenterY = itemRect.top - sidebarRect.top + itemRect.height / 2;
        
        // Run state updates back inside Angular zone
        this.ngZone.run(() => {
          // Set arrow vertical position to align with item center
          this.arrowPosition.set(itemCenterY - 16); // 16 is half of arrow height (32px / 2)
          
          // For now, keep arrow pointing straight left (0 rotation)
          // You can add slight rotation based on item position if needed
          this.arrowRotation.set(0);
        });
      });
    });
  }

  getArrowPosition(): number {
    return this.arrowPosition();
  }

  onPageChange(event: PaginatorState): void {
    if (event.first !== undefined && event.rows !== undefined) {
      const newPage = Math.floor(event.first / event.rows) + 1;
      this.loadProjects(newPage, this.selectedSlug());
    }
  }

  // Cache window width to avoid repeated reads
  private cachedWindowWidth = signal<number | null>(null);
  private resizeHandler?: () => void;

  private getWindowWidth(): number {
    if (!this.isBrowser) return 1024; // Default desktop width for SSR
    
    // Cache width to avoid repeated getBoundingClientRect/offsetWidth calls
    const cached = this.cachedWindowWidth();
    if (cached !== null) {
      return cached;
    }
    
    // Read once and cache - Run outside Angular zone to reduce reflow
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const width = window.innerWidth;
        this.ngZone.run(() => {
          this.cachedWindowWidth.set(width);
        });
      });
    });
    
    // Setup resize listener with debounce (only once)
    if (typeof window !== 'undefined' && !this.resizeHandler) {
      // Create debounced resize handler
      this.resizeHandler = debounce(() => {
        this.ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            const width = window.innerWidth;
            this.ngZone.run(() => {
              this.cachedWindowWidth.set(width);
            });
          });
        });
      }, 200);
      
      // Add passive resize listener
      window.addEventListener('resize', this.resizeHandler, { passive: true });
    }
    
    // Return cached or current width
    return this.cachedWindowWidth() ?? window.innerWidth;
  }

  ngOnDestroy(): void {
    // Clean up resize listener
    if (this.isBrowser && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = undefined;
    }
  }

  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image) return '/images/project.png';
    let imageUrl = '';
    if (this.isBrowser) {
      const width = this.getWindowWidth();
      if (width < 768) imageUrl = image.mobile || image.desktop || '';
      else if (width < 1024) imageUrl = image.tablet || image.desktop || '';
      else imageUrl = image.desktop || '';
    } else imageUrl = image.desktop || '';
    const finalUrl = this.addBaseUrlIfNeeded(imageUrl);
    return finalUrl || '/images/project.png';
  }

  getProjectImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image) return '/images/project.png';
    let imageUrl = '';
    if (this.isBrowser) {
      const width = this.getWindowWidth();
      if (width < 768) imageUrl = image.mobile || image.desktop || '';
      else if (width < 1024) imageUrl = image.tablet || image.desktop || '';
      else imageUrl = image.desktop || '';
    } else imageUrl = image.desktop || '';
    const finalUrl = this.addBaseUrlIfNeeded(imageUrl);
    return finalUrl || '/images/project.png';
  }

  private addBaseUrlIfNeeded(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}/${cleanUrl}`;
  }

  // Navigate to project details page
  navigateToProjectDetails(project: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (project?.slug) {
      this.router.navigate(['/Project-Det'], { queryParams: { slug: project.slug } });
    }
  }
}
