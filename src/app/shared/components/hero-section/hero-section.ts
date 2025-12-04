import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  imports: [],
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
}
