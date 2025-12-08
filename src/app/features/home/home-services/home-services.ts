import { Component } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { AppButton } from '../../../shared/components/app-button/app-button';

@Component({
  selector: 'app-home-services',
  imports: [SectionTitle ,AppButton],
  templateUrl: './home-services.html',
  styleUrl: './home-services.css'
})
export class HomeServices {
  //! section title data
  servicesTitle = "خدماتنا";

  //! button data
  btnText = "خدمات اكثر";

}
