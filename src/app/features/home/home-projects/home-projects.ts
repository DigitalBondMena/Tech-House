import { Component } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { AppButton } from '../../../shared/components/app-button/app-button';

@Component({
  selector: 'app-home-projects',
  imports: [SectionTitle, AppButton],
  templateUrl: './home-projects.html',
  styleUrl: './home-projects.css'
})
export class HomeProjects {
  //! section title data
  projectsTitle = "مشاريعنا";

  //! button data
  btnText = "مشاريع اكثر";

}
