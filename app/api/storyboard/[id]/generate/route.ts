import { NextRequest, NextResponse } from "next/server";
import { storyboardService } from "@/lib/storyboard/storyboardService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await storyboardService.generateWebsiteFromApprovedStoryboard(id);

    return NextResponse.json({
      success: true,
      project: result.project,
      projectId: result.project.id,
      message: "Full website successfully generated from approved storyboard.",
    });
  } catch (error: any) {
    console.error("API /api/storyboard/[id]/generate error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate website" },
      { status: 400 }
    );
  }
}
