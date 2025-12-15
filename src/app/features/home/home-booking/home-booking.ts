import { Component, input, AfterViewInit, ViewChild, ElementRef, effect } from '@angular/core';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { CTASection } from '../../../core/models/home.model';


@Component({
  selector: 'app-home-booking',
  imports: [AppButton],
  templateUrl: './home-booking.html',
  styleUrl: './home-booking.css'
})
export class HomeBooking implements AfterViewInit {
  //! Input for CTA Section data
  ctasection = input<CTASection | null>(null);

  //! button data
  btnText = "احجز موعدك";

  @ViewChild('videoElement', { static: false }) videoElement?: ElementRef<HTMLVideoElement>;

  constructor() {
    // Watch for video URL changes
    effect(() => {
      const videoUrl = this.ctasection()?.video;
      if (videoUrl && this.videoElement?.nativeElement) {
        this.playVideo();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.ctasection()?.video) {
      // Small delay to ensure video element is ready
      setTimeout(() => {
        this.playVideo();
      }, 100);
    }
  }

  private playVideo(): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    // Ensure video plays
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Video is playing
          console.log('Video is playing');
        })
        .catch((error) => {
          // Auto-play was prevented
          console.warn('Video autoplay prevented:', error);
          // Try to play again on user interaction
          document.addEventListener('click', () => {
            video.play().catch(() => {});
          }, { once: true });
        });
    }
  }
}
