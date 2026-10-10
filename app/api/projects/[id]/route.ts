import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { WebsiteDocument } from "@/types/project";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: "Supabase not configured. Project should be retrieved from client local storage.",
      }, { status: 404 });
    }

    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
    if (error || !data) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project: Partial<WebsiteDocument> = await req.json();
    const supabase = getSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase
        .from("projects")
        .update({
          ...project,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
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
    const supabase = getSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
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
