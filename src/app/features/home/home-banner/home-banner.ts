import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-home-banner',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './home-banner.html',
  styleUrl: './home-banner.css'
})
export class HomeBanner {
  @Input() scrollTitle?: string;
}
