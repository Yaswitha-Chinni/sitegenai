import { NextRequest, NextResponse } from "next/server";
import { storyboardService } from "@/lib/storyboard/storyboardService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storyboard = storyboardService.getStoryboard(id);

    if (!storyboard) {
      return NextResponse.json(
        { success: false, error: `Storyboard "${id}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      storyboard,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch storyboard" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = storyboardService.updateStoryboard(id, body);

    return NextResponse.json({
      success: true,
      storyboard: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update storyboard" },
      { status: 500 }
    );
  }
}
