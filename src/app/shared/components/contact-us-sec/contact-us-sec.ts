import { Component, OnInit, signal, computed } from '@angular/core';
import { SectionTitle } from '../section-title/section-title';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Country } from './models/country.model';
import { COUNTRIES } from './models/countries';
import { AppButton } from '../app-button/app-button';

@Component({
  selector: 'app-contact-us-sec',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SectionTitle, 
    InputTextModule,
    TextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectModule,
    FloatLabelModule,
    AppButton
  ],
  templateUrl: './contact-us-sec.html',
  styleUrl: './contact-us-sec.css'
})
export class ContactUsSec implements OnInit {
  // Contact Us Section Data
  contactTitle = "تواصل معنا";
  contactSubtitle = "نجاحك الرقمي يبدأ بخطوة معنا، بداية تصنع الفرق.";
  BtnText = "إرسال";

  // Countries List
  countries = COUNTRIES;

  // Selected Country - Initialize with Saudi Arabia as default (use exact reference from array)
  selectedCountryModel: Country = COUNTRIES[0];
  
  // Selected Country Signal (syncs with model) - Initialize with Saudi Arabia
  selectedCountry = signal<Country>(COUNTRIES[0]);

  // Contact Form Data using Signals
  fullName = signal('');
  email = signal('');
  phone = signal('');
  countryCode = signal('sa');
  message = signal('');

  // Form Controls
  contactForm!: FormGroup;
  fullNameControl!: FormControl;
  emailControl!: FormControl;
  phoneControl!: FormControl;
  messageControl!: FormControl;

  // Computed values
  selectedDialCode = computed(() => this.selectedCountry()?.dialCode || '+966');
  selectedCountryCode = computed(() => this.selectedCountry()?.code || 'sa');

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Ensure default value is properly set (Saudi Arabia is first in COUNTRIES array)
    this.selectedCountryModel = COUNTRIES[0];
    this.selectedCountry.set(COUNTRIES[0]);
    this.countryCode.set(COUNTRIES[0].code);
    
    this.initializeForm();
  }

  // Initialize Contact Form
  private initializeForm() {
    this.fullNameControl = this.fb.control('', [Validators.required]);
    this.emailControl = this.fb.control('', [
      Validators.required, 
      Validators.email, 
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]);
    this.phoneControl = this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{9,}$/)]);
    this.messageControl = this.fb.control('', [Validators.required]);

    this.contactForm = this.fb.group({
      fullName: this.fullNameControl,
      email: this.emailControl,
      phone: this.phoneControl,
      message: this.messageControl
    });

    // Sync signals with form controls
    this.fullNameControl.valueChanges.subscribe(value => this.fullName.set(value || ''));
    this.emailControl.valueChanges.subscribe(value => this.email.set(value || ''));
    this.phoneControl.valueChanges.subscribe(value => this.phone.set(value || ''));
    this.messageControl.valueChanges.subscribe(value => this.message.set(value || ''));
  }

  // Handle Country Selection
  onCountryChange(country: Country) {
    if (country) {
      this.selectedCountry.set(country);
      this.countryCode.set(country.code);
      this.selectedCountryModel = country;
    }
  }

  // Submit Contact Form
  onSubmit() {
    if (this.contactForm.valid) {
      const formData = {
        fullName: this.fullName(),
        email: this.email(),
        phone: `${this.selectedDialCode()}${this.phone()}`,
        countryCode: this.selectedCountryCode(),
        message: this.message()
      };
      
      console.log('Form submitted:', formData);
      // Here you would typically send the form data to your backend
      // You can add a success message or redirect the user here
    } else {
      // Mark all fields as touched to display validation messages
      Object.values(this.contactForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
}
