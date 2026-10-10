import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { UploadedAsset, AssetType } from "@/types/asset";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES: Record<string, AssetType> = {
  "image/png": "brand",
  "image/jpeg": "brand",
  "image/jpg": "brand",
  "image/webp": "brand",
  "image/svg+xml": "logo",
  "video/mp4": "video",
  "video/webm": "video",
};

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestedType = (formData.get("type") as AssetType) || "brand";
    const projectId = (formData.get("projectId") as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file was uploaded in the request." },
        { status: 400 }
      );
    }

    // MIME type check
    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES[mimeType] && !mimeType.startsWith("image/") && !mimeType.startsWith("video/")) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type "${mimeType}". Allowed formats: PNG, JPEG, WebP, SVG, MP4, WebM.`,
        },
        { status: 400 }
      );
    }

    // Size check
    const isVideo = mimeType.startsWith("video/");
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds limit of ${maxSize / (1024 * 1024)}MB.`,
        },
        { status: 400 }
      );
    }

    // Create unique safe filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = path.extname(originalName) || (isVideo ? ".mp4" : ".png");
    const uniqueId = "asset-" + Math.random().toString(36).substring(2, 9);
    const fileName = `${uniqueId}${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Write file to public/uploads
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    // Optionally upload to Supabase Storage if configured
    const supabase = getSupabaseServerClient();
    let finalUrl = publicUrl;

    if (supabase) {
      try {
        const { data: storageData, error: storageErr } = await supabase.storage
          .from("sitegenai-assets")
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!storageErr && storageData) {
          const { data: publicUrlData } = supabase.storage
            .from("sitegenai-assets")
            .getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            finalUrl = publicUrlData.publicUrl;
          }
        }
      } catch (storageException) {
        console.warn("Supabase Storage upload fallback to local:", storageException);
      }
    }

    const asset: UploadedAsset = {
      id: uniqueId,
      projectId,
      name: file.name,
      originalName: file.name,
      type: requestedType,
      url: finalUrl,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
      enhancementStatus: "none",
    };

    // Optionally save metadata to Supabase assets table
    if (supabase) {
      try {
        await supabase.from("assets").insert({
          id: asset.id,
          project_id: asset.projectId || null,
          name: asset.name,
          original_name: asset.originalName,
          type: asset.type,
          url: asset.url,
          size: asset.size,
          mime_type: asset.mimeType,
          enhancement_status: "none",
        });
      } catch (dbErr) {
        console.warn("Could not record asset metadata in Supabase:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      asset,
      message: `File "${file.name}" successfully uploaded and verified.`,
    });
  } catch (error: any) {
    console.error("API /api/upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process and store uploaded file.",
      },
      { status: 500 }
    );
  }
}
