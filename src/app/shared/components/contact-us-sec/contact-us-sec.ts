import { Component, OnInit } from '@angular/core';
import { SectionTitle } from '../section-title/section-title';
import { AppButton } from '../app-button/app-button';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-contact-us-sec',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SectionTitle, 
    AppButton,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
  templateUrl: './contact-us-sec.html',
  styleUrl: './contact-us-sec.css'
})
export class ContactUsSec implements OnInit {
  //! section title data
  projectsTitle = "تواصل معنا";

  //! button data
  btnText = "ارسل ";

  // Form group
  contactForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,}$/)]],
      message: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', this.contactForm.value);
      // You can add a success message or redirect the user here
    } else {
      // Mark all fields as touched to display validation messages
      Object.values(this.contactForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  // Helper method to check if a form field is invalid
  isFieldInvalid(field: string): boolean {
    const control = this.contactForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}
