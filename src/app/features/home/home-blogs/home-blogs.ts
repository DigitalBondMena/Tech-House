import { Component } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { AppButton } from '../../../shared/components/app-button/app-button';

@Component({
  selector: 'app-home-blogs',
  imports: [SectionTitle, AppButton],
  templateUrl: './home-blogs.html',
  styleUrl: './home-blogs.css'
})
export class HomeBlogs {
  //! section title data
  projectsTitle = " المقالات";

  //! button data
  btnText = "مقالات اكثر";


  activeCard: number = 2;

  //! method to set active card
  setActive(cardNumber: number) {
    this.activeCard = cardNumber;
  }
}
