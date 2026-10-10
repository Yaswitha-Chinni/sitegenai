import { NextRequest, NextResponse } from "next/server";
import { storyboardService } from "@/lib/storyboard/storyboardService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const version = body.version || 1;

    const result = storyboardService.approveStoryboard(id, version);

    return NextResponse.json({
      success: true,
      storyboard: result.storyboard,
      alreadyApproved: result.alreadyApproved || false,
      message: "Storyboard explicitly approved on server.",
    });
  } catch (error: any) {
    console.error("API /api/storyboard/[id]/approve error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to approve storyboard" },
      { status: 400 }
    );
  }
}
