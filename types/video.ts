export type VideoStatus = "pending" | "generating" | "ready" | "failed";

export interface PromotionalVideo {
  id: string;
  projectId?: string;
  title: string;
  concept: string;
  style: "high-energy" | "editorial" | "cinematic" | "social-reel" | "minimal";
  aspectRatio: "16:9" | "9:16" | "1:1";
  durationSeconds: number;
  status: VideoStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  script?: string;
  promptUsed?: string;
  error?: string;
  createdAt: string;
}
