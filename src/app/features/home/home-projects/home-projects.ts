import { Component } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';

@Component({
  selector: 'app-home-projects',
  imports: [SectionTitle],
  templateUrl: './home-projects.html',
  styleUrl: './home-projects.css'
})
export class HomeProjects {
  //! section title data
  projectsTitle = "مشاريعنا";

}
