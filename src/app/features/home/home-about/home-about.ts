import { Component } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';

@Component({
  selector: 'app-home-about',
  imports: [SectionTitle],
  templateUrl: './home-about.html',
  styleUrl: './home-about.css'
})
export class HomeAbout {
   //! section title data
  aboutTitle = "من نحن";
}
