export type TemplateCategory =
  | "All Templates"
  | "Business"
  | "Portfolio"
  | "SaaS"
  | "E-commerce"
  | "Restaurant"
  | "Agency"
  | "Blog"
  | "Landing Page";

export interface TemplateColors {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  categories: TemplateCategory[];
  style: string;
  pages: string[];
  sections: string[];
  colors: TemplateColors;
  source: "w1" | "w2" | "built-in";
  featured: boolean;
  thumbnail: string;
  previewPath: string;
  supportsResponsivePreview: boolean;
  supportsVisualEditing: boolean;
  previewBadge?: string;
  details?: {
    technology: string;
    animations: string;
    mediaCount: string;
  };
}
