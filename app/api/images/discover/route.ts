import { NextRequest, NextResponse } from "next/server";
import { discoverWebsiteImages } from "@/lib/images/imageDiscovery";
import { WebsiteSection } from "@/types/project";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt || "";
    const category = body.category || "General";
    const style = body.style || "Modern";
    const sections: WebsiteSection[] = body.sections || [];

    if (!prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt is required for image discovery" },
        { status: 400 }
      );
    }

    const discovery = await discoverWebsiteImages({
      prompt,
      category,
      style,
      sections,
    });

    const assignments = Object.entries(discovery.sectionImages).map(([sectionId, image]) => ({
      sectionId,
      image,
    }));

    return NextResponse.json({
      success: true,
      prompt,
      category,
      providerUsed: discovery.providerUsed,
      plan: discovery.plan,
      sectionImages: discovery.sectionImages,
      itemImages: discovery.itemImages,
      assignments,
    });
  } catch (error: any) {
    console.error("API /api/images/discover error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to discover images" },
      { status: 500 }
    );
  }
}
