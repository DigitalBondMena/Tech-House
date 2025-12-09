import { Component } from '@angular/core';
import { SectionTitle } from '../section-title/section-title';
import { AppButton } from '../app-button/app-button';

@Component({
  selector: 'app-contact-us-sec',
  imports: [SectionTitle, AppButton],
  templateUrl: './contact-us-sec.html',
  styleUrl: './contact-us-sec.css'
})
export class ContactUsSec {
  //! section title data
  projectsTitle = "تواصل معنا";

  //! button data
  btnText = "ارسال ";

}
