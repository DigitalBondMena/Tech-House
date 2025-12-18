import { isPlatformBrowser } from "@angular/common";
import { Component, computed, effect, inject, signal, ViewEncapsulation } from "@angular/core";  
import { CommonModule } from "@angular/common";
import { ContactUsSec } from "../../shared/components/contact-us-sec/contact-us-sec";
import { FeatureService } from "../../core/services/featureService";
import { ActivatedRoute, Router } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { PLATFORM_ID } from "@angular/core";

@Component({
  selector: 'app-blog-det',
  standalone: true,
  imports: [CommonModule, ContactUsSec],
  templateUrl: './blog-det.html',
  styleUrl: './blog-det.css',
  encapsulation: ViewEncapsulation.None
})
export class BlogDet {

  private featureService = inject(FeatureService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);

  // ===== DATA =====
  blogDetailsData = computed(() => this.featureService.blogDetailsData());
  blog = computed(() => this.blogDetailsData()?.blog ?? null);
  relatedBlogs = computed(() => this.blogDetailsData()?.related_blogs ?? []);

  hasBlog = computed(() => !!this.blog());

  // ===== HERO IMAGE =====
  heroImage = computed(() => {
    return this.getResponsiveImage(this.blog()?.image);
  });

  // ===== SECTIONS =====
  sections = signal<any[]>([]);
  activeSectionIndex = signal<number>(-1);

  activeSection = computed(() => {
    const index = this.activeSectionIndex();
    const sections = this.sections();
    if (index >= 0 && index < sections.length) {
      return sections[index] ?? null;
    }
    return null;
  });

  activeContent = computed(() => {
    const activeSection = this.activeSection();
    let html = '';
    
    if (activeSection) {
      html = activeSection.content;
    } else {
      html = this.blog()?.text ?? '';
    }
    
    // إزالة أو تعديل inline styles التي تمنع justify
    if (html) {
      // استبدال text-align في inline styles (مع أو بدون مسافات)
      html = html.replace(/style\s*=\s*"([^"]*)text-align\s*:\s*(left|right|center)([^"]*)"/gi, 
        (match, before, align, after) => {
          // إزالة text-align القديم وإضافة justify
          const cleanedBefore = before.replace(/text-align\s*:\s*(left|right|center)\s*;?\s*/gi, '');
          const cleanedAfter = after.replace(/text-align\s*:\s*(left|right|center)\s*;?\s*/gi, '');
          return `style="${cleanedBefore}text-align: justify;${cleanedAfter}"`;
        });
      
      // استبدال text-align في style attributes (حالة عامة)
      html = html.replace(/text-align\s*:\s*(left|right|center)\s*;?/gi, 'text-align: justify;');
      
      // إضافة text-align: justify إذا لم يكن موجوداً في style attributes
      html = html.replace(/style\s*=\s*"([^"]*)"/gi, (match, styles) => {
        if (!styles.includes('text-align')) {
          return `style="${styles}; text-align: justify;"`;
        }
        return match;
      });
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  constructor() {
    this.route.queryParams.subscribe(params => {
      const slug = params['slug'];
      if (!slug) {
        this.router.navigate(['/Blogs']);
        return;
      }
      this.featureService.loadBlogDetails(slug);
    });

    effect(() => {
      const html = this.blog()?.text;
      if (html) {
        this.extractSections(html);
      }
    });
  }

  // ===== LOGIC =====
  extractSections(html: string) {
    const result: any[] = [];
    // استخراج فقط عناوين h2
    const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    let match;

    const matches: { index: number; title: string }[] = [];
    while ((match = regex.exec(html))) {
      matches.push({
        index: match.index,
        title: match[1].replace(/<[^>]*>/g, '').trim()
      });
    }

    if (matches.length === 0) {
      // إذا لم يوجد h2، اعرض المحتوى كله
      this.sections.set([]);
      this.activeSectionIndex.set(-1);
      return;
    }

    // استخراج المحتوى لكل قسم من h2 إلى h2 التالي
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = matches[i + 1]?.index ?? html.length;

      result.push({
        id: `sec-${i}`,
        title: matches[i].title,
        content: html.slice(start, end),
        index: i
      });
    }

    this.sections.set(result);
    this.activeSectionIndex.set(0);
  }

  navigateToSection(i: number) {
    if (i >= 0 && i < this.sections().length) {
      this.activeSectionIndex.set(i);
      // التمرير إلى المحتوى عند الضغط على عنوان
      if (this.isBrowser) {
        setTimeout(() => {
          const contentElement = document.querySelector('.blog-content');
          if (contentElement) {
            contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }

  isSectionActive(index: number): boolean {
    const currentIndex = this.activeSectionIndex();
    return currentIndex >= 0 && currentIndex === index;
  }

  navigateToRelatedBlog(blog: any) {
    this.router.navigate(['/Blog-Det'], {
      queryParams: { slug: blog.slug }
    });
  }

  getResponsiveImage(images?: string[] | null): string {
    if (!images?.length) return '/images/placeholder.png';
    return images[2] ?? images[0];
  }

  getResponsiveImageFromObject(img: any): string {
    if (!img) return '/images/placeholder.png';
    return img.desktop ?? img.mobile;
  }
}
