import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
    {
        path: '',  component: MainLayout,
        children: [
            {
             path: '',  component: Home
            },
            {
                path: 'about-us', loadComponent: () => import('./features/about-us/about-us').then(m => m.AboutUs
                )
            },
            {
                path: 'services', loadComponent: () => import('./features/services/services').then(m => m.Services
                )
            },
            {
                path: 'projects', loadComponent: () => import('./features/projects/projects').then(m => m.Projects
                )
            },
            {
                path: 'jobs', loadComponent: () => import('./features/jops/jops').then(m => m.Jops
                )
            },
            {
                path: 'blogs', loadComponent: () => import('./features/blogs/blogs').then(m => m.Blogs
                )
            },
            {
                path: 'contact-us/done', loadComponent: () => import('./features/contact-us/contact-us').then(m => m.ContactUs
                )
            },
            {
                path: 'contact-us', loadComponent: () => import('./features/contact-us/contact-us').then(m => m.ContactUs
                )
            },
            {
                path: 'privacy-policy', loadComponent: () => import('./features/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy
                )
            },
          
            {
                path: 'project-det', loadComponent: () => import('./features/project-det/project-det').then(m => m.ProjectDet
                )
            },
            {
                path: 'blog-det', loadComponent: () => import('./features/blog-det/blog-det').then(m => m.BlogDet
                )
            },
            {
                path: 'job-det/done', loadComponent: () => import('./features/jop-det/jop-det').then(m => m.JopDet
                )
            },
            {
                path: 'job-det', loadComponent: () => import('./features/jop-det/jop-det').then(m => m.JopDet
                )
            },
            { path: '**', redirectTo: '', pathMatch: 'full' },
        ]
    }
];
