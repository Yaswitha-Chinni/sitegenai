import { ImageMetadata, SectionType } from "./project";

export type StoryboardStatus =
  | "prompt_submitted"
  | "planning_storyboard"
  | "searching_images"
  | "storyboard_ready"
  | "awaiting_approval"
  | "approved"
  | "generating_website"
  | "website_ready"
  | "failed";

export type StoryboardLayoutType =
  | "split"
  | "centered"
  | "grid"
  | "cards"
  | "fullwidth";

export interface StoryboardImageRequirement {
  keywords: string[];
  orientation: "landscape" | "portrait" | "square";
  purpose: string;
}

export interface StoryboardSection {
  id: string;
  sectionNumber: number;
  name: string;
  type: SectionType;
  headline: string;
  subheadline?: string;
  contentSummary: string;
  layout: StoryboardLayoutType;
  imageRequirement?: StoryboardImageRequirement;
  selectedImage?: ImageMetadata;
  designNotes?: string;
  callToAction?: {
    label: string;
    target: string;
  };
  enabled: boolean;
}

export interface StoryboardPage {
  id: string;
  title: string;
  path: string;
  sections: StoryboardSection[];
}

export interface StoryboardPalette {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  accent: string;
}

export interface StoryboardTypography {
  headingFont: string;
  bodyFont: string;
  pairName: string;
}

export interface StoryboardDocument {
  id: string;
  projectId: string;
  version: number;
  status: StoryboardStatus;
  prompt: string;
  projectName: string;
  purpose: string;
  targetAudience: string;
  category: string;
  designDirection: string;
  palette: StoryboardPalette;
  typography: StoryboardTypography;
  pages: StoryboardPage[];
  imageManifest: Record<string, ImageMetadata>; // sectionId -> ImageMetadata
  responsiveNotes: string;
  accessibilityNotes: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  generatedProjectId?: string;
  generationJobId?: string;
  error?: string;
}
