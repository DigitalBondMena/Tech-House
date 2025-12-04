import { Component } from '@angular/core';
import { HeroSection } from '../../shared/components/hero-section/hero-section';

@Component({
  selector: 'app-home',
  imports: [HeroSection],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  homeTitle = "ابتكارات تسويقية رقمية تصنع الفرق لشركتك .";
  btn = " ابتكار يصنع خدماتنا ";
  homeSubtitle = "";
  homeParagraph = "";
  homeImage = "";
}
