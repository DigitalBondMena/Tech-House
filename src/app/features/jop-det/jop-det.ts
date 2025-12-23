import { isPlatformBrowser } from "@angular/common";
import { Component, computed, effect, inject, signal, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { SelectModule } from "primeng/select";
import { FloatLabelModule } from "primeng/floatlabel";
import { ContactUsSec } from "../../shared/components/contact-us-sec/contact-us-sec";
import { SectionTitle } from "../../shared/components/section-title/section-title";
import { AppButton } from "../../shared/components/app-button/app-button";
import { FeatureService } from "../../core/services/featureService";
import { ActivatedRoute, Router } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment";
import { API_END_POINTS } from "../../core/constant/ApiEndPoints";
import { Country } from "../../shared/components/contact-us-sec/models/country.model";
import { COUNTRIES } from "../../shared/components/contact-us-sec/models/countries";

@Component({
  selector: 'app-jop-det',
  standalone: true,
  imports: [
    CommonModule, 
    ContactUsSec,
    SectionTitle,
    AppButton,
    FormsModule, 
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectModule,
    FloatLabelModule
  ],
  templateUrl: './jop-det.html',
  styleUrl: './jop-det.css',
  encapsulation: ViewEncapsulation.None
})
export class JopDet {

  private featureService = inject(FeatureService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  isBrowser = isPlatformBrowser(this.platformId);



  // ===== LOADING STATE =====
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');

  // ===== DATA =====
  jobDetailsData = computed(() => this.featureService.jobDetailsData());
  job = computed(() => this.jobDetailsData()?.job ?? null);

  hasJob = computed(() => !!this.job());

  // ===== JOB SECTIONS =====
  jobSections = computed(() => {
    const sections = this.job()?.job_sections ?? [];
    // Sort by order if available
    return sections.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  });

  // ===== HERO SECTION DATA =====
  heroTitle = computed(() => {
    return this.getDataOrPlaceholder(this.job()?.title);
  });

  heroSubtitle = computed(() => {
    const job = this.job();
    const parts: string[] = [];
    
    if (job?.working_hours) {
      parts.push(`⏰ ${job.working_hours}`);
    }
    if (job?.working_location) {
      parts.push(`📍 ${job.working_location}`);
    }
    if (job?.working_experience) {
      parts.push(`💼 ${job.working_experience}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'لا يوجد بيانات';
  });

  heroJobInfo = computed(() => {
    const job = this.job();
    const info: Array<{ label: string; icon: string }> = [];
    
    if (job?.working_hours) {
      info.push({
        label: job.working_hours,
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
      });
    }
    if (job?.working_location) {
      info.push({
        label: job.working_location,
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
      });
    }
    if (job?.working_experience) {
      info.push({
        label: job.working_experience,
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`
      });
    }
    
    return info;
  });

  heroParagraph = computed(() => {
    const job = this.job();
    if (job?.text) return job.text;
    if (job?.brief) return job.brief;
    return 'لا يوجد بيانات';
  });

  heroBtn = computed(() => {
    // Return a string to show the button
    return this.hasJob() ? 'show' : undefined;
  });

  heroBtnText = computed(() => {
    return 'قدم الآن';
  });

  heroBtnClass = computed(() => {
    return 'px-7 py-4 bg-black/60 text-white rounded-full flex items-center justify-center transition duration-300 mt-1!';
  });

  // ===== CONTENT =====
  sanitizeHtml(html: string) {
    if (!html) return this.sanitizer.bypassSecurityTrustHtml('');
    
    // Check if content already contains HTML tags (ul, li, p, div, etc.)
    const hasHtmlTags = /<(ul|li|p|div|h[1-6]|br|strong|b|em|i|a|span)[\s>]/.test(html);
    
    if (!hasHtmlTags) {
      // Convert plain text to bullet list
      // Split by newlines or common separators
      const lines = html
        .split(/\n+|•|·|▪|▫|-/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (lines.length > 0) {
        const listItems = lines.map(line => `<li>${line}</li>`).join('');
        html = `<ul>${listItems}</ul>`;
      }
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  sanitizeIcon(icon: string) {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  constructor() {
    // Initialize form
    this.initializeForm();
    
    this.route.queryParams.subscribe(params => {
      const slug = params['slug'];
      if (!slug) {
        this.router.navigate(['/Jops']);
        return;
      }
      // Reset state when slug changes
      this.isLoading.set(true);
      this.hasError.set(false);
      this.errorMessage.set('');
      // Load new data
      this.featureService.loadJobDetails(slug);
    });

    // Watch for data changes - this will trigger when data arrives
    effect(() => {
      const data = this.jobDetailsData();
      const job = this.job();
      
      if (data !== null) {
        // Data has been loaded (even if null)
        this.isLoading.set(false);
        
        if (data && job) {
          // Data exists and job exists
          this.hasError.set(false);
          this.errorMessage.set('');
        } else if (data && !job) {
          // Data loaded but no job
          this.hasError.set(true);
          this.errorMessage.set('الوظيفة غير موجودة');
        }
      }
    });

    // Timeout for loading state
    if (this.isBrowser) {
      setTimeout(() => {
        if (this.isLoading() && !this.job()) {
          this.isLoading.set(false);
          this.hasError.set(true);
          this.errorMessage.set('تعذر تحميل بيانات الوظيفة. يرجى المحاولة مرة أخرى.');
        }
      }, 10000); // 10 seconds timeout
    }
  }

  // ===== NAVIGATION =====
  navigateToJobs(): void {
    this.router.navigate(['/Jops']);
  }

  scrollToApply(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        const applySection = document.querySelector('#apply-form');
        if (applySection) {
          applySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  // ===== HELPER METHODS =====
  getDataOrPlaceholder(data: string | undefined | null): string {
    return data && data.trim() ? data : 'لا يوجد بيانات';
  }

  // Form Control Getters for Error Messages
  get fullNameControl(): AbstractControl | null {
    return this.jobApplicationForm.get('fullName');
  }

  get phoneControl(): AbstractControl | null {
    return this.jobApplicationForm.get('phone');
  }

  get emailControl(): AbstractControl | null {
    return this.jobApplicationForm.get('email');
  }

  get experienceControl(): AbstractControl | null {
    return this.jobApplicationForm.get('experience');
  }

  get expectedSalaryControl(): AbstractControl | null {
    return this.jobApplicationForm.get('expectedSalary');
  }

  get currentSalaryControl(): AbstractControl | null {
    return this.jobApplicationForm.get('currentSalary');
  }

  get messageControl(): AbstractControl | null {
    return this.jobApplicationForm.get('message');
  }

  // Error Message Getters
  getFullNameError(): string | null {
    const control = this.fullNameControl;
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return 'الاسم مطلوب';
    }
    return null;
  }

  getPhoneError(): string | null {
    const control = this.phoneControl;
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return 'رقم الهاتف مطلوب';
      if (control.errors['invalidPhone']) return 'رقم الهاتف يجب أن يحتوي على أرقام فقط';
      if (control.errors['invalidCountry']) return 'الدولة المختارة غير مدعومة';
      if (control.errors['invalidLength']) {
        const error = control.errors['invalidLength'];
        return `رقم الهاتف يجب أن يكون ${error.requiredLength} أرقام (${error.actualLength} رقم تم إدخاله)`;
      }
      if (control.errors['invalidFormat']) {
        const error = control.errors['invalidFormat'];
        return `رقم الهاتف لا يطابق تنسيق ${error.country}. يرجى إدخال رقم صحيح`;
      }
    }
    return null;
  }

  getEmailError(): string | null {
    const control = this.emailControl;
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return 'البريد الالكتروني مطلوب';
      if (control.errors?.['email']) return 'البريد الالكتروني غير صحيح';
    }
    return null;
  }

  getExperienceError(): string | null {
    const control = this.experienceControl;
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return 'سنين الخبرة مطلوبة';
    }
    return null;
  }

  getExpectedSalaryError(): string | null {
    const control = this.expectedSalaryControl;
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return 'الراتب المتوقع مطلوب';
    }
    return null;
  }

  getCurrentSalaryError(): string | null {
    const control = this.currentSalaryControl;
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return 'الراتب الحالي مطلوب';
    }
    return null;
  }

  // ===== JOB APPLICATION FORM =====
  // Countries List
  countries = COUNTRIES;

  // Selected Country - Initialize with Saudi Arabia as default
  selectedCountryModel: Country = COUNTRIES[0];
  
  // Selected Country Signal (syncs with model) - Initialize with Saudi Arabia
  selectedCountry = signal<Country>(COUNTRIES[0]);

  // Computed values
  selectedDialCode = computed(() => this.selectedCountry()?.dialCode || '+966');
  selectedCountryCode = computed(() => this.selectedCountry()?.code || 'sa');
  
  // Phone patterns for each country (regex patterns) - Same as contact-us
  private phonePatterns: { [key: string]: { pattern: RegExp; minLength: number; maxLength: number; placeholder: string } } = {
    'sa': { pattern: /^5[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '5XX XXX XXXX' },
    'eg': { pattern: /^1[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '1XXX XXX XXXX' },
    'ae': { pattern: /^5[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '5X XXX XXXX' },
    'kw': { pattern: /^5[0-9]{7}$/, minLength: 8, maxLength: 8, placeholder: '5XXX XXXX' },
    'qa': { pattern: /^3[0-9]{7}$/, minLength: 8, maxLength: 8, placeholder: '3XXX XXXX' },
    'bh': { pattern: /^3[0-9]{7}$/, minLength: 8, maxLength: 8, placeholder: '3XXX XXXX' },
    'om': { pattern: /^9[0-9]{7}$/, minLength: 8, maxLength: 8, placeholder: '9XXX XXXX' },
    'jo': { pattern: /^7[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '7X XXX XXXX' },
    'lb': { pattern: /^3[0-9]{6}$/, minLength: 7, maxLength: 7, placeholder: '3X XXX XXX' },
    'sy': { pattern: /^9[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '9XXX XXX XXX' },
    'iq': { pattern: /^7[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '7XX XXX XXXX' },
    'ye': { pattern: /^7[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '7XX XXX XXX' },
    'ma': { pattern: /^6[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '6XX XXX XXX' },
    'dz': { pattern: /^5[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '5XX XX XX XX' },
    'tn': { pattern: /^2[0-9]{7}$/, minLength: 8, maxLength: 8, placeholder: '2X XXX XXX' },
    'ly': { pattern: /^9[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '9X XXX XXXX' },
    'sd': { pattern: /^9[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '9XX XXX XXXX' },
    'us': { pattern: /^[2-9][0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '(XXX) XXX-XXXX' },
    'gb': { pattern: /^7[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '7XXX XXXXXX' },
    'ca': { pattern: /^[2-9][0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '(XXX) XXX-XXXX' },
    'au': { pattern: /^4[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '4XX XXX XXX' },
    'fr': { pattern: /^6[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '6 XX XX XX XX' },
    'de': { pattern: /^1[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '1XX XXXXXXX' },
    'it': { pattern: /^3[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '3XX XXX XXXX' },
    'es': { pattern: /^6[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '6XX XXX XXX' },
    'in': { pattern: /^[6-9][0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '9XXXX XXXXX' },
    'cn': { pattern: /^1[3-9][0-9]{9}$/, minLength: 11, maxLength: 11, placeholder: '1XX XXXX XXXX' },
    'jp': { pattern: /^[789]0[0-9]{8}$/, minLength: 11, maxLength: 11, placeholder: '90-XXXX-XXXX' },
    'kr': { pattern: /^1[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '10-XXXX-XXXX' },
    'ru': { pattern: /^9[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '9XX XXX-XX-XX' },
    'tr': { pattern: /^5[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '5XX XXX XX XX' },
    'ir': { pattern: /^9[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '9XX XXX XXXX' },
    'pk': { pattern: /^3[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '3XX-XXXXXXX' },
    'bd': { pattern: /^1[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '1XXX-XXXXXX' },
    'id': { pattern: /^8[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '8XX-XXXX-XXXX' },
    'my': { pattern: /^1[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '1X-XXX XXXX' },
    'sg': { pattern: /^9[0-9]{7}$/, minLength: 8, maxLength: 8, placeholder: '9XXXX XXX' },
    'th': { pattern: /^8[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '8X-XXX-XXXX' },
    'ph': { pattern: /^9[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '9XX XXX XXXX' },
    'vn': { pattern: /^9[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '9X XXXX XXXX' },
    'za': { pattern: /^[6-9][0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: 'XX XXX XXXX' },
    'ng': { pattern: /^8[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '8XX XXX XXXX' },
    'ke': { pattern: /^7[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '7XX XXX XXX' },
    'br': { pattern: /^[1-9][0-9]{10}$/, minLength: 11, maxLength: 11, placeholder: '(XX) XXXXX-XXXX' },
    'ar': { pattern: /^1[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '11 XXXX-XXXX' },
    'mx': { pattern: /^5[0-9]{9}$/, minLength: 10, maxLength: 10, placeholder: '55 XXXX XXXX' },
    'cl': { pattern: /^9[0-9]{8}$/, minLength: 9, maxLength: 9, placeholder: '9 XXXX XXXX' }
  };

  // Phone placeholder based on selected country
  phonePlaceholder = computed(() => {
    const country = this.selectedCountry();
    const phoneInfo = this.phonePatterns[country?.code || 'sa'];
    return phoneInfo?.placeholder || 'XXXXXXXXXX';
  });

  jobApplicationForm!: FormGroup;

  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);

  private initializeForm() {
    // Custom validator for phone based on selected country - Same as contact-us
    const phoneValidator = (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }
      
      // First check if it's only numbers
      const phonePattern = /^[0-9]+$/;
      if (!phonePattern.test(control.value)) {
        return { invalidPhone: true };
      }
      
      // Get current country pattern
      const countryCode = this.selectedCountryCode();
      const phoneInfo = this.phonePatterns[countryCode];
      
      if (!phoneInfo) {
        return { invalidCountry: true };
      }
      
      // Check length first
      const phoneLength = control.value.length;
      if (phoneLength < phoneInfo.minLength) {
        return { 
          invalidLength: { 
            requiredLength: phoneInfo.minLength, 
            maxLength: phoneInfo.maxLength,
            actualLength: phoneLength,
            type: 'min'
          } 
        };
      }
      
      if (phoneLength > phoneInfo.maxLength) {
        return { 
          invalidLength: { 
            requiredLength: phoneInfo.minLength, 
            maxLength: phoneInfo.maxLength,
            actualLength: phoneLength,
            type: 'max'
          } 
        };
      }
      
      // Check pattern match (format validation)
      if (!phoneInfo.pattern.test(control.value)) {
        return { 
          invalidFormat: { 
            country: this.selectedCountry()?.name || 'المختارة',
            requiredLength: phoneInfo.minLength
          } 
        };
      }
      
      return null;
    };

    this.jobApplicationForm = this.fb.group({
      fullName: ['', [Validators.required]],
      phone: ['', [Validators.required, phoneValidator]],
      email: ['', [Validators.required, Validators.email]],
      experience: ['', [Validators.required]],
      expectedSalary: ['', [Validators.required]],
      currentSalary: ['', [Validators.required]],
      message: [''],
      portfolio: [null as File | null],
      cv: [null as File | null]
    });
  }

  // Handle Country Selection - Same as contact-us
  onCountryChange(country: Country) {
    if (country) {
      this.selectedCountry.set(country);
      this.selectedCountryModel = country;
      
      // Re-validate phone number when country changes
      const phoneControl = this.jobApplicationForm.get('phone');
      if (phoneControl) {
        phoneControl.updateValueAndValidity();
        // Clear phone field when country changes to prevent invalid formats
        phoneControl.setValue('');
      }
    }
  }

  // Prevent letters in phone field - Same as contact-us
  onPhoneKeyPress(event: KeyboardEvent): boolean {
    const char = String.fromCharCode(event.which || event.keyCode);
    // Only allow numbers
    const numberPattern = /[0-9]/;
    
    if (!numberPattern.test(char)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onPortfolioChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.jobApplicationForm.patchValue({ portfolio: input.files[0] });
    }
  }

  onCvChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.jobApplicationForm.patchValue({ cv: input.files[0] });
    }
  }

  onSubmitApplication(): void {
    if (this.jobApplicationForm.valid && this.job()) {
      const formData = new FormData();
      formData.append('email', this.jobApplicationForm.value.email);
      formData.append('phone', this.jobApplicationForm.value.phone);
      formData.append('message', this.jobApplicationForm.value.message || '');
      formData.append('job_information_id', this.job()!.id.toString());
      formData.append('experience', this.jobApplicationForm.value.experience);
      formData.append('expected_salary', this.jobApplicationForm.value.expectedSalary);
      formData.append('current_salary', this.jobApplicationForm.value.currentSalary);
      
      if (this.jobApplicationForm.value.portfolio) {
        formData.append('portfolio', this.jobApplicationForm.value.portfolio);
      }
      if (this.jobApplicationForm.value.cv) {
        formData.append('cv', this.jobApplicationForm.value.cv);
      }

      this.isSubmitting.set(true);
      this.submitSuccess.set(false);
      this.submitError.set(null);

      this.http.post(`${this.apiUrl}${API_END_POINTS.SUBMIT_JOB_FORM}`, formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(true);
          this.jobApplicationForm.reset();
          setTimeout(() => {
            this.submitSuccess.set(false);
          }, 5000);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.submitError.set(error.error?.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
          setTimeout(() => {
            this.submitError.set(null);
          }, 5000);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.jobApplicationForm.controls).forEach(key => {
        this.jobApplicationForm.get(key)?.markAsTouched();
      });
    }
  }
}
