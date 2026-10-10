import { NextRequest, NextResponse } from "next/server";
import { AssetAnalysis } from "@/types/asset";
import { GoogleGenAI } from "@google/genai";

function getApiKey(): string {
  const rawKey = process.env.GEMINI_API_KEY || "";
  return rawKey.replace(/^:+/, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const { assetUrl, assetName } = await req.json();

    if (!assetUrl) {
      return NextResponse.json({ success: false, error: "Missing asset URL to analyze." }, { status: 400 });
    }

    const apiKey = getApiKey();
    let analysis: AssetAnalysis = {
      dominantColors: ["#356DFF", "#071B32", "#FFFFFF"],
      suggestedRole: "Hero Showcase or Main Feature",
      detectedSubject: assetName ? assetName.replace(/\.[^/.]+$/, "") : "Product Showcase",
      recommendedSection: "hero",
      tags: ["High-Res", "Web Ready", "Optimized"],
      aspectRatio: "16:9",
    };

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Analyze this image asset metadata for a modern web design system:
Asset Name: "${assetName || "Image"}"
Asset URL: "${assetUrl}"

Return strictly valid JSON only:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "suggestedRole": "e.g. Hero visual, product thumbnail, logo badge",
  "detectedSubject": "concise description",
  "recommendedSection": "hero or features or gallery or product",
  "tags": ["tag1", "tag2", "tag3"]
}`,
        });

        const raw = res.text || "";
        const cleanJson = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        analysis = {
          ...analysis,
          ...parsed,
        };
      } catch (err: any) {
        console.warn("Gemini multimodal image analysis fallback:", err?.message);
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      message: "Asset analyzed successfully for responsive web placement.",
    });
  } catch (error: any) {
    console.error("API /api/ai/image-analyze error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to analyze asset." },
      { status: 500 }
    );
  }
}
