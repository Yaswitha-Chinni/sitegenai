import { NextRequest, NextResponse } from "next/server";
import { searchPexels, searchUnsplash, searchCuratedStock } from "@/lib/images/imageDiscovery";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "minimalist modern design";
    const orientation = (searchParams.get("orientation") || undefined) as any;
    const perPage = parseInt(searchParams.get("perPage") || "12", 10);

    const hasPexelsKey = !!(process.env.PEXELS_API_KEY || "").trim();
    const hasUnsplashKey = !!(process.env.UNSPLASH_ACCESS_KEY || "").trim();

    let photos = await searchPexels({ query, orientation, perPage });
    let provider = hasPexelsKey ? "pexels" : hasUnsplashKey ? "unsplash" : "curated";

    if ((!photos || photos.length === 0) && hasUnsplashKey) {
      photos = await searchUnsplash({ query, orientation, perPage });
      provider = "unsplash";
    }

    if (!photos || photos.length === 0) {
      photos = searchCuratedStock(query, orientation, perPage);
      provider = "curated";
    }

    return NextResponse.json({
      success: true,
      query,
      orientation: orientation || "all",
      provider,
      total: photos.length,
      photos,
      images: photos,
      notice:
        provider === "pexels"
          ? "Stock photos retrieved via Pexels API under Pexels License. Free to use with attribution."
          : provider === "unsplash"
          ? "Stock photos retrieved via Unsplash API under Unsplash License. Free to use with attribution."
          : "Curated stock photographs with verified photographer attributions.",
    });
  } catch (error: any) {
    console.error("API /api/images/search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to search images",
        photos: [],
      },
      { status: 500 }
    );
  }
}
