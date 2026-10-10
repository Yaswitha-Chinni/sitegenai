import { GoogleGenAI } from "@google/genai";
import { WebsiteBlueprint, WebsiteDocument, WebsiteSection, SectionType } from "@/types/project";
import { UploadedAsset } from "@/types/asset";
import { TEMPLATES_REGISTRY } from "@/lib/templates/registry";
import { discoverWebsiteImages, searchCuratedStock } from "@/lib/images/imageDiscovery";

function getApiKey(): string {
  const rawKey = process.env.GEMINI_API_KEY || "";
  return rawKey.replace(/^:+/, "").trim();
}

export function isGeminiConfigured(): boolean {
  const key = getApiKey();
  return key.length > 10;
}

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-1.5-flash", "gemini-2.5-flash"];

/**
 * Executes a call with a strict timeout to ensure requests never hang indefinitely.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 18000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`AI generation timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Plan a website structure based on prompt, style, and constraints
 */
export async function planWebsiteWithAI(params: {
  prompt: string;
  category?: string;
  style?: string;
  assets?: UploadedAsset[];
}): Promise<{ blueprint: WebsiteBlueprint; isLiveAI: boolean; modelUsed?: string; error?: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      blueprint: generateCuratedBlueprint(params.prompt, params.category, params.style),
      isLiveAI: false,
      error: "GEMINI_API_KEY is not configured on the server. Used curated blueprint engine.",
    };
  }

  const promptText = `
You are the Lead Website Architect for SiteGenAI ("Imagine it. Design it. Make it yours.").
Analyze the following user website request and create a detailed website blueprint.

User Request: "${params.prompt}"
Category Preference: "${params.category || "General Business"}"
Style Preference: "${params.style || "Modern"}"
Provided Assets: ${params.assets?.length ? params.assets.map(a => `${a.type}: ${a.name}`).join(", ") : "None"}

CRITICAL ARCHITECTURAL REQUIREMENT:
Every successfully generated website must contain AT LEAST EIGHT (8) meaningful sections in total, including its header and footer.
You must generate at least 8 to 10 comprehensive sections tailored to the request (e.g. Header, Hero, Story/About, Products/Offerings, Features/Benefits, Showcase/Gallery, Testimonials, FAQ, CTA Banner, Footer).

Respond strictly with valid JSON only, without markdown fences or additional explanation.
Follow this JSON structure:
{
  "name": "Brand / Website Name",
  "purpose": "A concise mission or purpose statement",
  "type": "e.g. Restaurant, SaaS, Portfolio, E-commerce, etc.",
  "style": "e.g. Editorial & Modern Coastal, Minimalist, etc.",
  "pages": ["Home", "About", "Services / Menu", "Contact"],
  "sections": [
    { "id": "sec-header", "name": "Header & Sticky Navigation", "type": "header", "enabled": true, "description": "Navigation bar with brand logo and quick contact button" },
    { "id": "sec-hero", "name": "Cinematic Value Proposition Hero", "type": "hero", "enabled": true, "description": "Bold headline, descriptive hook, and call to action" },
    { "id": "sec-story", "name": "Brand Story & Craftsmanship", "type": "story", "enabled": true, "description": "Authentic brand narrative, vision, and origin" },
    { "id": "sec-product", "name": "Signature Offerings & Lineup", "type": "product", "enabled": true, "description": "Core products, catalog, or services with detailed specs" },
    { "id": "sec-features", "name": "Key Pillars & Differentiators", "type": "features", "enabled": true, "description": "3-4 core pillars with icons and short summaries" },
    { "id": "sec-gallery", "name": "Visual Media Showcase & Gallery", "type": "gallery", "enabled": true, "description": "High-impact visual highlights and project photography" },
    { "id": "sec-testimonials", "name": "Client Reviews & Proof", "type": "testimonials", "enabled": true, "description": "Verified customer feedback and rating badges" },
    { "id": "sec-faq", "name": "Frequently Asked Questions", "type": "faq", "enabled": true, "description": "Common customer questions and concise answers" },
    { "id": "sec-cta", "name": "Conversion Call to Action", "type": "cta", "enabled": true, "description": "High contrast banner guiding users to purchase or inquiry" },
    { "id": "sec-footer", "name": "Footer & Legal", "type": "footer", "enabled": true, "description": "Copyright, newsletter signup, and sitemap links" }
  ],
  "palette": {
    "primary": "#356DFF",
    "secondary": "#172033",
    "background": "#FFFFFF",
    "accent": "#EFF5FF"
  },
  "typography": "Outfit, Plus Jakarta Sans, sans-serif"
}
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await withTimeout(
      ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: promptText,
      }),
      15000
    );

    const rawOutput = response.text || "";
    const cleanJson = rawOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    const validatedSections = enforceMinimumEightBlueprintSections(
      parsed.sections || [],
      parsed.name || "AI Site",
      parsed.type || params.category || "Business"
    );

    return {
      blueprint: {
        name: parsed.name || "AI Generated Site",
        purpose: parsed.purpose || params.prompt,
        type: parsed.type || params.category || "Business",
        style: parsed.style || params.style || "Modern",
        pages: parsed.pages || ["Home"],
        sections: validatedSections,
        palette: parsed.palette || {
          primary: "#356DFF",
          secondary: "#172033",
          background: "#FFFFFF",
          accent: "#EFF5FF",
        },
        typography: parsed.typography || "Outfit, sans-serif",
        isLiveAI: true,
        modelUsed: PRIMARY_MODEL,
      },
      isLiveAI: true,
      modelUsed: PRIMARY_MODEL,
    };
  } catch (err: any) {
    console.warn("Gemini planning error (falling back to curated synthesis):", err?.message);
    const fallback = generateCuratedBlueprint(params.prompt, params.category, params.style);
    return {
      blueprint: {
        ...fallback,
        isLiveAI: false,
        fallbackReason: err?.message || "Gemini API unavailable",
      },
      isLiveAI: false,
      error: err?.message || "Gemini API error",
    };
  }
}

/**
 * Generate full website copy and sections based on blueprint or prompt
 */
export async function generateWebsiteWithAI(params: {
  blueprint: WebsiteBlueprint;
  assets?: UploadedAsset[];
}): Promise<{ website: WebsiteDocument; isLiveAI: boolean; modelUsed?: string; error?: string }> {
  const apiKey = getApiKey();
  const bp = params.blueprint;
  const projectDate = new Date().toISOString();

  // If assets are provided, find logo, product images, or videos
  const logoAsset = params.assets?.find((a) => a.type === "logo");
  const productAssets = params.assets?.filter((a) => a.type === "product") || [];
  const videoAsset = params.assets?.find((a) => a.type === "video");

  if (!apiKey) {
    const fallbackDoc = generateCuratedWebsite(bp, params.assets);
    return {
      website: fallbackDoc,
      isLiveAI: false,
      error: "GEMINI_API_KEY is not configured. Generated via curated synthesis engine.",
    };
  }

  const promptText = `
You are SiteGenAI, the state-of-the-art AI website generator.
Generate rich, high-converting, realistic copywriting and configuration for this website blueprint.

Blueprint Details:
- Name: ${bp.name}
- Purpose: ${bp.purpose}
- Category: ${bp.type}
- Style: ${bp.style}
- Requested Sections: ${bp.sections.map((s) => s.name + ` (${s.type})`).join(", ")}

Respond with strictly valid JSON only:
{
  "description": "Engaging 1-2 sentence brand description",
  "sections": [
    ${bp.sections
      .map(
        (s) => `{
      "id": "${s.id}",
      "type": "${s.type}",
      "name": "${s.name}",
      "visible": true,
      "content": {
        "badge": "Short badge or category",
        "title": "Compelling headline",
        "subtitle": "Informative subtitle",
        "description": "Engaging paragraph copy",
        "buttonText": "Action text",
        "buttonLink": "#",
        "secondaryButtonText": "Learn more",
        "secondaryButtonLink": "#",
        "imageUrl": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
        "items": [
          { "title": "Item 1", "description": "Specific detail", "stat": "99%" },
          { "title": "Item 2", "description": "Specific detail", "stat": "2.4x" },
          { "title": "Item 3", "description": "Specific detail", "stat": "24/7" }
        ]
      },
      "style": {
        "backgroundColor": "${bp.palette.background}",
        "textColor": "${bp.palette.secondary}",
        "paddingY": "lg",
        "alignment": "center",
        "borderRadius": "md"
      },
      "animation": "slide-up"
    }`
      )
      .join(",\n    ")}
  ]
}
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await withTimeout(
      ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: promptText,
      }),
      18000
    );

    const raw = response.text || "";
    const cleanJson = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Merge uploaded assets into sections if present
    const sections: WebsiteSection[] = (parsed.sections || []).map((sec: WebsiteSection) => {
      if (sec.type === "header" && logoAsset) {
        sec.content.imageUrl = logoAsset.url;
      }
      if (sec.type === "hero") {
        if (videoAsset) {
          sec.content.videoUrl = videoAsset.url;
          sec.content.mediaType = "video";
        } else if (productAssets.length > 0) {
          sec.content.imageUrl = productAssets[0].url;
          sec.content.mediaType = "image";
        }
      }
      return sec;
    });

    const baseSections = sections.length > 0 ? sections : generateCuratedSections(bp, params.assets);
    const enforcedSections = enforceMinimumEightWebsiteSections(baseSections, bp);

    // Automatic prompt-based image discovery (Pexels / Unsplash / Curated)
    try {
      const discovery = await discoverWebsiteImages({
        prompt: `${bp.name} ${bp.purpose}`,
        category: bp.type,
        style: bp.style,
        sections: enforcedSections,
      });

      for (const sec of enforcedSections) {
        if (!sec.content.imageUrl || sec.content.imageUrl.includes("photo-1498050108023-c5249f4df085")) {
          const img = discovery.sectionImages[sec.id] || discovery.sectionImages[sec.type];
          if (img) {
            sec.content.imageUrl = img.url;
            sec.content.imageMetadata = img;
          }
        }
        const itemImgs = discovery.itemImages[sec.id] || discovery.itemImages[sec.type];
        if (itemImgs && sec.content.items) {
          sec.content.items.forEach((item, idx) => {
            if (itemImgs[idx] && !item.imageUrl) {
              item.imageUrl = itemImgs[idx].url;
              item.imageMetadata = itemImgs[idx];
            }
          });
        }
      }
    } catch (imgErr) {
      console.warn("Image discovery non-blocking warning:", imgErr);
    }

    const doc: WebsiteDocument = {
      id: "proj-" + Math.random().toString(36).substring(2, 9),
      name: bp.name,
      description: parsed.description || bp.purpose,
      templateId: "ai-custom",
      templateSource: "built-in",
      category: bp.type,
      style: bp.style,
      theme: {
        primaryColor: bp.palette.primary,
        secondaryColor: bp.palette.secondary,
        backgroundColor: bp.palette.background,
        fontFamily: bp.typography,
      },
      pages: bp.pages && bp.pages.length ? bp.pages : ["Home"],
      activePage: "Home",
      sections: enforcedSections,
      createdAt: projectDate,
      updatedAt: projectDate,
      localPort: 3000,
      assets: params.assets || [],
      isLiveAiGenerated: true,
      aiModelUsed: PRIMARY_MODEL,
      aiSummary: `Generated by ${PRIMARY_MODEL} with validated structural schema. Stock images discovered via Pexels / Curated library.`,
    };

    return {
      website: doc,
      isLiveAI: true,
      modelUsed: PRIMARY_MODEL,
    };
  } catch (err: any) {
    console.warn("Gemini generation error (falling back to curated synthesis):", err?.message);
    const fallbackDoc = generateCuratedWebsite(bp, params.assets);
    fallbackDoc.isLiveAiGenerated = false;
    fallbackDoc.aiModelUsed = "Curated Synthesis (Gemini API offline)";
    return {
      website: fallbackDoc,
      isLiveAI: false,
      error: err?.message || "Gemini generation failed",
    };
  }
}

/**
 * Enforces that any blueprint has AT LEAST 8 sections, adding tailored sections before footer if necessary.
 */
export function enforceMinimumEightBlueprintSections(
  rawSections: any[],
  siteName = "Brand",
  category = "Business"
): any[] {
  let list = Array.isArray(rawSections) ? [...rawSections] : [];

  // Ensure header at start
  if (!list.some((s) => s.type === "header")) {
    list.unshift({
      id: "sec-header",
      name: "Header & Navigation",
      type: "header",
      enabled: true,
      description: "Sticky navigation bar with brand logo and quick contact action",
    });
  }

  // Ensure hero right after header
  if (!list.some((s) => s.type === "hero")) {
    const headerIdx = list.findIndex((s) => s.type === "header");
    list.splice(headerIdx + 1, 0, {
      id: "sec-hero",
      name: "Cinematic Value Proposition Hero",
      type: "hero",
      enabled: true,
      description: "High-impact visual headline and primary conversion trigger",
    });
  }

  // Ensure footer at end
  if (!list.some((s) => s.type === "footer")) {
    list.push({
      id: "sec-footer",
      name: "Footer & Legal Directory",
      type: "footer",
      enabled: true,
      description: "Sitemap navigation links, legal copyright, and newsletter signup",
    });
  }

  // Pool of candidate enrichment sections
  const candidateSections = [
    { id: "sec-story", name: "Brand Story & Heritage", type: "story", enabled: true, description: "Authentic craftsmanship narrative, origin, and mission" },
    { id: "sec-product", name: "Signature Offerings & Catalog", type: "product", enabled: true, description: "Core product or service lineup with key benefits" },
    { id: "sec-features", name: "Key Pillars & Differentiators", type: "features", enabled: true, description: "Core pillars with icons and short summaries" },
    { id: "sec-gallery", name: "Curated Visual Gallery", type: "gallery", enabled: true, description: "High resolution photography and project showcase" },
    { id: "sec-testimonials", name: "Client Reviews & Proof", type: "testimonials", enabled: true, description: "Real community quotes and star rating badges" },
    { id: "sec-faq", name: "Frequently Asked Questions", type: "faq", enabled: true, description: "Common customer questions and concise answers" },
    { id: "sec-cta", name: "Conversion Call to Action", type: "cta", enabled: true, description: "High contrast banner guiding users to purchase or contact" },
  ];

  for (const candidate of candidateSections) {
    if (list.length >= 8) break;
    if (!list.some((s) => s.type === candidate.type)) {
      const footerIdx = list.findIndex((s) => s.type === "footer");
      if (footerIdx >= 0) {
        list.splice(footerIdx, 0, candidate);
      } else {
        list.push(candidate);
      }
    }
  }

  let counter = 1;
  while (list.length < 8) {
    const footerIdx = list.findIndex((s) => s.type === "footer");
    const extraSec = {
      id: `sec-extra-${counter}`,
      name: `Special Highlight ${counter}`,
      type: "features",
      enabled: true,
      description: `Bespoke feature breakdown for ${siteName}`,
    };
    if (footerIdx >= 0) {
      list.splice(footerIdx, 0, extraSec);
    } else {
      list.push(extraSec);
    }
    counter++;
  }

  return list;
}

/**
 * Enforces that a generated WebsiteDocument has AT LEAST 8 sections.
 */
export function enforceMinimumEightWebsiteSections(
  rawSections: WebsiteSection[],
  bp: WebsiteBlueprint
): WebsiteSection[] {
  let list = Array.isArray(rawSections) ? [...rawSections] : [];

  if (list.length >= 8) {
    return list;
  }

  const curated = generateCuratedSections(bp);
  for (const sec of curated) {
    if (list.length >= 8) break;
    if (!list.some((s) => s.type === sec.type)) {
      const footerIdx = list.findIndex((s) => s.type === "footer");
      if (footerIdx >= 0) {
        list.splice(footerIdx, 0, sec);
      } else {
        list.push(sec);
      }
    }
  }

  return list;
}

/**
 * Fallback curated blueprint generator (guaranteed 10 sections)
 */
function generateCuratedBlueprint(prompt: string, category = "Business", style = "Modern"): WebsiteBlueprint {
  const isCocopour = /coco|coconut|milk|beverage|drink|pour/i.test(prompt);
  const name = isCocopour
    ? "COCO POUR — Naturally Good"
    : prompt.length > 30
    ? prompt.split(" ").slice(0, 4).join(" ")
    : prompt || "Modern Studio";

  return {
    name,
    purpose: prompt || "Transforming ideas into high-impact digital experiences.",
    type: category,
    style: isCocopour ? "Editorial & Modern Coastal" : style,
    pages: ["Home", "About", "Showcase", "Contact"],
    sections: [
      { id: "sec-header", name: "Header & Navigation", type: "header", enabled: true, description: "Sticky responsive header with brand logo and quick contact action" },
      { id: "sec-hero", name: "Hero Showcase", type: "hero", enabled: true, description: "High-impact visual hero section with primary conversion trigger" },
      { id: "sec-story", name: "Brand Story & Heritage", type: "story", enabled: true, description: "Authentic narrative, single-origin sourcing, and proof metrics" },
      { id: "sec-product", name: "Signature Offerings & Catalog", type: "product", enabled: true, description: "Detailed showcase of core products and specifications" },
      { id: "sec-features", name: "Core Pillars & Benefits", type: "features", enabled: true, description: "Interactive 3-column value grid with icons and performance metrics" },
      { id: "sec-gallery", name: "Visual Media Gallery", type: "gallery", enabled: true, description: "High-resolution curated imagery and project snapshots" },
      { id: "sec-testimonials", name: "Customer Testimonials", type: "testimonials", enabled: true, description: "Real community quotes, star badges, and verified buyer reviews" },
      { id: "sec-faq", name: "Frequently Asked Questions", type: "faq", enabled: true, description: "Comprehensive answers to essential customer questions" },
      { id: "sec-cta", name: "Call To Action Banner", type: "cta", enabled: true, description: "Conversion driver guiding users to start immediately" },
      { id: "sec-footer", name: "Footer & Newsletter", type: "footer", enabled: true, description: "Sitemap navigation, copyright, and subscription form" },
    ],
    palette: isCocopour
      ? { primary: "#087FE5", secondary: "#071B32", background: "#FFFFFF", accent: "#F8F5ED" }
      : { primary: "#356DFF", secondary: "#172033", background: "#FFFFFF", accent: "#EFF5FF" },
    typography: "Outfit, Plus Jakarta Sans, sans-serif",
    isLiveAI: false,
  };
}

/**
 * Curated full website fallback generator (guaranteed 10 sections)
 */
function generateCuratedWebsite(bp: WebsiteBlueprint, assets?: UploadedAsset[]): WebsiteDocument {
  const now = new Date().toISOString();
  return {
    id: "proj-" + Math.random().toString(36).substring(2, 9),
    name: bp.name,
    description: bp.purpose,
    templateId: "curated-synthesis",
    templateSource: "built-in",
    category: bp.type,
    style: bp.style,
    theme: {
      primaryColor: bp.palette.primary,
      secondaryColor: bp.palette.secondary,
      backgroundColor: bp.palette.background,
      fontFamily: bp.typography,
    },
    pages: bp.pages,
    activePage: "Home",
    sections: generateCuratedSections(bp, assets),
    createdAt: now,
    updatedAt: now,
    localPort: 3000,
    assets: assets || [],
    isLiveAiGenerated: false,
    aiModelUsed: "SiteGenAI Synthesis Engine",
    aiSummary: "Generated using curated design tokens and responsive components.",
  };
}

function generateCuratedSections(bp: WebsiteBlueprint, assets?: UploadedAsset[]): WebsiteSection[] {
  const logo = assets?.find((a) => a.type === "logo");
  const heroImage = assets?.find((a) => a.type === "product" || a.type === "brand");
  const heroVideo = assets?.find((a) => a.type === "video");

  // Contextual stock discovery for fallback path
  const heroStock = heroImage ? undefined : searchCuratedStock(`${bp.name} ${bp.purpose} ${bp.type}`, "landscape", 1)[0];
  const storyStock = searchCuratedStock(`${bp.name} craft authentic`, "landscape", 1)[0];
  const galleryStocks = searchCuratedStock(`${bp.name} atelier moments`, "portrait", 3);
  const productStock = searchCuratedStock(`${bp.name} product packaging`, "square", 1)[0];

  return [
    {
      id: "sec-header",
      type: "header",
      name: "Header & Navigation",
      visible: true,
      content: {
        title: bp.name,
        imageUrl: logo?.url,
        buttonText: "Get in Touch",
        buttonLink: "#contact",
      },
      style: {
        backgroundColor: bp.palette.background,
        textColor: bp.palette.secondary,
        paddingY: "sm",
        alignment: "center",
        borderRadius: "none",
      },
      animation: "fade",
    },
    {
      id: "sec-hero",
      type: "hero",
      name: "Hero Showcase",
      visible: true,
      content: {
        badge: "Next Generation Design",
        title: bp.name,
        subtitle: bp.purpose,
        description: "Crafted with precision, animated micro-interactions, and conversion-focused architecture.",
        buttonText: "Explore Experience",
        buttonLink: "#features",
        secondaryButtonText: "View Documentation",
        secondaryButtonLink: "#",
        imageUrl: heroImage?.url || heroStock?.url || "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80",
        imageMetadata: heroStock,
        videoUrl: heroVideo?.url,
        mediaType: heroVideo ? "video" : "image",
      },
      style: {
        backgroundColor: bp.palette.accent,
        textColor: bp.palette.secondary,
        paddingY: "xl",
        alignment: "center",
        borderRadius: "lg",
      },
      animation: "slide-up",
    },
    {
      id: "sec-story",
      type: "story",
      name: "Brand Story & Craftsmanship",
      visible: true,
      content: {
        badge: "Our Heritage & Purpose",
        title: "Built with intention from day one.",
        description: "Every product and digital interaction is forged through deliberate design, rigorous quality benchmarks, and a steadfast dedication to excellence.",
        imageUrl: storyStock?.url,
        imageMetadata: storyStock,
        buttonText: "Read Our Manifesto",
        buttonLink: "#",
        items: [
          { stat: "100%", label: "Sustainable Ingredients", title: "Purity", description: "Zero artificial additives" },
          { stat: "24h", label: "Direct-to-Consumer Freshness", title: "Rapid Delivery", description: "Fresh batch fulfillment" },
          { stat: "4.9/5", label: "Customer Satisfaction", title: "Loved by Thousands", description: "Verified reviews" },
        ],
      },
      style: {
        backgroundColor: bp.palette.background,
        textColor: bp.palette.secondary,
        paddingY: "lg",
        alignment: "left",
        borderRadius: "none",
      },
      animation: "slide-up",
    },
    {
      id: "sec-product",
      type: "product",
      name: "Signature Offerings & Catalog",
      visible: true,
      content: {
        badge: "Product Showcase",
        title: "Engineered for daily rituals.",
        description: "Explore our flagship formulations and premium offerings crafted to elevate your standard.",
        imageUrl: productStock?.url,
        imageMetadata: productStock,
        buttonText: "View Complete Lineup",
        buttonLink: "#",
        items: [
          { title: "Pure Formulation", description: "Cold-pressed extraction with natural balance and rich nutrient retention." },
          { title: "Versatile Daily Utility", description: "Seamlessly blends into modern lifestyle habits, work routines, and culinary creations." },
          { title: "Uncompromising Quality", description: "Tested in small batches with strict traceability and transparent sourcing." },
        ],
      },
      style: {
        backgroundColor: bp.palette.accent,
        textColor: bp.palette.secondary,
        paddingY: "xl",
        alignment: "center",
        borderRadius: "none",
      },
      animation: "fade",
    },
    {
      id: "sec-features",
      type: "features",
      name: "Core Pillars & Benefits",
      visible: true,
      content: {
        badge: "Why Choose Us",
        title: "Designed for Uncompromising Excellence",
        description: "Every element is tuned for optimal user engagement, clarity, and delight.",
        items: [
          { title: "Fluid Performance", description: "Sub-second loading times with lightweight vector assets and responsive layouts.", stat: "60 FPS" },
          { title: "Intelligent Synthesis", description: "Structured semantic HTML with integrated SEO and accessible microdata.", stat: "100%" },
          { title: "Full Ownership", description: "Export complete standalone source code without recurring vendor lock-in.", stat: "Zero Lock-in" },
        ],
      },
      style: {
        backgroundColor: bp.palette.background,
        textColor: bp.palette.secondary,
        paddingY: "lg",
        alignment: "center",
        borderRadius: "md",
      },
      animation: "fade",
    },
    {
      id: "sec-gallery",
      type: "gallery",
      name: "Curated Visual Gallery",
      visible: true,
      content: {
        badge: "Visual Craft",
        title: "Moments in focus.",
        description: "A glimpse into our production atelier, community events, and creative collaborations.",
        items: [
          {
            title: "Atelier Sourcing",
            description: "Hand-selected ingredients",
            tag: "Process",
            label: "Single Origin",
            imageUrl: galleryStocks[0]?.url,
            imageMetadata: galleryStocks[0],
          },
          {
            title: "Minimalist Aesthetic",
            description: "Packaging design study",
            tag: "Design",
            label: "Award Winner",
            imageUrl: galleryStocks[1]?.url,
            imageMetadata: galleryStocks[1],
          },
          {
            title: "Community Moments",
            description: "Everyday user rituals",
            tag: "Lifestyle",
            label: "Global",
            imageUrl: galleryStocks[2]?.url,
            imageMetadata: galleryStocks[2],
          },
        ],
      },
      style: {
        backgroundColor: bp.palette.background,
        textColor: bp.palette.secondary,
        paddingY: "lg",
        alignment: "center",
        borderRadius: "none",
      },
      animation: "slide-up",
    },
    {
      id: "sec-testimonials",
      type: "testimonials",
      name: "Client Proof & Reviews",
      visible: true,
      content: {
        badge: "Verified Feedback",
        title: "Loved by creators and founders.",
        description: "Discover what industry leaders and community members say about our products.",
        items: [
          { title: "Maya Lin", role: "Creative Director", description: "The craftsmanship and attention to detail exceed every expectation. Truly remarkable execution." },
          { title: "David Zhao", role: "Specialty Coffee Roaster", description: "The consistency and purity are unmatched. Our customers notice the difference immediately." },
          { title: "Elena Rostova", role: "Design Principal", description: "A masterclass in modern, purposeful product engineering. Five stars across the board." },
        ],
      },
      style: {
        backgroundColor: bp.palette.accent,
        textColor: bp.palette.secondary,
        paddingY: "lg",
        alignment: "center",
        borderRadius: "none",
      },
      animation: "fade",
    },
    {
      id: "sec-faq",
      type: "faq",
      name: "Frequently Asked Questions",
      visible: true,
      content: {
        badge: "Customer Care",
        title: "Got questions? We have answers.",
        description: "Everything you need to know about our products, delivery, and guarantees.",
        items: [
          { title: "Where are your products crafted?", description: "All items are ethically sourced and manufactured in certified small-batch facilities to guarantee peak freshness." },
          { title: "What is your satisfaction guarantee?", description: "We stand 100% behind our offerings. If you are not delighted within 30 days, we issue a full refund." },
          { title: "How can I get in touch with support?", description: "Our concierge team is available 24/7 via live chat or email to assist with orders and custom inquiries." },
        ],
      },
      style: {
        backgroundColor: bp.palette.background,
        textColor: bp.palette.secondary,
        paddingY: "lg",
        alignment: "center",
        borderRadius: "none",
      },
      animation: "slide-up",
    },
    {
      id: "sec-cta",
      type: "cta",
      name: "Call To Action",
      visible: true,
      content: {
        badge: "Ready to launch?",
        title: "Bring your vision to life today.",
        description: "Join hundreds of innovators launching world-class web experiences with SiteGenAI.",
        buttonText: "Start Building Now",
        buttonLink: "/create",
      },
      style: {
        backgroundColor: bp.palette.primary,
        textColor: "#FFFFFF",
        paddingY: "lg",
        alignment: "center",
        borderRadius: "lg",
      },
      animation: "zoom",
    },
    {
      id: "sec-footer",
      type: "footer",
      name: "Footer & Legal",
      visible: true,
      content: {
        title: bp.name,
        description: "© " + new Date().getFullYear() + ` ${bp.name}. All rights reserved.`,
        footerLinks: [
          { title: "Product", links: ["Overview", "Features", "Pricing"] },
          { title: "Company", links: ["About", "Careers", "Press"] },
          { title: "Legal", links: ["Privacy", "Terms", "Security"] },
        ],
      },
      style: {
        backgroundColor: bp.palette.secondary,
        textColor: "#FFFFFF",
        paddingY: "md",
        alignment: "left",
        borderRadius: "none",
      },
      animation: "none",
    },
  ];
}
