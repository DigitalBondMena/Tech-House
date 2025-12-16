import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppButton } from '../app-button/app-button';
import { HomeBanner } from '../../../features/home/home-banner/home-banner';

@Component({
  selector: 'app-hero-section',
  imports: [AppButton, CommonModule],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css'
})
export class HeroSection {
  @Input() title?: string;
  @Input() btn?: string;
  @Input() subtitle?: string;
  @Input() paragraph?: string;
  @Input() image?: string;
  @Input() imagePosition: 'left' | 'center' | 'none' = 'none';
  @Input() subtitleAboveTitle: boolean = false;
  @Input() imageClass: string = ''; // Custom classes for the image



  // !btn data
  btnText = "بتكار يصنع كفائتنا";
}
