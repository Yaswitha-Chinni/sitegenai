import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { WebsiteDocument } from "@/types/project";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        source: "local-fallback",
        message: "Supabase not configured. Application uses Local Storage Dev Mode on client.",
        projects: [],
      });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      source: "supabase",
      projects: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch projects." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const project: WebsiteDocument = await req.json();
    if (!project || !project.id || !project.name) {
      return NextResponse.json(
        { success: false, error: "Invalid project payload." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.from("projects").upsert({
        id: project.id,
        name: project.name,
        description: project.description,
        template_id: project.templateId,
        template_source: project.templateSource,
        category: project.category,
        style: project.style,
        theme: project.theme,
        pages: project.pages,
        active_page: project.activePage,
        sections: project.sections,
        local_port: project.localPort || 3000,
        is_favorite: project.isFavorite || false,
        is_live_ai_generated: project.isLiveAiGenerated || false,
        ai_model_used: project.aiModelUsed,
        ai_summary: project.aiSummary,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.warn("Supabase upsert error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      project,
      persistedInSupabase: Boolean(supabase),
      message: "Project successfully saved.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save project." },
      { status: 500 }
    );
  }
}
