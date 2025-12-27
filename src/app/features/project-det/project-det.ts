import { isPlatformBrowser } from "@angular/common";
import { Component, computed, effect, inject, signal, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ContactUsSec } from "../../shared/components/contact-us-sec/contact-us-sec";
import { FeatureService } from "../../core/services/featureService";
import { ActivatedRoute, Router } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { PLATFORM_ID } from "@angular/core";

@Component({
  selector: 'app-project-det',
  standalone: true,
  imports: [CommonModule, ContactUsSec],
  templateUrl: './project-det.html',
  styleUrl: './project-det.css',
  encapsulation: ViewEncapsulation.None
})
export class ProjectDet {

  private featureService = inject(FeatureService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);

  // ===== LOADING STATE =====
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');

  // ===== DATA =====
  projectDetailsData = computed(() => this.featureService.projectDetailsData());
  project = computed(() => this.projectDetailsData()?.project ?? null);

  hasProject = computed(() => !!this.project());

  // ===== HERO IMAGE =====
  heroImage = computed(() => {
    return this.getResponsiveImage(this.project()?.image);
  });

  // ===== LOGO =====
  projectLogo = computed(() => {
    return this.getResponsiveImage(this.project()?.logo);
  
  });

  // ===== SECTIONS =====
  sections = signal<any[]>([]);
  activeSectionIndex = signal<number>(0);

  activeSection = computed(() => {
    const index = this.activeSectionIndex();
    const sections = this.sections();
    if (index >= 0 && index < sections.length) {
      return sections[index] ?? null;
    }
    return null;
  });

  // ===== PROJECT DATA =====
  projectTypes = computed(() => this.project()?.project_types ?? []);
  projectTechnologies = computed(() => this.project()?.project_technologies ?? []);
  projectInformation = computed(() => this.project()?.project_information ?? []);
  projectSections = computed(() => this.project()?.projects_sections ?? []);

  // ===== CONTENT =====
  fullContent = computed(() => {
    const html = this.project()?.text ?? '';
    if (html) {
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }
    return '';
  });

  constructor() {
    this.route.queryParams.subscribe(params => {
      const slug = params['slug'];
      if (!slug) {
        this.router.navigate(['/Projects']);
        return;
      }
      // Reset state when slug changes
      this.isLoading.set(true);
      this.hasError.set(false);
      this.errorMessage.set('');
      // Load new data
      this.featureService.loadProjectDetails(slug);
    });

    // Watch for data changes - this will trigger when data arrives
    effect(() => {
      const data = this.projectDetailsData();
      const project = this.project();
      
      if (data !== null) {
        // Data has been loaded (even if null)
        this.isLoading.set(false);
        
        if (data && project) {
          // Data exists and project exists
          this.hasError.set(false);
          this.errorMessage.set('');
        } else if (data && !project) {
          // Data loaded but no project - check what we actually got
          console.warn('Data loaded but project is null. Data structure:', data);
          console.warn('Trying to extract project from data...');
          
          // Try to extract project from different possible structures
          let extractedProject = null;
          if ((data as any).project) {
            extractedProject = (data as any).project;
          } else if ((data as any).projects && Array.isArray((data as any).projects.data)) {
            // It's a ProjectsResponse - get the first project or search by slug
            const projects = (data as any).projects.data;
            const currentSlug = this.route.snapshot.queryParams['slug'];
            extractedProject = projects.find((p: any) => p.slug === currentSlug) || projects[0];
          } else if ((data as any).id) {
            // Direct project object
            extractedProject = data;
          }
          
          if (extractedProject) {
            // Manually set the project in the signal
            this.featureService.projectDetailsResponseSignal.set({ project: extractedProject } as any);
            this.hasError.set(false);
          } else {
            this.hasError.set(true);
            this.errorMessage.set('المشروع غير موجود');
          }
        }
      }
    });

    // Watch for sections
    effect(() => {
      const sections = this.projectSections();
      if (sections && sections.length > 0) {
        this.sections.set(sections);
        this.activeSectionIndex.set(0);
      } else {
        // Reset sections if empty
        this.sections.set([]);
        this.activeSectionIndex.set(0);
      }
    });

    // Timeout for loading state
    if (this.isBrowser) {
      setTimeout(() => {
        if (this.isLoading() && !this.project()) {
          this.isLoading.set(false);
          this.hasError.set(true);
          this.errorMessage.set('تعذر تحميل بيانات المشروع. يرجى المحاولة مرة أخرى.');
        }
      }, 10000); // 10 seconds timeout
    }
  }

  // ===== LOGIC =====
  navigateToSection(i: number) {
    if (i >= 0 && i < this.sections().length) {
      this.activeSectionIndex.set(i);
      // Scroll to top of content area
      if (this.isBrowser) {
        setTimeout(() => {
          const contentElement = document.querySelector('.project-main-content');
          if (contentElement) {
            // contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }

  isSectionActive(index: number): boolean {
    const currentIndex = this.activeSectionIndex();
    return currentIndex >= 0 && currentIndex === index;
  }

  getResponsiveImage(images?: any): string {
    if (!images) return '/images/placeholder.png';
    if (typeof images === 'string') return images;
    if (Array.isArray(images)) {
      return images[2] ?? images[0] ?? '/images/placeholder.png';
    }
    // ResponsiveImage object
    if (this.isBrowser) {
      const width = window.innerWidth;
      if (width >= 1024) {
        return images.desktop ?? images.tablet ?? images.mobile ?? '/images/placeholder.png';
      } else if (width >= 768) {
        return images.tablet ?? images.desktop ?? images.mobile ?? '/images/placeholder.png';
      } else {
        return images.mobile ?? images.tablet ?? images.desktop ?? '/images/placeholder.png';
      }
    }
    return images.desktop ?? images.tablet ?? images.mobile ?? '/images/placeholder.png';
  }

  getTechnologyLogo(tech: any): string {
    // You can customize this based on your technology data structure
    if (tech.logo) {
      return this.getResponsiveImage(tech.logo);
    }
    if (tech.image) {
      return this.getResponsiveImage(tech.image);
    }
    return '/images/placeholder.png';
  }

  getTechnologyName(tech: any): string {
    return tech.name ?? tech.title ?? tech.technology_name ?? '';
  }

  sanitizeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
