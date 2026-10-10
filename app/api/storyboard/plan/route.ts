import { NextRequest, NextResponse } from "next/server";
import { storyboardService } from "@/lib/storyboard/storyboardService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = (body.prompt || "").trim();
    const category = body.category || "General Business";
    const style = body.style || "Modern & Editorial";
    const palette = body.palette;

    if (!prompt || prompt.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid website prompt (at least 5 characters)." },
        { status: 400 }
      );
    }

    const storyboard = await storyboardService.createStoryboardFromPrompt({
      prompt,
      category,
      style,
      palette,
    });

    return NextResponse.json({
      success: true,
      storyboard,
    });
  } catch (error: any) {
    console.error("API /api/storyboard/plan error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate storyboard" },
      { status: 500 }
    );
  }
}
