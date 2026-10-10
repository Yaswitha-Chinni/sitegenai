import { NextRequest, NextResponse } from "next/server";
import { planWebsiteWithAI } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, category, style, assets } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid website prompt or description." },
        { status: 400 }
      );
    }

    if (prompt.trim().length > 4000) {
      return NextResponse.json(
        { success: false, error: "Website description exceeds maximum limit (4000 characters)." },
        { status: 400 }
      );
    }

    const result = await planWebsiteWithAI({
      prompt: prompt.trim(),
      category,
      style,
      assets,
    });

    return NextResponse.json({
      success: true,
      blueprint: result.blueprint,
      isLiveAI: result.isLiveAI,
      modelUsed: result.modelUsed,
      error: result.error,
    });
  } catch (error: any) {
    console.error("API /api/ai/plan error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error planning website blueprint.",
      },
      { status: 500 }
    );
  }
}
