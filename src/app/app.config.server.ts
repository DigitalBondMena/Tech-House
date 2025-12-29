import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideHttpClient(withFetch()) // HTTP client with fetch for server-side API calls (better for SSR)
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
