import { GoogleGenAI } from "@google/genai";
import {
  StoryboardDocument,
  StoryboardSection,
  StoryboardPage,
  StoryboardStatus,
  StoryboardLayoutType,
} from "@/types/storyboard";
import { ImageMetadata, SectionType, WebsiteDocument, WebsiteSection, SectionItem } from "@/types/project";
import { searchPexels, searchUnsplash, searchCuratedStock } from "@/lib/images/imageDiscovery";
import { projectService } from "@/lib/projects/projectService";

const STORYBOARD_STORAGE_KEY = "sitegenai_storyboards_v1";

// Server-side in-memory persistence store bound to globalThis across Next.js route bundles
declare global {
  var __sitegenai_server_storyboards: Map<string, StoryboardDocument> | undefined;
}

function getServerStoryboardsMap(): Map<string, StoryboardDocument> {
  if (!globalThis.__sitegenai_server_storyboards) {
    globalThis.__sitegenai_server_storyboards = new Map<string, StoryboardDocument>();
  }
  return globalThis.__sitegenai_server_storyboards;
}

function getGeminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || "").replace(/^:+/, "").trim();
}

export class StoryboardService {
  private getStorage(): StoryboardDocument[] {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORYBOARD_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return Array.from(getServerStoryboardsMap().values());
  }

  private saveStorage(storyboards: StoryboardDocument[]) {
    const map = getServerStoryboardsMap();
    storyboards.forEach((sb) => map.set(sb.id, sb));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORYBOARD_STORAGE_KEY, JSON.stringify(storyboards));
      } catch {}
    }
  }

  public getStoryboard(id: string): StoryboardDocument | undefined {
    const map = getServerStoryboardsMap();
    if (map.has(id)) {
      return map.get(id);
    }
    const list = this.getStorage();
    const found = list.find((s) => s.id === id);
    if (found) map.set(id, found);
    return found;
  }

  public saveStoryboard(doc: StoryboardDocument): StoryboardDocument {
    doc.updatedAt = new Date().toISOString();
    const map = getServerStoryboardsMap();
    map.set(doc.id, doc);

    const list = this.getStorage();
    const idx = list.findIndex((s) => s.id === doc.id);
    if (idx >= 0) {
      list[idx] = doc;
    } else {
      list.unshift(doc);
    }
    this.saveStorage(list);
    return doc;
  }

  /**
   * Stage One: Generates a validated storyboard plan using Gemini + Pexels/Unsplash image discovery.
   * Full website generation is NOT triggered during this step.
   */
  public async createStoryboardFromPrompt(params: {
    prompt: string;
    category?: string;
    style?: string;
    palette?: { name: string; primary: string; secondary: string; background: string; accent: string };
  }): Promise<StoryboardDocument> {
    const id = `sb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const category = params.category || "General Business";
    const style = params.style || "Modern & Editorial";

    const defaultPalette = params.palette || {
      name: "Emerald Vitality",
      primary: "#10B981",
      secondary: "#04120C",
      background: "#FFFFFF",
      accent: "#ECFDF5",
    };

    // Initial Storyboard Document
    let storyboard: StoryboardDocument = {
      id,
      projectId: `proj-${Date.now().toString(36)}`,
      version: 1,
      status: "prompt_submitted",
      prompt: params.prompt,
      projectName: this.deriveProjectName(params.prompt, category),
      purpose: params.prompt,
      targetAudience: "Discerning customers seeking premium quality and authentic craftsmanship.",
      category,
      designDirection: `${style} with intentional whitespace, rich photography, and clear typographic hierarchy.`,
      palette: defaultPalette,
      typography: {
        headingFont: "Outfit",
        bodyFont: "Plus Jakarta Sans",
        pairName: "Outfit & Plus Jakarta Sans",
      },
      pages: [],
      imageManifest: {},
      responsiveNotes: "Fully responsive with mobile-first breakpoints and accessible tap targets.",
      accessibilityNotes: "Complies with WCAG AA contrast guidelines with descriptive alt text on all imagery.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveStoryboard(storyboard);

    // 1. Gemini Planning Phase
    storyboard.status = "planning_storyboard";
    this.saveStoryboard(storyboard);

    const plannedSections = await this.planSectionsWithGemini(params.prompt, category, style);

    // 2. Image Discovery Phase with Pexels & Unsplash
    storyboard.status = "searching_images";
    this.saveStoryboard(storyboard);

    const usedImageUrls = new Set<string>();
    const imageManifest: Record<string, ImageMetadata> = {};

    for (let i = 0; i < plannedSections.length; i++) {
      const sec = plannedSections[i];
      sec.sectionNumber = i + 1;

      if (sec.imageRequirement && sec.imageRequirement.keywords.length > 0) {
        const query = sec.imageRequirement.keywords.join(" ");
        const orientation = sec.imageRequirement.orientation || "landscape";

        let photos = await searchPexels({ query, orientation, perPage: 5 });
        if ((!photos || photos.length === 0) && process.env.UNSPLASH_ACCESS_KEY) {
          photos = await searchUnsplash({ query, orientation, perPage: 5 });
        }
        if (!photos || photos.length === 0) {
          photos = searchCuratedStock(query, orientation, 5);
        }

        // Deduplicate: Pick a photo that hasn't been used in a previous section
        let selected = photos.find((p) => !usedImageUrls.has(p.url));
        if (!selected && photos.length > 0) {
          selected = photos[0];
        }

        if (selected) {
          usedImageUrls.add(selected.url);
          sec.selectedImage = selected;
          imageManifest[sec.id] = selected;
        }
      }
    }

    // Assemble pages
    const homePage: StoryboardPage = {
      id: "page-home",
      title: "Home",
      path: "/",
      sections: plannedSections,
    };

    storyboard.pages = [homePage];
    storyboard.imageManifest = imageManifest;
    storyboard.status = "awaiting_approval";
    storyboard.updatedAt = new Date().toISOString();

    return this.saveStoryboard(storyboard);
  }

  /**
   * Plans at least 8 structured sections tailored to the prompt using Gemini
   */
  private async planSectionsWithGemini(
    prompt: string,
    category: string,
    style: string
  ): Promise<StoryboardSection[]> {
    const apiKey = getGeminiApiKey();

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `
You are a Principal Product Designer & Website Art Director.
A client needs a complete visual storyboard for their website:
Prompt: "${prompt}"
Category: "${category}"
Style: "${style}"

Create a structured plan with at least 8 to 10 distinct sections for the website (Header, Hero, Products/Services, Our Story, Quality/Process, Benefits, Gallery/Showcase, Testimonials, FAQ, CTA, Footer).
Make headlines compelling, descriptive, and tailored specifically to this business (e.g. for a dairy brand: fresh cow milk, organic ghee, farm heritage, quality assurance).

Respond ONLY with valid JSON (no markdown formatting, no code fences):
[
  {
    "id": "sec-hero",
    "name": "Hero Spotlight",
    "type": "hero",
    "headline": "Specific Engaging Headline",
    "subheadline": "Supporting tagline",
    "contentSummary": "1-2 sentences explaining what will appear in this section",
    "layout": "split",
    "imageRequirement": {
      "keywords": ["specific", "visual", "keywords"],
      "orientation": "landscape",
      "purpose": "Primary hero visual"
    },
    "callToAction": {
      "label": "Explore Products",
      "target": "#products"
    },
    "enabled": true
  }
]
Allowed layout values: "split", "centered", "grid", "cards", "fullwidth".
Allowed type values: "header", "hero", "product", "features", "story", "gallery", "testimonials", "faq", "cta", "footer".
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: systemPrompt,
        });

        const raw = response.text || "";
        const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(clean);

        if (Array.isArray(parsed) && parsed.length >= 6) {
          return parsed.map((item: any, idx: number) => ({
            id: item.id || `sec-${item.type || "section"}-${idx + 1}`,
            sectionNumber: idx + 1,
            name: item.name || `Section ${idx + 1}`,
            type: (item.type || "features") as SectionType,
            headline: item.headline || `${prompt} Spotlight`,
            subheadline: item.subheadline || "",
            contentSummary: item.contentSummary || "Tailored section content.",
            layout: (item.layout || "split") as StoryboardLayoutType,
            imageRequirement: item.imageRequirement || {
              keywords: [prompt, item.type],
              orientation: "landscape",
              purpose: `${item.name} visual`,
            },
            callToAction: item.callToAction,
            enabled: item.enabled !== false,
          }));
        }
      } catch (err) {
        console.warn("Gemini storyboard planning fallback to curated template:", err);
      }
    }

    // High quality deterministic fallback matching the prompt
    return this.createCuratedStoryboardSections(prompt, category);
  }

  private createCuratedStoryboardSections(prompt: string, category: string): StoryboardSection[] {
    const isDairy = /milk|dairy|ghee|paneer|curd|farm|cow/i.test(prompt);
    const isFood = /restaurant|cafe|coffee|bakery|food|dining/i.test(prompt);
    const isTech = /saas|tech|software|app|cloud|ai|platform/i.test(prompt);

    if (isDairy) {
      return [
        {
          id: "sec-header",
          sectionNumber: 1,
          name: "Navigation Header",
          type: "header",
          headline: "Pure Farm Dairy Experience",
          subheadline: "Fresh from our grass-fed herds to your table",
          contentSummary: "Brand identity, quick navigation links (Products, Heritage, Standards, Contact), and Cart/Order button.",
          layout: "fullwidth",
          enabled: true,
        },
        {
          id: "sec-hero",
          sectionNumber: 2,
          name: "Hero Spotlight",
          type: "hero",
          headline: "Pure, Organic Dairy Delivered Fresh from Our Pastures",
          subheadline: "100% grass-fed cow milk, traditional Vedic bilona ghee, fresh paneer, and rich curd.",
          contentSummary: "High-impact hero showcase with serene dairy cattle pasture imagery, purity badges, and subscription button.",
          layout: "split",
          imageRequirement: {
            keywords: ["dairy cow farm pasture", "green meadow", "cattle"],
            orientation: "landscape",
            purpose: "Hero background capturing serene pasture and ethical cows",
          },
          callToAction: { label: "Subscribe Fresh Milk", target: "#products" },
          enabled: true,
        },
        {
          id: "sec-product",
          sectionNumber: 3,
          name: "Signature Dairy Lineup",
          type: "product",
          headline: "Farm-Fresh Essentials Crafted Daily",
          subheadline: "Raw whole milk, organic cultured ghee, soft artisanal paneer, and thick probiotic curd.",
          contentSummary: "Product catalog grid displaying each dairy item with pricing, bottle sizes, and one-click ordering.",
          layout: "cards",
          imageRequirement: {
            keywords: ["glass milk bottle", "fresh milk", "dairy pour"],
            orientation: "portrait",
            purpose: "Signature milk bottle and packaging photography",
          },
          callToAction: { label: "View All Products", target: "#products" },
          enabled: true,
        },
        {
          id: "sec-story",
          sectionNumber: 4,
          name: "Our Story & Ethical Heritage",
          type: "story",
          headline: "Honoring the Sacred Bond Between Land and Herds",
          subheadline: "Three generations of sustainable, cruelty-free, organic dairy farming.",
          contentSummary: "Storytelling narrative detailing our morning milking rituals, chemical-free fodder, and family roots.",
          layout: "split",
          imageRequirement: {
            keywords: ["organic dairy farm", "farmer barn", "milking"],
            orientation: "landscape",
            purpose: "Artisanal farmer milking and caring for cattle",
          },
          enabled: true,
        },
        {
          id: "sec-features",
          sectionNumber: 5,
          name: "Quality Standards & Purity Pillars",
          type: "features",
          headline: "Tested for Purity. Zero Hormones. Zero Preservatives.",
          subheadline: "61 rigorous quality checks conducted before morning delivery.",
          contentSummary: "Bento grid outlining Cold Chain delivery at 4°C, A2 beta-casein certification, and glass bottle packaging.",
          layout: "grid",
          imageRequirement: {
            keywords: ["glass jar organic ghee", "yellow ghee", "butter"],
            orientation: "square",
            purpose: "Artisanal ghee texture and quality detail",
          },
          enabled: true,
        },
        {
          id: "sec-process",
          sectionNumber: 6,
          name: "From Farm to Home Process",
          type: "features",
          headline: "The 6:00 AM Morning Milk Run",
          subheadline: "Milked at dawn, chilled instantly, delivered to your doorstep before breakfast.",
          contentSummary: "Visual step-by-step timeline of hygiene collection, chilling, quality testing, and temperature-controlled dispatch.",
          layout: "cards",
          imageRequirement: {
            keywords: ["milk delivery glass bottles", "doorstep milk"],
            orientation: "landscape",
            purpose: "Morning doorstep delivery in chilled crates",
          },
          enabled: true,
        },
        {
          id: "sec-gallery",
          sectionNumber: 7,
          name: "Farm Moments & Pasture Gallery",
          type: "gallery",
          headline: "Life on the Open Grasslands",
          subheadline: "A visual peek into our free-roaming dairy cattle sanctuary.",
          contentSummary: "Responsive photography grid capturing lush green paddocks, artisanal butter churning, and milking sheds.",
          layout: "grid",
          imageRequirement: {
            keywords: ["cows grazing meadow", "sunlight green pasture"],
            orientation: "landscape",
            purpose: "Panoramic herd grazing on sunlit fields",
          },
          enabled: true,
        },
        {
          id: "sec-testimonials",
          sectionNumber: 8,
          name: "Family Testimonials & Reviews",
          type: "testimonials",
          headline: "Loved by Over 12,000 Morning Breakfast Tables",
          subheadline: "Verified reviews from mothers, chefs, and health-conscious families.",
          contentSummary: "Customer quote carousel with 5-star ratings praising the rich natural cream layer and creamy taste.",
          layout: "cards",
          enabled: true,
        },
        {
          id: "sec-faq",
          sectionNumber: 9,
          name: "Frequently Asked Questions",
          type: "faq",
          headline: "Everything You Need to Know About Our Dairy",
          subheadline: "Answers regarding subscriptions, bottle returns, and lactose tolerance.",
          contentSummary: "Accordion resolving common questions about delivery timing, pausing orders, and organic certification.",
          layout: "centered",
          enabled: true,
        },
        {
          id: "sec-cta",
          sectionNumber: 10,
          name: "Trial Pack Call to Action",
          type: "cta",
          headline: "Taste the Purity of Real Milk Tomorrow Morning",
          subheadline: "Order a 3-day complimentary tasting crate with whole milk and sample organic ghee.",
          contentSummary: "High-contrast conversion section with zip code checker and immediate checkout action.",
          layout: "centered",
          callToAction: { label: "Order Trial Crate", target: "#order" },
          enabled: true,
        },
        {
          id: "sec-footer",
          sectionNumber: 11,
          name: "Comprehensive Footer",
          type: "footer",
          headline: "Pure Farm Dairy Co.",
          subheadline: "Certified Organic & Farm Fresh Since 1984",
          contentSummary: "Contact details, delivery locations, legal disclosures, and newsletter subscription form.",
          layout: "fullwidth",
          enabled: true,
        },
      ];
    }

    if (isFood) {
      return [
        {
          id: "sec-header",
          sectionNumber: 1,
          name: "Culinary Navigation Header",
          type: "header",
          headline: "Artisanal Table & Kitchen",
          subheadline: "Fine seasonal dining and private banquets",
          contentSummary: "Brand identity, menu links (Menus, Cellar, Chef's Table, Contact), and Reserve Table action.",
          layout: "fullwidth",
          enabled: true,
        },
        {
          id: "sec-hero",
          sectionNumber: 2,
          name: "Hero Spotlight",
          type: "hero",
          headline: "Artisanal Flavors, Seasonal Harvests & Inspired Dining",
          subheadline: "Crafted daily with local farm produce, wood-fired heritage ovens, and master culinary technique.",
          contentSummary: "Cinematic hero showcase featuring plated culinary creations and ambient dining photography.",
          layout: "split",
          imageRequirement: {
            keywords: ["culinary restaurant dish plated", "gourmet dining table", "chef kitchen"],
            orientation: "landscape",
            purpose: "Signature gastronomic centerpiece hero",
          },
          callToAction: { label: "Book a Table", target: "#reservations" },
          enabled: true,
        },
        {
          id: "sec-product",
          sectionNumber: 3,
          name: "Signature Tasting Menu & Cellar",
          type: "product",
          headline: "Curated Courses & Seasonal Specials",
          subheadline: "From handmade pastas and dry-aged steaks to biodynamic wine selections.",
          contentSummary: "Course catalog displaying tasting menus, wine pairings, and á la carte highlights with pricing.",
          layout: "cards",
          imageRequirement: {
            keywords: ["gourmet plate fine dining", "pasta culinary wine", "steak plate gourmet"],
            orientation: "portrait",
            purpose: "Featured tasting course photography",
          },
          callToAction: { label: "Explore Menus", target: "#menu" },
          enabled: true,
        },
        {
          id: "sec-story",
          sectionNumber: 4,
          name: "Chef's Philosophy & Heritage",
          type: "story",
          headline: "Rooted in Tradition. Inspired by Modern Fire.",
          subheadline: "Two decades of honoring sustainable growers, heirloom varieties, and slow cooking.",
          contentSummary: "Storytelling narrative detailing our open kitchen hearth, direct grower partnerships, and culinary craft.",
          layout: "split",
          imageRequirement: {
            keywords: ["chef cooking hearth flame", "open kitchen restaurant ambiance"],
            orientation: "landscape",
            purpose: "Chef working at hearth",
          },
          enabled: true,
        },
        {
          id: "sec-features",
          sectionNumber: 5,
          name: "The Culinary Pillars",
          type: "features",
          headline: "Zero Compromise from Soil to Plate",
          subheadline: "Hand-picked organic produce, ethically reared livestock, and house-made preserves.",
          contentSummary: "Bento grid illustrating Farm-to-Table provenance, Sommelier cellar selection, and private dining.",
          layout: "grid",
          imageRequirement: {
            keywords: ["wine glasses cellar sommelier", "fresh farm vegetables kitchen"],
            orientation: "square",
            purpose: "Cellar and kitchen details",
          },
          enabled: true,
        },
        {
          id: "sec-gallery",
          sectionNumber: 6,
          name: "Atmosphere & Dining Moments",
          type: "gallery",
          headline: "A Sanctuary for Senses",
          subheadline: "Warm candlelight, hand-thrown ceramics, and timeless hospitality.",
          contentSummary: "High-contrast visual grid capturing dining room ambiance, craft cocktails, and plating details.",
          layout: "grid",
          imageRequirement: {
            keywords: ["restaurant interior warm candlelight", "cocktail bar glassware"],
            orientation: "landscape",
            purpose: "Dining room atmosphere",
          },
          enabled: true,
        },
        {
          id: "sec-testimonials",
          sectionNumber: 7,
          name: "Critic Acclaim & Guest Reviews",
          type: "testimonials",
          headline: "Praised by Leading Critics & Cherished Guests",
          subheadline: "Reflections on unforgettable evenings and culinary discovery.",
          contentSummary: "Customer quote carousel with ratings praising our seasonal tasting flight and service.",
          layout: "cards",
          enabled: true,
        },
        {
          id: "sec-faq",
          sectionNumber: 8,
          name: "Dining & Reservation Inquiries",
          type: "faq",
          headline: "Plan Your Visit with Ease",
          subheadline: "Details on private room bookings, corkage policies, and dietary accommodations.",
          contentSummary: "Accordion answers to common guest questions.",
          layout: "centered",
          enabled: true,
        },
        {
          id: "sec-cta",
          sectionNumber: 9,
          name: "Evening Reservation Call to Action",
          type: "cta",
          headline: "Reserve Your Table for an Extraordinary Evening",
          subheadline: "Seating is limited. Secure your reservation online or speak with our concierge.",
          contentSummary: "High-conversion table booking block with instant date & party size picker.",
          layout: "centered",
          callToAction: { label: "Confirm Reservation", target: "#booking" },
          enabled: true,
        },
        {
          id: "sec-footer",
          sectionNumber: 10,
          name: "Location, Hours & Directory",
          type: "footer",
          headline: "Artisanal Table & Kitchen",
          subheadline: "Dinner Served Tuesday through Sunday from 5:30 PM",
          contentSummary: "Address, parking directions, phone reservations, social channels, and press inquiries.",
          layout: "fullwidth",
          enabled: true,
        },
      ];
    }

    if (isTech) {
      return [
        {
          id: "sec-header",
          sectionNumber: 1,
          name: "Cloud Platform Navigation",
          type: "header",
          headline: "Apex Cloud Intelligence",
          subheadline: "Unified telemetry and event pipelines for engineering teams",
          contentSummary: "Platform branding, product navigation (Features, Docs, Pricing, Integrations), and Start Free action.",
          layout: "fullwidth",
          enabled: true,
        },
        {
          id: "sec-hero",
          sectionNumber: 2,
          name: "Hero Spotlight",
          type: "hero",
          headline: "Real-Time Telemetry & AI Pipelines Built for Modern Engineering",
          subheadline: "Ingest millions of events per second, detect anomalies before users notice, and scale with zero infra overhead.",
          contentSummary: "High-impact SaaS hero with dashboard telemetry visuals, GitHub badges, and free trial CTA.",
          layout: "split",
          imageRequirement: {
            keywords: ["saas software dashboard analytics", "cloud server technology data", "developer workstation"],
            orientation: "landscape",
            purpose: "Real-time SaaS product telemetry visual",
          },
          callToAction: { label: "Start Free Trial — 14 Days", target: "#signup" },
          enabled: true,
        },
        {
          id: "sec-features",
          sectionNumber: 3,
          name: "Core Platform Capabilities",
          type: "features",
          headline: "Engineered for Sub-Millisecond Event Processing",
          subheadline: "Everything modern DevOps and engineering leaders need in a single pane of glass.",
          contentSummary: "Bento grid detailing automated anomaly detection, distributed tracing, and zero-trust security mesh.",
          layout: "grid",
          imageRequirement: {
            keywords: ["cloud computing network tech", "developer terminal code dark"],
            orientation: "square",
            purpose: "Cloud data architecture visual",
          },
          enabled: true,
        },
        {
          id: "sec-product",
          sectionNumber: 4,
          name: "Platform Modules & Workflows",
          type: "product",
          headline: "Integrated Modules for Every Layer of Your Stack",
          subheadline: "Deploy dedicated collectors, stream real-time logs, and automate incident remediation.",
          contentSummary: "Interactive product cards with feature matrices, API specs, and tier indicators.",
          layout: "cards",
          imageRequirement: {
            keywords: ["analytics chart graphs interface", "modern dashboard dark mode"],
            orientation: "portrait",
            purpose: "SaaS dashboard module preview",
          },
          callToAction: { label: "View Architecture", target: "#specs" },
          enabled: true,
        },
        {
          id: "sec-story",
          sectionNumber: 5,
          name: "Architecture & Zero Downtime SLA",
          type: "story",
          headline: "Built by Distributed Systems Veterans",
          subheadline: "Why Fortune 500 infrastructure teams trust us to process over 40 billion events daily.",
          contentSummary: "Narrative on reliability engineering, SOC2 Type II certification, and multi-region failover.",
          layout: "split",
          imageRequirement: {
            keywords: ["datacenter server room tech", "engineering team coding office"],
            orientation: "landscape",
            purpose: "Enterprise data center visual",
          },
          enabled: true,
        },
        {
          id: "sec-gallery",
          sectionNumber: 6,
          name: "Developer Experience & SDKs",
          type: "gallery",
          headline: "Native SDKs for Python, Node, Go & Rust",
          subheadline: "Instrument your services in under 3 lines of code with zero vendor lock-in.",
          contentSummary: "Terminal previews, code snippets, and telemetry graph screenshots.",
          layout: "grid",
          imageRequirement: {
            keywords: ["code on screen developer", "modern minimalist software ui"],
            orientation: "landscape",
            purpose: "Developer IDE and terminal visual",
          },
          enabled: true,
        },
        {
          id: "sec-testimonials",
          sectionNumber: 7,
          name: "Engineering Testimonials & Impact",
          type: "testimonials",
          headline: "Trusted by 10,000+ Fast-Shipping Engineering Teams",
          subheadline: "Real metrics from CTOs and Site Reliability Engineers.",
          contentSummary: "Verified testimonial cards highlighting 4x faster incident response and 80% reduced log storage costs.",
          layout: "cards",
          enabled: true,
        },
        {
          id: "sec-faq",
          sectionNumber: 8,
          name: "Technical FAQ & Compliance",
          type: "faq",
          headline: "Answers for Security & Infrastructure Teams",
          subheadline: "GDPR, HIPAA, self-hosted deployment options, and enterprise SSO.",
          contentSummary: "Accordion covering data residency, custom sampling rates, and enterprise SLAs.",
          layout: "centered",
          enabled: true,
        },
        {
          id: "sec-cta",
          sectionNumber: 9,
          name: "Immediate Onboarding CTA",
          type: "cta",
          headline: "Deploy Enterprise Telemetry in Under 5 Minutes",
          subheadline: "No credit card required. Includes 50GB monthly free tier forever.",
          contentSummary: "High-contrast registration banner with instant API key issuance.",
          layout: "centered",
          callToAction: { label: "Get Your API Key", target: "#register" },
          enabled: true,
        },
        {
          id: "sec-footer",
          sectionNumber: 10,
          name: "Platform Directory & Status",
          type: "footer",
          headline: "Apex Cloud Intelligence",
          subheadline: "Systems Status: All 24 Global Edge Regions Operational",
          contentSummary: "API Documentation, GitHub repository, Changelog, Status page, and Compliance certificates.",
          layout: "fullwidth",
          enabled: true,
        },
      ];
    }

    // Default universal 9-section marketing structure
    return [
      {
        id: "sec-header",
        sectionNumber: 1,
        name: "Navigation Header",
        type: "header",
        headline: prompt,
        contentSummary: "Sticky brand navigation bar with logo, menu items, and primary CTA.",
        layout: "fullwidth",
        enabled: true,
      },
      {
        id: "sec-hero",
        sectionNumber: 2,
        name: "Hero Spotlight",
        type: "hero",
        headline: `Experience the Excellence of ${prompt}`,
        subheadline: "Crafted with passion, modern aesthetics, and verified authenticity.",
        contentSummary: "Hero visual presentation with prominent value proposition and conversion actions.",
        layout: "split",
        imageRequirement: {
          keywords: [prompt, "showcase", "flagship"],
          orientation: "landscape",
          purpose: "Primary hero banner",
        },
        callToAction: { label: "Get Started", target: "#features" },
        enabled: true,
      },
      {
        id: "sec-features",
        sectionNumber: 3,
        name: "Core Highlights & Pillars",
        type: "features",
        headline: "Why Customers Trust Our Standards",
        subheadline: "Built with precision, sustainability, and attention to every detail.",
        contentSummary: "Bento grid detailing key services, features, and advantages.",
        layout: "grid",
        imageRequirement: {
          keywords: [prompt, "craftsmanship", "detail"],
          orientation: "square",
          purpose: "Feature illustration",
        },
        enabled: true,
      },
      {
        id: "sec-story",
        sectionNumber: 4,
        name: "Our Heritage & Story",
        type: "story",
        headline: "Born from a Passion for Perfection",
        subheadline: "Our journey from humble beginnings to industry leadership.",
        contentSummary: "Editorial storytelling section outlining purpose, vision, and team commitment.",
        layout: "split",
        imageRequirement: {
          keywords: [prompt, "workshop", "founder"],
          orientation: "landscape",
          purpose: "Story visual",
        },
        enabled: true,
      },
      {
        id: "sec-product",
        sectionNumber: 5,
        name: "Curated Offerings & Catalog",
        type: "product",
        headline: "Explore Our Signature Collections",
        subheadline: "Handpicked offerings designed to delight.",
        contentSummary: "Product or service cards with pricing, descriptions, and order buttons.",
        layout: "cards",
        imageRequirement: {
          keywords: [prompt, "product", "collection"],
          orientation: "portrait",
          purpose: "Product card visual",
        },
        callToAction: { label: "View Collection", target: "#catalog" },
        enabled: true,
      },
      {
        id: "sec-gallery",
        sectionNumber: 6,
        name: "Visual Moments Gallery",
        type: "gallery",
        headline: "Atmospheric Visual Gallery",
        subheadline: "A curated lens into our daily craft and customer experiences.",
        contentSummary: "Responsive photography grid capturing authentic details.",
        layout: "grid",
        imageRequirement: {
          keywords: [prompt, "lifestyle", "aesthetic"],
          orientation: "landscape",
          purpose: "Gallery image",
        },
        enabled: true,
      },
      {
        id: "sec-testimonials",
        sectionNumber: 7,
        name: "Client Reviews & Social Proof",
        type: "testimonials",
        headline: "Trusted by Discerning Clients Worldwide",
        subheadline: "Real stories from people who rely on our services daily.",
        contentSummary: "Verified customer testimonials and ratings carousel.",
        layout: "cards",
        enabled: true,
      },
      {
        id: "sec-faq",
        sectionNumber: 8,
        name: "Frequently Asked Questions",
        type: "faq",
        headline: "Answers to Common Inquiries",
        subheadline: "Everything you need to know before joining us.",
        contentSummary: "Accordion answers to common onboarding and purchase questions.",
        layout: "centered",
        enabled: true,
      },
      {
        id: "sec-cta",
        sectionNumber: 9,
        name: "High-Conversion CTA",
        type: "cta",
        headline: "Ready to Elevate Your Experience?",
        subheadline: "Join thousands of satisfied clients today.",
        contentSummary: "Focused call-to-action block with immediate registration.",
        layout: "centered",
        callToAction: { label: "Start Today", target: "#contact" },
        enabled: true,
      },
      {
        id: "sec-footer",
        sectionNumber: 10,
        name: "Footer & Directory",
        type: "footer",
        headline: prompt,
        contentSummary: "Directory links, social channels, copyright, and contact details.",
        layout: "fullwidth",
        enabled: true,
      },
    ];
  }

  private deriveProjectName(prompt: string, category: string): string {
    const words = prompt
      .replace(/create|build|website|for|a|an|the|modern|stunning/gi, "")
      .trim()
      .split(/\s+/);
    if (words.length > 0 && words[0].length > 1) {
      return (
        words.slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") +
        " Experience"
      );
    }
    return `${category} Experience`;
  }

  /**
   * Updates an existing storyboard before approval (e.g. edited headlines, reordered sections).
   * Does NOT advance state to approved.
   */
  public updateStoryboard(
    id: string,
    updates: Partial<StoryboardDocument>
  ): StoryboardDocument {
    const existing = this.getStoryboard(id);
    if (!existing) {
      throw new Error(`Storyboard with id "${id}" not found.`);
    }

    if (existing.status === "generating_website") {
      throw new Error("Cannot edit storyboard while website generation is in progress.");
    }

    const updated: StoryboardDocument = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    return this.saveStoryboard(updated);
  }

  /**
   * Replaces a specific section's image in the storyboard and manifest
   */
  public replaceSectionImage(
    storyboardId: string,
    sectionId: string,
    newImage: ImageMetadata
  ): StoryboardDocument {
    const sb = this.getStoryboard(storyboardId);
    if (!sb) throw new Error("Storyboard not found");

    sb.imageManifest[sectionId] = newImage;
    for (const page of sb.pages) {
      for (const sec of page.sections) {
        if (sec.id === sectionId) {
          sec.selectedImage = newImage;
        }
      }
    }
    sb.version += 1;
    sb.updatedAt = new Date().toISOString();
    return this.saveStoryboard(sb);
  }

  /**
   * Explicit Server-Side Approval Gate.
   * Validates state & version, records approval, and enforces idempotency.
   */
  public approveStoryboard(
    storyboardId: string,
    version: number,
    userId: string = "local-user"
  ): { success: boolean; storyboard: StoryboardDocument; alreadyApproved?: boolean } {
    const sb = this.getStoryboard(storyboardId);
    if (!sb) {
      throw new Error(`Storyboard "${storyboardId}" does not exist.`);
    }

    // Idempotency: if already approved or generating, return gracefully
    if (sb.status === "approved" || sb.status === "generating_website" || sb.status === "website_ready") {
      return { success: true, storyboard: sb, alreadyApproved: true };
    }

    if (sb.status !== "awaiting_approval" && sb.status !== "storyboard_ready") {
      throw new Error(`Storyboard is in invalid state "${sb.status}" for approval.`);
    }

    sb.status = "approved";
    sb.approvedAt = new Date().toISOString();
    sb.approvedBy = userId;
    sb.generationJobId = `job-${Date.now().toString(36)}`;
    sb.updatedAt = new Date().toISOString();

    const saved = this.saveStoryboard(sb);
    return { success: true, storyboard: saved };
  }

  /**
   * Stage Two: Generates full website from the approved storyboard.
   * Only runnable when status is "approved". Reuses approved images & structure.
   */
  public async generateWebsiteFromApprovedStoryboard(
    storyboardId: string
  ): Promise<{ success: boolean; project: WebsiteDocument }> {
    const sb = this.getStoryboard(storyboardId);
    if (!sb) {
      throw new Error("Storyboard not found");
    }

    // Idempotency: if website was already generated and exists, return existing project
    if (sb.status === "website_ready" && sb.generatedProjectId) {
      const existing = projectService.getProjectById(sb.generatedProjectId);
      if (existing) {
        return { success: true, project: existing };
      }
    }

    if (sb.status !== "approved" && sb.status !== "generating_website" && sb.status !== "website_ready") {
      throw new Error(
        `Website generation blocked: Storyboard status is "${sb.status}". Explicit server-side approval is required first.`
      );
    }

    sb.status = "generating_website";
    this.saveStoryboard(sb);

    // Convert approved storyboard sections to website sections
    const homeSections: WebsiteSection[] = (sb.pages[0]?.sections || [])
      .filter((s) => s.enabled)
      .map((sec, idx) => {
        const img = sec.selectedImage || sb.imageManifest[sec.id];
        return {
          id: sec.id,
          type: sec.type,
          name: sec.name,
          visible: true,
          content: {
            title: sec.headline,
            subtitle: sec.subheadline || "",
            description: sec.contentSummary,
            badge: sec.name,
            buttonText: sec.callToAction?.label || (sec.type === "hero" ? "Get Started" : "Learn More"),
            buttonLink: sec.callToAction?.target || "#",
            imageUrl: img?.url,
            imageMetadata: img,
            items: this.generateDynamicSectionItems(sec, sb),
          },
          style: {
            backgroundColor: idx % 2 === 0 ? "#FFFFFF" : sb.palette.accent,
            textColor: "#172033",
            paddingY: "lg",
            alignment: sec.layout === "centered" ? "center" : "left",
            borderRadius: "none",
            focalPosition: "50% 50%",
            cropZoom: 1,
          },
          animation: "slide-up",
        };
      });

    const project: WebsiteDocument = {
      id: sb.projectId,
      name: sb.projectName,
      description: sb.purpose,
      category: sb.category,
      style: sb.designDirection,
      theme: {
        primaryColor: sb.palette.primary,
        secondaryColor: sb.palette.secondary,
        backgroundColor: sb.palette.background,
        fontFamily: `${sb.typography.headingFont}, ${sb.typography.bodyFont}`,
      },
      pages: sb.pages.map((p) => p.title),
      activePage: sb.pages[0]?.title || "Home",
      sections: homeSections,
      localPort: 3000,
      isLiveAiGenerated: true,
      aiModelUsed: "Gemini 3.8 Flash & Pexels Discovery",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    };

    // Validate that output strictly preserves the approved storyboard identity
    const validation = this.validateGeneratedWebsite(project, sb);
    if (!validation.valid) {
      console.warn("Website generation validation warnings:", validation.errors);
      if (validation.hasCocoPourAnomaly) {
        console.error("Purging unintended Coco Pour demo remnants from real project.");
        project.name = sb.projectName;
        project.description = sb.purpose;
      }
    }

    projectService.saveProject(project);

    // Update Storyboard to website_ready
    sb.status = "website_ready";
    sb.generatedProjectId = project.id;
    sb.updatedAt = new Date().toISOString();
    this.saveStoryboard(sb);

    return { success: true, project };
  }

  private generateDynamicSectionItems(sec: StoryboardSection, sb: StoryboardDocument): SectionItem[] {
    const context = (sb.prompt + " " + sb.projectName + " " + sb.category).toLowerCase();
    const isDairy = /milk|dairy|ghee|paneer|curd|farm|cow/.test(context);
    const isFood = /restaurant|cafe|coffee|bakery|food|dining/.test(context);
    const isTech = /saas|tech|software|app|cloud|ai|platform/.test(context);

    const imgUrl = sec.selectedImage?.url || sb.imageManifest[sec.id]?.url;

    if (isDairy) {
      if (sec.type === "product") {
        return [
          { title: "A2 Raw Whole Cow Milk", description: "Farm fresh grass-fed whole milk in 1L sterilized glass bottle.", price: "$3.50", tag: "Daily Fresh", imageUrl: imgUrl },
          { title: "Vedic Bilona Cultured Ghee", description: "Slow-churned from curd made of grass-fed A2 milk in earthen pots.", price: "$24.00", tag: "Heritage", imageUrl: imgUrl },
          { title: "Soft Artisanal Malai Paneer", description: "Handcrafted unaged curd cheese with rich natural texture.", price: "$6.50", tag: "Artisanal", imageUrl: imgUrl },
          { title: "Creamy Probiotic Set Curd", description: "Thick natural dahi cultured with live gut-friendly cultures.", price: "$4.00", tag: "Probiotic", imageUrl: imgUrl },
        ];
      }
      return [
        { title: "100% Grass-Fed Herds", description: "Ethically cared for on open pastures with cruelty-free practices.", icon: "Sparkles", imageUrl: imgUrl },
        { title: "4°C Cold-Chain Delivery", description: "Chilled within minutes of milking and delivered by dawn.", icon: "CheckCircle2", imageUrl: imgUrl },
        { title: "Zero Hormones & Preservatives", description: "Rigorous 61-point purity testing before every morning dispatch.", icon: "ShieldCheck", imageUrl: imgUrl },
      ];
    }

    if (isFood) {
      if (sec.type === "product") {
        return [
          { title: "Chef's Seven-Course Tasting Flight", description: "Seasonal culinary sequence featuring heirloom grains, sea catches, and local mushrooms.", price: "$125", tag: "Signature", imageUrl: imgUrl },
          { title: "Wood-Fired Truffle Agnolotti", description: "Hand-rolled pasta filled with braised short rib and shaved black truffle.", price: "$38", tag: "Handcrafted", imageUrl: imgUrl },
          { title: "Heritage Dry-Aged Ribeye", description: "Charred over oak wood with bone marrow butter and garden herbs.", price: "$65", tag: "Prime Hearth", imageUrl: imgUrl },
          { title: "Sommelier Cellar Pairings", description: "Curated biodynamic wine pairings reflecting natural viticulture.", price: "$75", tag: "Cellar Selection", imageUrl: imgUrl },
        ];
      }
      return [
        { title: "Farm-to-Table Provenance", description: "Daily harvests from regional regenerative farms and artisanal growers.", icon: "Sparkles", imageUrl: imgUrl },
        { title: "Master Wood-Fired Hearth", description: "Ancient cooking techniques infused with contemporary culinary mastery.", icon: "Flame", imageUrl: imgUrl },
        { title: "Ambient Hospitality", description: "Attentive, warm service in an intimate and memorable dining atmosphere.", icon: "Star", imageUrl: imgUrl },
      ];
    }

    if (isTech) {
      if (sec.type === "product") {
        return [
          { title: "Real-Time Telemetry Pipeline", description: "Sub-millisecond ingestion for logs, metrics, and distributed traces.", price: "$49/mo", tag: "Developer", imageUrl: imgUrl },
          { title: "Automated Incident Remediation", description: "AI anomaly detection and automated rollback webhooks.", price: "$149/mo", tag: "Professional", imageUrl: imgUrl },
          { title: "Zero-Trust Security Mesh", description: "SOC2 compliance auditing, encryption at rest, and granular RBAC.", price: "$399/mo", tag: "Enterprise", imageUrl: imgUrl },
          { title: "Global Edge API Gateway", description: "Deploy serverless transforms across 24 worldwide edge points.", price: "Custom", tag: "Dedicated", imageUrl: imgUrl },
        ];
      }
      return [
        { title: "99.99% Enterprise Uptime SLA", description: "Multi-cloud active-active redundancy with automated failover.", icon: "ShieldCheck", imageUrl: imgUrl },
        { title: "Sub-Millisecond Query Engine", description: "Filter billions of live telemetry events with zero query lag.", icon: "Zap", imageUrl: imgUrl },
        { title: "Native OpenTelemetry Ingestion", description: "Drop-in compatibility with standard tracing without proprietary lock-in.", icon: "Layers", imageUrl: imgUrl },
      ];
    }

    return [
      { title: "Verified Excellence", description: `Engineered specifically to deliver outstanding outcomes for ${sb.projectName}.`, icon: "CheckCircle2", imageUrl: imgUrl },
      { title: "Purpose-Driven Design", description: "Meticulously crafted layout focused on user delight and clear communication.", icon: "Sparkles", imageUrl: imgUrl },
      { title: "Enduring Reliability", description: "Tested for consistency, modern responsiveness, and peak performance.", icon: "Star", imageUrl: imgUrl },
    ];
  }

  public validateGeneratedWebsite(
    project: WebsiteDocument,
    sb: StoryboardDocument
  ): { valid: boolean; errors: string[]; hasCocoPourAnomaly: boolean } {
    const errors: string[] = [];
    let hasCocoPourAnomaly = false;

    if (project.id !== sb.projectId) {
      errors.push(`Project ID mismatch: got ${project.id}, expected ${sb.projectId}`);
    }

    if (project.name !== sb.projectName) {
      errors.push(`Project name mismatch: got ${project.name}, expected ${sb.projectName}`);
    }

    const isCocoPrompt = /coco|coconut|cocopour/i.test(sb.prompt + " " + sb.projectName);
    const projectContentStr = JSON.stringify(project).toLowerCase();
    if (!isCocoPrompt && (projectContentStr.includes("coco pour") || projectContentStr.includes("cold-pressed coconut milk"))) {
      errors.push("Detected unintended Coco Pour demo content in generated website for unrelated prompt.");
      hasCocoPourAnomaly = true;
    }

    if (project.sections.length === 0) {
      errors.push("Generated website contains 0 sections.");
    }

    return {
      valid: errors.length === 0,
      errors,
      hasCocoPourAnomaly,
    };
  }
}

export const storyboardService = new StoryboardService();
