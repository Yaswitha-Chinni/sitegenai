import { UploadedAsset } from "./asset";
import { PromotionalVideo } from "./video";

export type SectionType =
  | "header"
  | "hero"
  | "features"
  | "story"
  | "tabs"
  | "product"
  | "promo"
  | "recipes"
  | "testimonials"
  | "pricing"
  | "gallery"
  | "showcase"
  | "faq"
  | "cta"
  | "footer";

export interface SectionStyle {
  backgroundColor: string;
  textColor: string;
  paddingY: "sm" | "md" | "lg" | "xl";
  alignment: "left" | "center" | "right";
  borderRadius: "none" | "sm" | "md" | "lg";
}

export interface SectionItem {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  tag?: string;
  stat?: string;
  label?: string;
  price?: string;
  author?: string;
  role?: string;
}

export interface SectionContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: "image" | "video" | "none";
  activeTab?: string;
  items?: SectionItem[];
  footerLinks?: Array<{ title: string; links: string[] }>;
}

export interface WebsiteSection {
  id: string;
  type: SectionType;
  name: string;
  visible: boolean;
  content: SectionContent;
  style: SectionStyle;
  animation: "none" | "fade" | "slide-up" | "zoom";
}

export interface ProjectTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
}

export interface WebsiteDocument {
  id: string;
  name: string;
  description: string;
  templateId?: string;
  templateSource?: "w1" | "built-in";
  category: string;
  style: string;
  theme: ProjectTheme;
  pages: string[];
  activePage: string;
  sections: WebsiteSection[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  localPort?: number;
  assets?: UploadedAsset[];
  promotionalVideos?: PromotionalVideo[];
  isLiveAiGenerated?: boolean;
  aiModelUsed?: string;
  aiSummary?: string;
}

export interface BlueprintSection {
  id: string;
  name: string;
  type: SectionType;
  enabled: boolean;
  description: string;
}

export interface WebsiteBlueprint {
  name: string;
  purpose: string;
  type: string;
  style: string;
  pages: string[];
  sections: BlueprintSection[];
  palette: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  typography: string;
  isLiveAI?: boolean;
  modelUsed?: string;
  fallbackReason?: string;
}

