import { NextRequest, NextResponse } from "next/server";
import { generateWebsiteWithAI } from "@/lib/ai/gemini";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blueprint, assets } = body;

    if (!blueprint || !blueprint.name || !Array.isArray(blueprint.sections)) {
      return NextResponse.json(
        { success: false, error: "Invalid website blueprint structure provided." },
        { status: 400 }
      );
    }

    const result = await generateWebsiteWithAI({
      blueprint,
      assets,
    });

    // Optionally save to Supabase if server client is configured
    const supabase = getSupabaseServerClient();
    if (supabase && result.website) {
      try {
        await supabase.from("projects").upsert({
          id: result.website.id,
          name: result.website.name,
          description: result.website.description,
          template_id: result.website.templateId,
          template_source: result.website.templateSource,
          category: result.website.category,
          style: result.website.style,
          theme: result.website.theme,
          pages: result.website.pages,
          active_page: result.website.activePage,
          sections: result.website.sections,
          local_port: result.website.localPort || 3000,
          is_favorite: false,
          is_live_ai_generated: result.isLiveAI,
          ai_model_used: result.modelUsed,
          ai_summary: result.website.aiSummary,
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("Could not persist to Supabase:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      website: result.website,
      isLiveAI: result.isLiveAI,
      modelUsed: result.modelUsed,
      error: result.error,
    });
  } catch (error: any) {
    console.error("API /api/ai/generate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error generating website.",
      },
      { status: 500 }
    );
  }
}
