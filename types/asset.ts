export type AssetType = "logo" | "product" | "brand" | "video";

export interface AssetAnalysis {
  dominantColors?: string[];
  suggestedRole?: string;
  detectedSubject?: string;
  recommendedSection?: string;
  tags?: string[];
  aspectRatio?: string;
}

export interface UploadedAsset {
  id: string;
  projectId?: string;
  name: string;
  originalName: string;
  type: AssetType;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  enhancedUrl?: string;
  enhancementStatus?: "none" | "processing" | "completed" | "failed";
  enhancementError?: string;
  analysis?: AssetAnalysis;
}
