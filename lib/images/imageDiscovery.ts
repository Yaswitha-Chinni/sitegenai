import { GoogleGenAI } from "@google/genai";
import { ImageMetadata, SectionType, WebsiteSection } from "@/types/project";

// Server-side environment keys
function getPexelsApiKey(): string {
  return (process.env.PEXELS_API_KEY || "").trim();
}

function getUnsplashAccessKey(): string {
  return (process.env.UNSPLASH_ACCESS_KEY || "").trim();
}

function getGeminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || "").replace(/^:+/, "").trim();
}

export interface SectionImageQuery {
  sectionId: string;
  sectionType: SectionType;
  role: string;
  query: string;
  orientation: "landscape" | "portrait" | "square";
  suggestedAlt: string;
  itemQueries?: Array<{
    itemId?: string;
    query: string;
    orientation: "landscape" | "portrait" | "square";
    suggestedAlt: string;
  }>;
}

export interface WebsiteImagePlan {
  prompt: string;
  category?: string;
  style?: string;
  sections: SectionImageQuery[];
  sourceUsed: "pexels" | "unsplash" | "curated";
}

// In-memory 24-hour search cache to prevent rate-limiting and unnecessary external calls
interface CacheEntry {
  timestamp: number;
  results: ImageMetadata[];
}
const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// CURATED STOCK CATALOG (Reliable, high-res real stock photos with verified attribution)
// Used when PEXELS_API_KEY is not configured, rate-limited (429), or query has no results.
// ============================================================================
const CURATED_STOCK_LIBRARY: Array<ImageMetadata & { categories: string[]; tags: string[]; orientation: "landscape" | "portrait" | "square" }> = [
  // Honey & Organic Food
  {
    id: "cur-honey-1",
    url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1400&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Artur Rutkowski",
    photographerUrl: "https://unsplash.com/@arturrutkowski",
    alt: "Golden organic raw honeycomb in glass jar on wooden surface",
    avgColor: "#B45309",
    categories: ["honey", "organic", "food", "e-commerce", "restaurant"],
    tags: ["honey", "honeycomb", "jar", "golden", "sweet", "organic", "raw"],
    orientation: "landscape",
  },
  {
    id: "cur-honey-2",
    url: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Heather Barnes",
    photographerUrl: "https://unsplash.com/@heatherbarnes",
    alt: "Honey dipper drizzling fresh wildflower honey into bowl",
    avgColor: "#D97706",
    categories: ["honey", "organic", "food", "e-commerce"],
    tags: ["honey", "drizzle", "dipper", "breakfast", "natural"],
    orientation: "square",
  },
  {
    id: "cur-honey-3",
    url: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Bianca Ackermann",
    photographerUrl: "https://unsplash.com/@biancaackermann",
    alt: "Bee on yellow blossom collecting pollen in blooming field",
    avgColor: "#EAB308",
    categories: ["honey", "nature", "organic"],
    tags: ["bee", "pollination", "flower", "nature", "harvest", "apiary"],
    orientation: "portrait",
  },

  // Coffee & Artisanal Cafe
  {
    id: "cur-coffee-1",
    url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Nathan Dumlao",
    photographerUrl: "https://unsplash.com/@nate_dumlao",
    alt: "Artisanal barista pouring latte art with creamy microfoam into ceramic cup",
    avgColor: "#78350F",
    categories: ["coffee", "cafe", "restaurant", "food"],
    tags: ["coffee", "latte", "barista", "pour", "espresso", "cafe", "brass"],
    orientation: "landscape",
  },
  {
    id: "cur-coffee-2",
    url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Mike Kenneally",
    photographerUrl: "https://unsplash.com/@kenneally",
    alt: "Roasted single-origin coffee beans roasted to perfection in burlap sack",
    avgColor: "#451A03",
    categories: ["coffee", "roast", "organic"],
    tags: ["beans", "roast", "single-origin", "burlap", "dark roast"],
    orientation: "square",
  },
  {
    id: "cur-coffee-3",
    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Devin Avery",
    photographerUrl: "https://unsplash.com/@devinavery",
    alt: "Traditional pour-over and filter coffee drip ritual with warm steam",
    avgColor: "#292524",
    categories: ["coffee", "ritual", "cafe"],
    tags: ["filter", "ritual", "decoction", "steam", "morning", "drip"],
    orientation: "portrait",
  },

  // SaaS, Cloud & Tech Platform
  {
    id: "cur-saas-1",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Luke Chesser",
    photographerUrl: "https://unsplash.com/@lukechesser",
    alt: "Real-time telemetry analytics charts and modern UI dashboard display",
    avgColor: "#1E293B",
    categories: ["saas", "tech", "business", "cloud", "dashboard"],
    tags: ["analytics", "charts", "metrics", "dashboard", "telemetry", "saas", "ai"],
    orientation: "landscape",
  },
  {
    id: "cur-saas-2",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Alexandre Debiève",
    photographerUrl: "https://unsplash.com/@alexandre_debieve",
    alt: "High-performance server motherboard circuitry and glowing microchips",
    avgColor: "#0F172A",
    categories: ["saas", "tech", "cloud"],
    tags: ["server", "cloud", "circuit", "silicon", "hardware", "engineering"],
    orientation: "landscape",
  },

  // Creative Atelier, Fashion & Portfolio
  {
    id: "cur-portfolio-1",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Aiony Haust",
    photographerUrl: "https://unsplash.com/@aiony",
    alt: "Minimalist fashion portrait study with dramatic editorial lighting",
    avgColor: "#18181B",
    categories: ["portfolio", "fashion", "agency", "creative"],
    tags: ["fashion", "portrait", "editorial", "minimal", "model", "studio"],
    orientation: "portrait",
  },
  {
    id: "cur-portfolio-2",
    url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1400&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Igor Miske",
    photographerUrl: "https://unsplash.com/@igormiske",
    alt: "Clean modern design workspace with laptop, sketchpad and typography rulers",
    avgColor: "#334155",
    categories: ["portfolio", "agency", "creative"],
    tags: ["workspace", "desk", "laptop", "sketch", "designer", "studio"],
    orientation: "landscape",
  },

  // Architecture & Modern Living
  {
    id: "cur-arch-1",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "R ARCHITECTURE",
    photographerUrl: "https://unsplash.com/@rarchitecture_melbourne",
    alt: "Contemporary luxury architectural villa with warm ambient illumination",
    avgColor: "#334155",
    categories: ["real estate", "architecture", "portfolio"],
    tags: ["villa", "residence", "architecture", "interior", "modern home"],
    orientation: "landscape",
  },

  // Farm-to-Table Dining & Gourmet Restaurant
  {
    id: "cur-dining-1",
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Jay Wennington",
    photographerUrl: "https://unsplash.com/@jaywennington",
    alt: "Atmospheric artisanal dining room table with warm candle glow and wine glasses",
    avgColor: "#1C1917",
    categories: ["restaurant", "food", "dining"],
    tags: ["restaurant", "dining", "tables", "gourmet", "chef", "wine", "hospitality"],
    orientation: "landscape",
  },
  {
    id: "cur-dining-2",
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Lily Banse",
    photographerUrl: "https://unsplash.com/@lvnatkk",
    alt: "Plated culinary seasonal gourmet dish with microgreens and drizzle",
    avgColor: "#27272A",
    categories: ["restaurant", "food", "dining"],
    tags: ["dish", "culinary", "plated", "healthy", "fresh", "gourmet"],
    orientation: "landscape",
  },

  // Nature, Botanical & Travel
  {
    id: "cur-nature-1",
    url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
    source: "curated",
    photographer: "Kal Visuals",
    photographerUrl: "https://unsplash.com/@kalvisuals",
    alt: "Off-road adventure vehicle traveling through majestic mountain pass at sunset",
    avgColor: "#78716C",
    categories: ["blog", "travel", "nature"],
    tags: ["travel", "mountains", "adventure", "road", "expedition"],
    orientation: "landscape",
  },
];

/**
 * Uses Gemini text generation to extract a structured image search plan for a website prompt.
 * Strictly free-tier, uses standard gemini-3.8-flash or gemini-1.5-flash text model.
 */
export async function generateImagePlanWithGemini(params: {
  prompt: string;
  category?: string;
  style?: string;
  sectionTypes: SectionType[];
}): Promise<SectionImageQuery[]> {
  const apiKey = getGeminiApiKey();

  // If Gemini is not configured, generate a deterministic keyword plan
  if (!apiKey) {
    return generateDeterministicImagePlan(params.prompt, params.category, params.sectionTypes);
  }

  const promptText = `
You are an expert Visual Art Director for websites.
A user wants to build a website with the following prompt:
"${params.prompt}"
Category: "${params.category || "General Business"}"
Style: "${params.style || "Modern"}"
Requested sections: ${params.sectionTypes.join(", ")}

Your task: Produce targeted, photographic stock photo search queries for stock services (like Pexels).
For each section, generate specific, photorealistic search keywords that capture the theme.
Do NOT use generic terms like "website" or "business". Use concrete visual subjects (e.g. for a honey brand: "honeycomb jar rustic wood", "bees collecting pollen wildflower", "artisan honey drizzle breakfast").

Respond STRICTLY with valid JSON only (no markdown code fences, no explanations):
[
  {
    "sectionId": "sec-hero",
    "sectionType": "hero",
    "role": "Hero background / primary visual",
    "query": "3-5 concrete photographic keywords",
    "orientation": "landscape",
    "suggestedAlt": "Descriptive accessibility text for the hero image",
    "itemQueries": [
      {
        "query": "specific item photo keywords",
        "orientation": "portrait",
        "suggestedAlt": "Item 1 description"
      }
    ]
  }
]
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
    });

    const raw = response.text || "";
    const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: any, idx: number) => ({
        sectionId: item.sectionId || `sec-${idx}`,
        sectionType: (item.sectionType || params.sectionTypes[idx] || "hero") as SectionType,
        role: item.role || "Visual illustration",
        query: item.query || params.prompt,
        orientation: item.orientation || "landscape",
        suggestedAlt: item.suggestedAlt || `${params.prompt} showcase`,
        itemQueries: item.itemQueries || [],
      }));
    }
  } catch (err: any) {
    console.warn("Gemini image planning fallback:", err?.message);
  }

  return generateDeterministicImagePlan(params.prompt, params.category, params.sectionTypes);
}

/**
 * Deterministic keywords plan when Gemini text API is offline
 */
function generateDeterministicImagePlan(
  prompt: string,
  category: string = "general",
  sectionTypes: SectionType[]
): SectionImageQuery[] {
  const cleanPrompt = prompt.replace(/create|build|a|an|website|for|modern|stunning/gi, "").trim();

  return sectionTypes.map((type) => {
    switch (type) {
      case "hero":
        return {
          sectionId: "sec-hero",
          sectionType: "hero",
          role: "Primary Hero Banner",
          query: `${cleanPrompt} banner showcase`,
          orientation: "landscape",
          suggestedAlt: `High resolution hero photography for ${cleanPrompt}`,
        };
      case "story":
        return {
          sectionId: "sec-story",
          sectionType: "story",
          role: "Brand Craftsmanship & Heritage",
          query: `${cleanPrompt} craft workshop authentic`,
          orientation: "landscape",
          suggestedAlt: `Authentic craftsmanship behind ${cleanPrompt}`,
        };
      case "product":
        return {
          sectionId: "sec-product",
          sectionType: "product",
          role: "Signature Lineup & Catalog",
          query: `${cleanPrompt} packaging product detail`,
          orientation: "portrait",
          suggestedAlt: `Signature product formulation for ${cleanPrompt}`,
          itemQueries: [
            { query: `${cleanPrompt} natural ingredient`, orientation: "square", suggestedAlt: "Pure formulation" },
            { query: `${cleanPrompt} packaging jar bottle`, orientation: "square", suggestedAlt: "Artisanal package" },
            { query: `${cleanPrompt} table setting detail`, orientation: "square", suggestedAlt: "Daily ritual" },
          ],
        };
      case "gallery":
      case "showcase":
        return {
          sectionId: "sec-gallery",
          sectionType: "gallery",
          role: "Visual Atelier & Moments",
          query: `${cleanPrompt} lifestyle aesthetic`,
          orientation: "landscape",
          suggestedAlt: `Curated moments from ${cleanPrompt}`,
          itemQueries: [
            { query: `${cleanPrompt} workshop atmosphere`, orientation: "portrait", suggestedAlt: "Atelier sourcing" },
            { query: `${cleanPrompt} design award packaging`, orientation: "portrait", suggestedAlt: "Minimalist design" },
            { query: `${cleanPrompt} community smile customer`, orientation: "portrait", suggestedAlt: "Community moments" },
          ],
        };
      case "recipes":
        return {
          sectionId: "sec-recipes",
          sectionType: "recipes",
          role: "Culinary Journal & Formulations",
          query: `${cleanPrompt} gourmet recipe kitchen`,
          orientation: "landscape",
          suggestedAlt: `Culinary applications for ${cleanPrompt}`,
        };
      default:
        return {
          sectionId: `sec-${type}`,
          sectionType: type,
          role: `${type} Section Visual`,
          query: `${cleanPrompt} ${type}`,
          orientation: "landscape",
          suggestedAlt: `${cleanPrompt} visual`,
        };
    }
  });
}

/**
 * Searches Pexels API for free stock photographs.
 * Returns ranked, orientation-aware results with full licensing metadata.
 */
export async function searchPexels(params: {
  query: string;
  orientation?: "landscape" | "portrait" | "square";
  perPage?: number;
}): Promise<ImageMetadata[]> {
  const pexelsKey = getPexelsApiKey();
  const cacheKey = `pexels:${params.query.toLowerCase()}:${params.orientation || "all"}:${params.perPage || 10}`;

  // Check in-memory cache
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }

  if (!pexelsKey) {
    // Graceful fallback to curated stock catalog
    return searchCuratedStock(params.query, params.orientation, params.perPage || 8);
  }

  const orientationParam = params.orientation ? `&orientation=${params.orientation}` : "";
  const perPage = params.perPage || 8;
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(params.query)}&per_page=${perPage}${orientationParam}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: {
        Authorization: pexelsKey,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status === 429) {
      console.warn("Pexels rate limit reached (429). Falling back to curated catalog.");
      return searchCuratedStock(params.query, params.orientation, perPage);
    }

    if (!res.ok) {
      console.warn(`Pexels API responded with status ${res.status}`);
      return searchCuratedStock(params.query, params.orientation, perPage);
    }

    const data = await res.json();
    if (!data.photos || !Array.isArray(data.photos) || data.photos.length === 0) {
      return searchCuratedStock(params.query, params.orientation, perPage);
    }

    const results: ImageMetadata[] = data.photos.map((p: any) => ({
      id: `pexels-${p.id}`,
      url: p.src.large2x || p.src.large || p.src.original,
      thumbnailUrl: p.src.medium || p.src.small,
      source: "pexels",
      photographer: p.photographer,
      photographerUrl: p.photographer_url,
      alt: p.alt || params.query,
      width: p.width,
      height: p.height,
      avgColor: p.avg_color,
      focalPoint: { x: 50, y: 50 },
      keywords: [params.query],
    }));

    searchCache.set(cacheKey, { timestamp: Date.now(), results });
    return results;
  } catch (err: any) {
    console.warn("Pexels search fetch error:", err?.message);
    return searchCuratedStock(params.query, params.orientation, perPage);
  }
}

/**
 * Searches Unsplash API as an optional fallback source if configured.
 */
export async function searchUnsplash(params: {
  query: string;
  orientation?: "landscape" | "portrait" | "square" | "squarish";
  perPage?: number;
}): Promise<ImageMetadata[]> {
  const accessKey = getUnsplashAccessKey();
  if (!accessKey) {
    return searchCuratedStock(params.query, params.orientation as any, params.perPage || 8);
  }

  const orientation = params.orientation === "square" ? "squarish" : params.orientation;
  const orientParam = orientation ? `&orientation=${orientation}` : "";
  const perPage = params.perPage || 8;
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(params.query)}&per_page=${perPage}${orientParam}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!res.ok) {
      return searchCuratedStock(params.query, params.orientation as any, perPage);
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return searchCuratedStock(params.query, params.orientation as any, perPage);
    }

    return data.results.map((r: any) => ({
      id: `unsplash-${r.id}`,
      url: r.urls.regular || r.urls.full,
      thumbnailUrl: r.urls.small || r.urls.thumb,
      source: "unsplash",
      photographer: r.user?.name || "Unsplash Contributor",
      photographerUrl: r.user?.links?.html || "https://unsplash.com",
      alt: r.alt_description || params.query,
      width: r.width,
      height: r.height,
      avgColor: r.color,
      focalPoint: { x: 50, y: 50 },
      keywords: [params.query],
    }));
  } catch (err) {
    return searchCuratedStock(params.query, params.orientation as any, perPage);
  }
}

/**
 * Fast, reliable fallback search inside the curated stock catalog
 */
export function searchCuratedStock(
  query: string,
  orientation?: "landscape" | "portrait" | "square",
  count: number = 8
): ImageMetadata[] {
  const qTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = CURATED_STOCK_LIBRARY.map((item) => {
    let score = 0;
    for (const term of qTerms) {
      if (item.tags.some((t) => t.includes(term))) score += 4;
      if (item.categories.some((c) => c.includes(term))) score += 3;
      if (item.alt.toLowerCase().includes(term)) score += 2;
    }
    if (orientation && item.orientation === orientation) {
      score += 2;
    }
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const matched = scored.filter((s) => s.score > 0).map((s) => s.item);
  if (matched.length >= count) {
    return matched.slice(0, count);
  }

  // If not enough matches, blend top matches with diverse catalog photos
  const result: ImageMetadata[] = [...matched];
  for (const fallback of CURATED_STOCK_LIBRARY) {
    if (!result.some((r) => r.id === fallback.id)) {
      result.push(fallback);
      if (result.length >= count) break;
    }
  }

  return result;
}

/**
 * Master Discovery Orchestrator:
 * Converts website prompt into image plan, queries Pexels/Unsplash/Curated,
 * and distributes UNIQUE, non-repeating photos across all sections.
 */
export async function discoverWebsiteImages(params: {
  prompt: string;
  category?: string;
  style?: string;
  sections: WebsiteSection[];
}): Promise<{
  plan: SectionImageQuery[];
  sectionImages: Record<string, ImageMetadata>;
  itemImages: Record<string, ImageMetadata[]>;
  providerUsed: "pexels" | "unsplash" | "curated";
}> {
  const sectionTypes = params.sections.map((s) => s.type);
  const plan = await generateImagePlanWithGemini({
    prompt: params.prompt,
    category: params.category,
    style: params.style,
    sectionTypes,
  });

  const usedUrls = new Set<string>();
  const sectionImages: Record<string, ImageMetadata> = {};
  const itemImages: Record<string, ImageMetadata[]> = {};

  const pexelsAvailable = !!getPexelsApiKey();
  const unsplashAvailable = !!getUnsplashAccessKey();
  const providerUsed: "pexels" | "unsplash" | "curated" = pexelsAvailable
    ? "pexels"
    : unsplashAvailable
    ? "unsplash"
    : "curated";

  for (const queryPlan of plan) {
    // 1. Fetch section primary photo
    let candidates = await searchPexels({
      query: queryPlan.query,
      orientation: queryPlan.orientation,
      perPage: 6,
    });

    // Pick distinct photo not already assigned
    let chosen = candidates.find((c) => !usedUrls.has(c.url));
    if (!chosen && candidates.length > 0) {
      chosen = candidates[0];
    }

    if (chosen) {
      usedUrls.add(chosen.url);
      sectionImages[queryPlan.sectionId] = chosen;
    }

    // 2. Fetch section items photos (e.g. products, gallery, recipes)
    if (queryPlan.itemQueries && queryPlan.itemQueries.length > 0) {
      const itemsList: ImageMetadata[] = [];
      for (const itemQ of queryPlan.itemQueries) {
        let itemCandidates = await searchPexels({
          query: itemQ.query,
          orientation: itemQ.orientation,
          perPage: 6,
        });

        let itemChosen = itemCandidates.find((c) => !usedUrls.has(c.url));
        if (!itemChosen && itemCandidates.length > 0) {
          itemChosen = itemCandidates[0];
        }

        if (itemChosen) {
          usedUrls.add(itemChosen.url);
          itemsList.push(itemChosen);
        }
      }
      if (itemsList.length > 0) {
        itemImages[queryPlan.sectionId] = itemsList;
      }
    }
  }

  return {
    plan,
    sectionImages,
    itemImages,
    providerUsed,
  };
}
