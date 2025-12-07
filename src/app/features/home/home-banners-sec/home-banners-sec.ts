import { Component } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { Banner } from '../../../shared/components/banner/banner';

@Component({
  selector: 'app-home-banners-sec',
  imports: [SectionTitle,HomeBannersSec,Banner],
  templateUrl: './home-banners-sec.html',
  styleUrl: './home-banners-sec.css'
})
export class HomeBannersSec {
  //! section title data
  partenersTitle = "شركاؤنا";
  clientsTitle = "عملائنا";

}
