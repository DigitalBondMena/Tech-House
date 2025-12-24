import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

// Counter to track active requests
let activeRequests = 0;

// Flag to control if interceptor should auto-hide spinner
// This will be controlled by MainLayout for initial load
let shouldAutoHide = true;

// Export function to check if there are active requests
export function hasActiveRequests(): boolean {
  return activeRequests > 0;
}

// Export function to set auto-hide behavior
export function setAutoHideSpinner(value: boolean) {
  shouldAutoHide = value;
}

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const spinner = inject(NgxSpinnerService);
  
  // Increment counter and show spinner if this is the first request
  activeRequests++;
  if (activeRequests === 1) {
    spinner.show();
  }
  
  return next(req).pipe(
    finalize(() => {
      // Decrement counter
      activeRequests--;
      
      // Hide spinner only when all requests are complete AND auto-hide is enabled
      if (activeRequests === 0 && shouldAutoHide) {
        spinner.hide();
      }
      
      // Safety check: reset counter if it goes negative
      if (activeRequests < 0) {
        activeRequests = 0;
      }
    })
  );
};
