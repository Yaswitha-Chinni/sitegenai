import { NextRequest, NextResponse } from "next/server";
import { storyboardService } from "@/lib/storyboard/storyboardService";
import { generateStoryboardPdf } from "@/lib/storyboard/pdfExport";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storyboard = storyboardService.getStoryboard(id);

    if (!storyboard) {
      return NextResponse.json(
        { success: false, error: "Storyboard not found" },
        { status: 404 }
      );
    }

    const pdfBytes = await generateStoryboardPdf(storyboard);
    const filename = `${storyboard.projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-storyboard.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBytes.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error("API /api/storyboard/[id]/pdf error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
