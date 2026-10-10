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

export interface ImageMetadata {
  id?: string;
  url: string;
  thumbnailUrl?: string;
  source: "pexels" | "unsplash" | "curated" | "upload";
  photographer?: string;
  photographerUrl?: string;
  alt: string;
  width?: number;
  height?: number;
  avgColor?: string;
  focalPoint?: { x: number; y: number }; // 0 to 100%
  cropZoom?: number;
  keywords?: string[];
}

export interface SectionStyle {
  backgroundColor: string;
  textColor: string;
  paddingY: "sm" | "md" | "lg" | "xl";
  alignment: "left" | "center" | "right";
  borderRadius: "none" | "sm" | "md" | "lg";
  focalPosition?: string; // e.g. "center center", "50% 25%"
  imageFit?: "cover" | "contain" | "scale-down";
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
  imageUrl?: string;
  imageMetadata?: ImageMetadata;
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
  imageMetadata?: ImageMetadata;
  videoUrl?: string;
  mediaType?: "image" | "video" | "none";
  activeTab?: string;
  items?: SectionItem[];
  footerLinks?: Array<{ title: string; links: string[] }>;
}

export interface ElementCustomStyle {
  fontSize?: number | string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  lineHeight?: number | string;
  letterSpacing?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  fontFamily?: string;
  width?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  borderRadius?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  boxShadow?: string;
  opacity?: number;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "scale-down";
  focalPosition?: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  iconPosition?: "left" | "right" | "top";
  iconSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: "none" | "underline";
}

export interface WebsiteSection {
  id: string;
  type: SectionType;
  name: string;
  visible: boolean;
  content: SectionContent;
  style: SectionStyle;
  animation: "none" | "fade" | "slide-up" | "zoom";
  elementStyles?: Record<string, ElementCustomStyle>;
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
  templateSource?: "w1" | "w2" | "built-in";
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

