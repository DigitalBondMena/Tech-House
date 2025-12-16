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
  paragraph?: string;
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
  blog_hover?: ResponsiveImage;
}

/**
 * CTA Section Data
 */
export interface CTASection {
  title: string;
  video: string;
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
  ctasection?: CTASection;
}

/**
 * Footer Link Item
 */
export interface FooterLink {
  title: string;
  url: string;
}

/**
 * Footer Section
 */
export interface FooterSection {
  title: string;
  links: FooterLink[];
}

/**
 * Contact Us Data (for Footer)
 */
export interface ContactUsData {
  logo?: ResponsiveImage;
  description?: string;
  footer_text?: string;
  working_hours?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  address?: string;
  image?: ResponsiveImage; // Image for contact section
  companySection?: FooterSection;
  solutionsSection?: FooterSection;
  copyright?: string;
  privacyPolicyUrl?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  social?: {
    map_url?: string;
    facebook_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    tiktok_url?: string;
    snapchat_url?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

/**
 * Contact Us API Response
 */
export interface ContactUsResponse {
  contactUs: ContactUsData;
}

/**
 * Service Title Item (for Footer)
 */
export interface ServiceTitle {
  title: string;
  slug: string;
  url?: string;
}

/**
 * Services Section API Response
 */
export interface ServicesSectionResponse {
  services?: ServiceTitle[];
  titles?: ServiceTitle[];
}

/**
 * Client/Partner Item
 */
export interface ClientPartner {
  title: string;
  url: string | null;
  is_active: boolean;
  order: number;
  image: ResponsiveImage;
}

/**
 * Partners/Clients API Response
 */
export interface PartnersClientsResponse {
  clients: ClientPartner[];
  partners: ClientPartner[];
}

/**
 * Privacy Policy Section Item
 */
export interface PrivacyPolicySection {
  title: string;
  content: string[];
}

/**
 * Banner Section Data
 */
export interface BannerSection {
  small_title?: string;
  title: string;
  text?: string;
  meta_title?: string;
  meta_description?: string;
  image: ResponsiveImage;
}

/**
 * Privacy Policy Content
 */
export interface PrivacyPolicyContent {
  title: string;
  text?: string;
}

/**
 * Privacy Policy Data
 */
export interface PrivacyPolicyData {
  title: string;
  paragraph?: string;
  image: ResponsiveImage;
  sections?: PrivacyPolicySection[];
  bannerSection?: BannerSection;
  privacyPolicy?: PrivacyPolicyContent;
}

/**
 * Privacy Policy API Response
 */
export interface PrivacyPolicyResponse {
  privacyPolicy?: PrivacyPolicyData | PrivacyPolicyContent;
  title?: string;
  paragraph?: string;
  image?: ResponsiveImage;
  sections?: PrivacyPolicySection[];
  bannerSection?: BannerSection;
}

/**
 * About Section Item
 */
export interface AboutSection {
  title: string;
  text: string;
  image: ResponsiveImage;
  order: number;
  is_active: boolean;
}

/**
 * About Information
 */
export interface AboutInformation {
  title: string;
  text: string;
}

/**
 * About API Response
 */
export interface AboutResponse {
  bannerSection: BannerSection;
  aboutInformation: AboutInformation;
  aboutSection: AboutSection[];
}

/**
 * Contact Hero Section Data
 */
export interface ContactHero {
  title: string;
  paragraph?: string;
  image: ResponsiveImage;
}

/**
 * Contact Hero API Response
 */
export interface ContactHeroResponse {
  bannerSection?: {
    title?: string;
    text?: string;
    image?: ResponsiveImage;
  };
  contactHero?: ContactHero;
  title?: string;
  paragraph?: string;
  image?: ResponsiveImage;
}

