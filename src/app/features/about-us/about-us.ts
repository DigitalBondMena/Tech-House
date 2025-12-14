import { Component, OnInit } from '@angular/core';
import { HeroSection } from '../../shared/components/hero-section/hero-section';
import { SectionTitle } from '../../shared/components/section-title/section-title';
import { AppButton } from '../../shared/components/app-button/app-button';
import { Banner } from '../../shared/components/banner/banner';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ContactUsSec } from '../../shared/components/contact-us-sec/contact-us-sec';

@Component({
  selector: 'app-about-us',
  imports: [
    HeroSection,
    SectionTitle,
    AppButton,
    Banner,
    ContactUsSec
  ],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css'
})
export class AboutUs {
  // Hero Section Data
  heroTitle = "من نحن";
  heroParagraph = "نحن وكالة نؤمن بأن الإبداع يبدأ بفهم علامتك التجارية. نبني حلولاً تعكس رؤيتك وتصنع تأثيراً في السوق.";
  heroImage = "images/About-us.png"; // سيتم استبدالها بالصورة المطلوبة لاحقاً

  // Our Story Section Data
  storyTitle = "قصتنا";
  storyText = "نحن فريق يجمع بين الإبداع والالتزام لدعم العلامات التجارية، نعمل بشغف وطاقة لتقديم خدمات مميزة، ونؤمن بأن تعاوننا ينتج نتائج تبهر الجميع.";

  // Project Card Data
  projectCardTitle = "لديك مشروع؟";
  projectCardText = "لننشئ معاً شيئاً استثنائياً، من هوية بصرية راقية إلى تجارب رقمية حديثة ومبتكرة وتفاعلية ترفع علامتك التجارية إلى مستوى جديد.";
  contactBtnText = "تواصل معنا";

  // Partners and Clients Section Data
  partnersTitle = "شركاؤنا وعملائنا";

  // Contact Us Section Data
  contactTitle = "تواصل معنا";
  contactSubtitle = "نجاحك الرقمي يبدأ بخطوة معنا، بداية تصنع الفرق.";
  sendBtnText = "إرسال";

  
}
