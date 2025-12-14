import {
  Component,
  Input,
  AfterViewInit,
  inject,
  computed,
  effect
} from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { AboutHome } from '../../../core/models/home.model';
import { SharedFeatureService } from '../../../core/services/sharedFeatureService';

@Component({
  selector: 'app-home-about',
  standalone: true,
  imports: [SectionTitle],
  templateUrl: './home-about.html',
  styleUrl: './home-about.css'
})
export class HomeAbout implements AfterViewInit {

  @Input() aboutData: AboutHome | null = null;

  private sharedFeatureService = inject(SharedFeatureService);

  // 🔹 counters from API (signal)
  counters = computed(() => this.sharedFeatureService.counters());

  // 🔹 animated values
  animatedCounters: number[] = [];

  private animated = false;
  private viewReady = false;

  constructor() {
    this.sharedFeatureService.loadCounters();

    // ✅ يبدأ العداد لما:
    // 1️⃣ الـ view يبقى جاهز
    // 2️⃣ الداتا توصل
    effect(() => {
      const counters = this.counters();

      if (this.viewReady && counters?.length) {
        this.startCounters();
      }
    });
  }

  ngAfterViewInit(): void {
    // ✅ تأكيد أن الـ DOM اترسم
    this.viewReady = true;
  }

  // =====================
  private startCounters(): void {
    if (this.animated) return;

    const counters = this.counters();
    if (!counters?.length) return;

    this.animated = true;
    this.animatedCounters = counters.map(() => 0);

    counters.forEach((counter, index) => {
      this.animateCounter(counter.count, index);
    });
  }

  // ✅ requestAnimationFrame (مش setInterval)
  private animateCounter(target: number, index: number): void {
    const duration = 2000;
    const start = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      this.animatedCounters[index] = Math.floor(target * progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animatedCounters[index] = target;
      }
    };

    requestAnimationFrame(animate);
  }

  getResponsiveImage(): string {
    return this.aboutData?.image?.desktop ?? '';
  }
}
