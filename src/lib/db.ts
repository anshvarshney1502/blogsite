import fs from "fs";
import path from "path";

export interface SiteConfig {
  name: string;
  headline: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  seoTitle: string;
  seoDescription: string;
}

export interface HeroConfig {
  badge: string;
  title: string;
  description: string;
}

export interface NavigationConfig {
  name: string;
  path: string;
}

export interface PopularTopicConfig {
  name: string;
  count: number;
  description: string;
}

export interface ReadingCollectionConfig {
  title: string;
  description: string;
  count: number;
  slug: string;
}

export interface RecentNoteConfig {
  id: string;
  date: string;
  content: string;
}

export interface ExperienceConfig {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface EducationConfig {
  institution: string;
  degree: string;
  duration: string;
}

export interface QuoteConfig {
  text: string;
  author: string;
}

export interface FooterConfig {
  copyright: string;
  description: string;
}

export interface TestimonialConfig {
  quote: string;
  author: string;
}

export interface DbSchema {
  site: SiteConfig;
  hero: HeroConfig;
  navigation: NavigationConfig[];
  popular_topics: PopularTopicConfig[];
  reading_collections: ReadingCollectionConfig[];
  recent_notes: RecentNoteConfig[];
  experiences: ExperienceConfig[];
  education: EducationConfig[];
  skills: string[];
  focus_areas: string[];
  currently: string;
  quote_of_the_day: QuoteConfig;
  footer: FooterConfig;
  testimonials: TestimonialConfig[];
  homepage_sections?: Array<{
    id: string;
    type: string;
    label?: string;
    visible: boolean;
    order: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  }>;
}

const DB_PATH = path.join(process.cwd(), "content/db.json");

export function getDb(): DbSchema {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error("Database content/db.json not found.");
  }
  const fileContent = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(fileContent) as DbSchema;
}
