import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

// Counter to track active requests
let activeRequests = 0;

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
      
      // Hide spinner only when all requests are complete
      if (activeRequests === 0) {
        spinner.hide();
      }
      
      // Safety check: reset counter if it goes negative
      if (activeRequests < 0) {
        activeRequests = 0;
      }
    })
  );
};
