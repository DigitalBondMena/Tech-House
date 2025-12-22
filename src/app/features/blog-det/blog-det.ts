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

  fullContent = computed(() => {
    // جعل computed يعتمد على activeSectionIndex للتحديث
    const activeIndex = this.activeSectionIndex();
    let html = this.blog()?.text ?? '';
    
    // إضافة IDs و classes للعناوين h2 للـ scroll
    if (html) {
      const sections = this.sections();
      // نستخدم regex للعثور على جميع h2 وإضافة IDs
      html = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attributes, content) => {
        // تنظيف المحتوى من HTML tags للمقارنة
        const cleanContent = content.replace(/<[^>]*>/g, '').trim();
        
        // البحث عن القسم المقابل
        const sectionIndex = sections.findIndex(s => {
          const cleanTitle = s.title.trim();
          return cleanContent === cleanTitle || cleanContent.includes(cleanTitle) || cleanTitle.includes(cleanContent);
        });
        
        const finalIndex = sectionIndex >= 0 ? sectionIndex : -1;
        
        // إضافة class للعنوان النشط
        let classAttr = '';
        if (finalIndex === activeIndex && finalIndex >= 0) {
          classAttr = ' class="section-heading-active"';
        } else {
          classAttr = ' class="section-heading"';
        }
        
        // إضافة أو استبدال id
        let newAttributes = attributes;
        if (finalIndex >= 0) {
          if (newAttributes.includes('id=')) {
            newAttributes = newAttributes.replace(/id="[^"]*"/, `id="section-${finalIndex}"`);
          } else {
            newAttributes = `${newAttributes} id="section-${finalIndex}"`;
          }
        }
        
        // إضافة class
        if (!newAttributes.includes('class=')) {
          newAttributes = `${newAttributes}${classAttr}`;
        } else {
          newAttributes = newAttributes.replace(/class="([^"]*)"/, (m: string, classes: string) => {
            return `class="${classes} ${finalIndex === activeIndex && finalIndex >= 0 ? 'section-heading-active' : 'section-heading'}"`;
          });
        }
        
        return `<h2${newAttributes}>${content}</h2>`;
      });
      
      // إزالة أو تعديل inline styles التي تمنع justify و font-family
      // إزالة font-family من inline styles لأن CSS rules ستطبقها
      html = html.replace(/style\s*=\s*"([^"]*)"/gi, (match, styles) => {
        // إزالة font-family من inline styles
        let cleanedStyles = styles.replace(/font-family\s*:\s*[^;]+;?\s*/gi, '');
        // تنظيف الفواصل الزائدة
        cleanedStyles = cleanedStyles.replace(/;\s*;/g, ';').replace(/^\s*;\s*|\s*;\s*$/g, '');
        return `style="${cleanedStyles}"`;
      });
      
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

    // تحديث المحتوى عند تغيير العنوان النشط
    effect(() => {
      const activeIndex = this.activeSectionIndex();
      const sections = this.sections();
      if (activeIndex >= 0 && sections.length > 0 && this.isBrowser) {
        // تحديث classes للعناوين بعد render
        setTimeout(() => {
          sections.forEach((section, index) => {
            const element = document.getElementById(`section-${index}`);
            if (element) {
              if (index === activeIndex) {
                element.classList.add('section-heading-active');
                element.classList.remove('section-heading');
              } else {
                element.classList.remove('section-heading-active');
                element.classList.add('section-heading');
              }
            }
          });
        }, 100);
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
      // التمرير إلى العنوان المقابل في المحتوى
      if (this.isBrowser) {
        // استخدام setTimeout مع delay أكبر لضمان تحديث DOM
        setTimeout(() => {
          const sectionId = `section-${i}`;
          // محاولة متعددة للعثور على العنصر
          let attempts = 0;
          const findAndScroll = () => {
            const targetElement = document.getElementById(sectionId);
            if (targetElement) {
              // حساب الموضع مع offset
              const elementPosition = targetElement.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - 120; // 120px offset من الأعلى
              
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            } else if (attempts < 5) {
              // إعادة المحاولة إذا لم يتم العثور على العنصر
              attempts++;
              setTimeout(findAndScroll, 100);
            }
          };
          findAndScroll();
        }, 200);
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
