import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { projectService } from "@/lib/projects/projectService";
import { WebsiteDocument } from "@/types/project";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (!error && data) {
        return NextResponse.json({ success: true, project: data });
      }
    }

    // Check server projectService store
    const local = projectService.getProjectById(id);
    if (local) {
      return NextResponse.json({ success: true, project: local });
    }

    return NextResponse.json({ success: false, error: `Project ${id} not found.` }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const projectUpdates: Partial<WebsiteDocument> = await req.json();

    const existing = projectService.getProjectById(id);
    if (existing) {
      const updated = { ...existing, ...projectUpdates, id };
      projectService.saveProject(updated as WebsiteDocument);
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase
        .from("projects")
        .update({
          ...projectUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }

    return NextResponse.json({
      success: true,
      message: `Project ${id} updated successfully.`,
      persistedInSupabase: Boolean(supabase),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    projectService.deleteProject(id);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from("projects").delete().eq("id", id);
    }

    return NextResponse.json({
      success: true,
      message: `Project ${id} deleted successfully.`,
      persistedInSupabase: Boolean(supabase),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

