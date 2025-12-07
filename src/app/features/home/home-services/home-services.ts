import { Component } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';

@Component({
  selector: 'app-home-services',
  imports: [SectionTitle],
  templateUrl: './home-services.html',
  styleUrl: './home-services.css'
})
export class HomeServices {
  //! section title data
  servicesTitle = "خدماتنا";

}
