import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private loaded = false;
  private loadingPromise: Promise<void> | null = null;

  /**
   * Load Google Maps JavaScript API dynamically
   * @param apiKey - Your Google Maps API key (optional, will use environment key if not provided)
   * @returns Promise that resolves when the script is loaded
   */
  load(apiKey?: string): Promise<void> {
    // If already loaded, return resolved promise
    if (this.loaded) {
      return Promise.resolve();
    }

    // If already loading, return the existing promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Create new loading promise
    this.loadingPromise = new Promise((resolve, reject) => {
      // Check if script already exists in DOM
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script exists, wait for it to load
        if ((window as any).google?.maps) {
          this.loaded = true;
          resolve();
        } else {
          existingScript.addEventListener('load', () => {
            this.loaded = true;
            resolve();
          });
          existingScript.addEventListener('error', reject);
        }
        return;
      }

      // Get API key from parameter or environment
      const key = apiKey || this.getApiKey();
      if (!key) {
        reject(new Error('Google Maps API key is required. Please provide it via parameter or set it in environment.googleMapsApiKey'));
        return;
      }

      // Create and append script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      
      script.onerror = () => {
        this.loadingPromise = null;
        reject(new Error('Failed to load Google Maps script'));
      };
      
      document.body.appendChild(script);
    });

    return this.loadingPromise;
  }

  /**
   * Check if Google Maps is already loaded
   */
  isLoaded(): boolean {
    return this.loaded && !!(window as any).google?.maps;
  }

  /**
   * Get API key from environment
   */
  private getApiKey(): string | null {
    // Try to get from environment
    if (environment.googleMapsApiKey) {
      return environment.googleMapsApiKey;
    }
    
    // Try to get from window (if set globally)
    if ((window as any).GOOGLE_MAPS_API_KEY) {
      return (window as any).GOOGLE_MAPS_API_KEY;
    }
    
    return null;
  }
}

