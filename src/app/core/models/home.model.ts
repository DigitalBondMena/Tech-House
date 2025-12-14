/**
 * Home API Response Models
 * Following Angular best practices with proper TypeScript interfaces
 */

/**
 * Image object with responsive variants
 */
export interface ResponsiveImage {
  desktop: string;
  tablet: string;
  mobile: string;
}

/**
 * Hero Section Data
 */
export interface HeroSection {
  title: string;
  input_title: string;
  scroll_title: string;
  image: ResponsiveImage;
}

/**
 * About Home Section Data
 */
export interface AboutHome {
  title: string;
  text: string;
  image: ResponsiveImage;
}

/**
 * Service Item
 */
export interface Service {
  title: string;
  slug: string;
  is_active: boolean;
  image: ResponsiveImage;
}

/**
 * Project Item
 */
export interface Project {
  title: string;
  category_name: string;
  text: string;
  slug: string;
  is_active: boolean;
  image: ResponsiveImage;
}

/**
 * Testimonial Item
 */
export interface Testimonial {
  title: string;
  name: string;
  text: string;
  image: ResponsiveImage;
}

/**
 * Blog Item
 */
export interface Blog {
  title: string;
  slug: string;
  published_at: string;
  publish_at_ar: string;
  image: ResponsiveImage;
}

/**
 * Counter Item
 */
export interface Counter {
  count: number;
  title: string;
}

/**
 * Counters API Response
 */
export interface CountersResponse {
  counters: Counter[];
}

/**
 * Complete Home API Response
 */
export interface HomeResponse {
  heroSection: HeroSection;
  aboutHome: AboutHome;
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  blogs: Blog[];
}

