import { Component, OnInit, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { FeatureService } from '../../core/services/featureService';
import { environment } from '../../../environments/environment';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-blogs',
  imports: [
    CommonModule,
    HeroSection,
    ContactUsSec,
    PaginatorModule
  ],
  templateUrl: './blogs.html',
  styleUrl: './blogs.css'
})
export class Blogs implements OnInit {
  private featureService = inject(FeatureService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  blogsData = computed(() => this.featureService.blogsData());
  bannerSection = computed(() => this.blogsData()?.bannerSection ?? null);
  blogs = computed(() => this.blogsData()?.blogs ?? null);
  blogItems = computed(() => this.blogs()?.data ?? []);
  
  // Pagination state
  rows = signal(9);
  totalRecords = computed(() => this.blogs()?.total ?? 0);
  currentPage = computed(() => this.blogs()?.current_page ?? 1);
  totalPages = computed(() => this.blogs()?.last_page ?? 1);
  first = computed(() => (this.currentPage() - 1) * this.rows());

  ngOnInit(): void {
    this.loadBlogs(1);

    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  loadBlogs(page: number): void {
    this.featureService.loadBlogsData(page);
  }

  onPageChange(event: PaginatorState): void {
    if (event.first !== undefined && event.rows !== undefined) {
      const newPage = Math.floor(event.first / event.rows) + 1;
      this.loadBlogs(newPage);
    }
  }

  navigateToBlogDetail(blog: any): void {
    this.router.navigate(['/Blog-Det'], { queryParams: { slug: blog.slug } });
  }

  getResponsiveImage(image: { desktop: string; tablet: string; mobile: string } | null | undefined): string {
    if (!image) return '/images/placeholder.png';
    let imageUrl = '';
    if (this.isBrowser) {
      const width = window.innerWidth;
      if (width < 768) imageUrl = image.mobile || image.desktop || '';
      else if (width < 1024) imageUrl = image.tablet || image.desktop || '';
      else imageUrl = image.desktop || '';
    } else imageUrl = image.desktop || '';
    return this.addBaseUrlIfNeeded(imageUrl);
  }

  private addBaseUrlIfNeeded(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}/${cleanUrl}`;
  }
}
