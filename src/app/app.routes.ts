import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
    {
        path: '', component: MainLayout,
        children: [
            {
             path: '', component: Home
            },
            {
                path: 'About-Us', loadComponent: () => import('./features/about-us/about-us').then(m => m.AboutUs
                )
            },
            {
                path: 'Services', loadComponent: () => import('./features/services/services').then(m => m.Services
                )
            },
            {
                path: 'Projects', loadComponent: () => import('./features/projects/projects').then(m => m.Projects
                )
            },
            {
                path: 'Jops', loadComponent: () => import('./features/jops/jops').then(m => m.Jops
                )
            },
            {
                path: 'Blogs', loadComponent: () => import('./features/blogs/blogs').then(m => m.Blogs
                )
            },
            {
                path: 'Contact-Us', loadComponent: () => import('./features/contact-us/contact-us').then(m => m.ContactUs
                )
            },
            {
                path: 'Privacy-Policy', loadComponent: () => import('./features/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy
                )
            },
          
            {
                path: 'Project-Det', loadComponent: () => import('./features/project-det/project-det').then(m => m.ProjectDet
                )
            },
            {
                path: 'Blog-Det', loadComponent: () => import('./features/blog-det/blog-det').then(m => m.BlogDet
                )
            },
            {
                path: 'Jop-Det', loadComponent: () => import('./features/jop-det/jop-det').then(m => m.JopDet
                )
            },
            { path: '**', redirectTo: '', pathMatch: 'full' },
        ]
    }
];
