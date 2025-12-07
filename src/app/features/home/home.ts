import { Component } from '@angular/core';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { HomeAbout } from './home-about/home-about';
import { HomeServices } from './home-services/home-services';
import { HomeProjects } from './home-projects/home-projects';
import { HomeBooking } from './home-booking/home-booking';
import { HomeClientsReview } from './home-clients-review/home-clients-review';
import { HomeBanner } from './home-banner/home-banner';
import { HomeBlogs } from './home-blogs/home-blogs';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';
import { Banner } from "../../shared/components/banner/banner";
import { HomeBannersSec } from './home-banners-sec/home-banners-sec';

@Component({
  selector: 'app-home',
  imports: [HeroSection , HomeAbout,HomeBannersSec , HomeServices, HomeProjects, HomeBooking, HomeClientsReview, HomeBlogs, ContactUsSec],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  //! hero section data
  homeTitle = "ابتكارات تسويقية رقمية تصنع الفرق لشركتك .";
  btn = " ابتكار يصنع خدماتنا ";
  homeSubtitle = "";
  homeParagraph = "";
  homeImage = "";

  //! section title data
  aboutTitle = "من نحن";
}
