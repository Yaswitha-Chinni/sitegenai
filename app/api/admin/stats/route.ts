import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isSupabaseServerConfigured, getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // 1. Inspect uploads directory on disk
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    let uploadFilesCount = 0;
    let uploadTotalBytes = 0;

    try {
      const files = await fs.readdir(uploadsDir);
      for (const file of files) {
        if (file === ".gitkeep") continue;
        const stat = await fs.stat(path.join(uploadsDir, file));
        if (stat.isFile()) {
          uploadFilesCount++;
          uploadTotalBytes += stat.size;
        }
      }
    } catch {
      // directory might be empty or not yet created
    }

    // 2. Inspect Supabase connection if configured
    const supabaseConfigured = isSupabaseServerConfigured();
    let supabaseStatus = "unconfigured";
    let supabaseProjectsCount = 0;

    if (supabaseConfigured) {
      try {
        const client = getSupabaseServerClient();
        if (client) {
          const { count, error } = await client
            .from("projects")
            .select("*", { count: "exact", head: true });
          if (!error) {
            supabaseStatus = "connected";
            supabaseProjectsCount = count || 0;
          } else {
            supabaseStatus = `error: ${error.message}`;
          }
        }
      } catch (err: any) {
        supabaseStatus = `error: ${err.message}`;
      }
    }

    // 3. Inspect Gemini API Key status
    const geminiRaw = process.env.GEMINI_API_KEY || "";
    const geminiConfigured = geminiRaw.replace(/^:+/, "").trim().length > 10;
    const geminiMasked = geminiConfigured
      ? `${geminiRaw.substring(0, 4)}...${geminiRaw.slice(-4)}`
      : "Not Configured";

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      database: {
        mode: supabaseConfigured ? "supabase_cloud" : "local_storage_fallback",
        supabaseConfigured,
        supabaseStatus,
        supabaseProjectsCount,
        localStorageEngine: "Browser LocalStorage (sitegenai_projects_v1)",
      },
      storage: {
        diskUploadsDirectory: "public/uploads",
        uploadFilesCount,
        uploadTotalBytes,
        uploadTotalFormatted: `${(uploadTotalBytes / (1024 * 1024)).toFixed(2)} MB`,
      },
      ai: {
        geminiConfigured,
        geminiMasked,
        activeModel: "gemini-3.8-flash",
        optionalVideoProvider: Boolean(process.env.OPTIONAL_VIDEO_API_KEY),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to inspect system status." },
      { status: 500 }
    );
  }
}
