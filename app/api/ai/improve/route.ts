import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { WebsiteDocument } from "@/types/project";
import { isGeminiConfigured } from "@/lib/ai/gemini";

export interface WebsiteImprovement {
  id: string;
  sectionId: string;
  sectionName: string;
  field: "title" | "subtitle" | "description" | "buttonText" | "badge" | "style";
  title: string;
  rationale: string;
  category: "visual" | "content" | "responsive" | "accessibility" | "seo" | "conversion";
  currentValue: string;
  suggestedValue: string;
  impact: "High" | "Medium" | "Enhancement";
}

function getApiKey(): string {
  const rawKey = process.env.GEMINI_API_KEY || "";
  return rawKey.replace(/^:+/, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project, mode } = body as {
      project: WebsiteDocument;
      mode: "visual" | "content" | "responsive" | "accessibility" | "seo" | "conversion";
    };

    if (!project || !project.sections || project.sections.length === 0) {
      return NextResponse.json(
        { success: false, error: "Valid project document with sections is required." },
        { status: 400 }
      );
    }

    const selectedMode = mode || "conversion";

    if (isGeminiConfigured()) {
      const apiKey = getApiKey();
      const ai = new GoogleGenAI({ apiKey });

      const sectionsSummary = project.sections.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        title: s.content.title,
        subtitle: s.content.subtitle,
        description: s.content.description,
        buttonText: s.content.buttonText,
        badge: s.content.badge,
      }));

      const promptText = `
You are the Chief Conversion & Design Optimization Strategist for SiteGenAI.
Analyze the following website project and propose 3 to 4 targeted, high-impact improvements for the mode: "${selectedMode.toUpperCase()}".

Website Name: "${project.name}"
Category: "${project.category}"
Style: "${project.style}"

Current Website Sections:
${JSON.stringify(sectionsSummary, null, 2)}

Strictly output valid JSON only without markdown formatting. Return an array of improvements conforming to this structure:
[
  {
    "id": "imp-1",
    "sectionId": "exact section id from above",
    "sectionName": "section name",
    "field": "title" | "subtitle" | "description" | "buttonText" | "badge",
    "title": "Short descriptive title of the recommendation",
    "rationale": "Clear 1-2 sentence explanation of why this change improves ${selectedMode}",
    "category": "${selectedMode}",
    "currentValue": "existing text from section",
    "suggestedValue": "new optimized text proposed by AI",
    "impact": "High" | "Medium" | "Enhancement"
  }
]
`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: promptText,
        });

        const rawText = response.text || "";
        const jsonMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as WebsiteImprovement[];
          return NextResponse.json({
            success: true,
            isLiveAI: true,
            mode: selectedMode,
            improvements: parsed,
          });
        }
      } catch (err: any) {
        console.warn("Live Gemini analysis failed, using curated heuristic optimizer:", err?.message);
      }
    }

    // Curated Heuristic Rule-Based Optimizer (Zero Fluff, Real Actionable Fixes)
    const improvements: WebsiteImprovement[] = [];
    const hero = project.sections.find((s) => s.type === "hero") || project.sections[0];
    const cta = project.sections.find((s) => s.type === "cta" || s.type === "promo");
    const features = project.sections.find((s) => s.type === "features" || s.type === "product");

    if (selectedMode === "conversion") {
      if (hero && hero.content.buttonText) {
        improvements.push({
          id: `opt-conv-1`,
          sectionId: hero.id,
          sectionName: hero.name,
          field: "buttonText",
          title: "Strengthen Hero Call-to-Action",
          rationale: "Replacing generic verbs with benefit-driven action copy increases click-through rates by up to 28%.",
          category: "conversion",
          currentValue: hero.content.buttonText,
          suggestedValue: "Claim Your Experience Free",
          impact: "High",
        });
      }
      if (hero && hero.content.subtitle) {
        improvements.push({
          id: `opt-conv-2`,
          sectionId: hero.id,
          sectionName: hero.name,
          field: "subtitle",
          title: "Clarify Immediate Value Proposition",
          rationale: "Users assess website relevance in under 3 seconds. Highlighting tangible outcomes reduces bounce rates.",
          category: "conversion",
          currentValue: hero.content.subtitle,
          suggestedValue: "Experience precision performance crafted to accelerate your daily workflow with zero friction.",
          impact: "High",
        });
      }
      if (cta && cta.content.title) {
        improvements.push({
          id: `opt-conv-3`,
          sectionId: cta.id,
          sectionName: cta.name,
          field: "title",
          title: "Introduce Urgency and Exclusivity in Bottom CTA",
          rationale: "A conclusive call-to-action that creates focused momentum converts hesitant visitors.",
          category: "conversion",
          currentValue: cta.content.title,
          suggestedValue: "Ready to elevate your standards? Begin today.",
          impact: "Medium",
        });
      }
    } else if (selectedMode === "seo") {
      if (hero && hero.content.title) {
        improvements.push({
          id: `opt-seo-1`,
          sectionId: hero.id,
          sectionName: hero.name,
          field: "title",
          title: "Inject Primary Category Keywords into H1",
          rationale: "Search engine crawlers weigh the initial H1 heavily. Embedding targeted niche terms boosts keyword density.",
          category: "seo",
          currentValue: hero.content.title,
          suggestedValue: `${hero.content.title} — Premier ${project.category || "Modern Solutions"}`,
          impact: "High",
        });
      }
      if (hero && hero.content.description) {
        improvements.push({
          id: `opt-seo-2`,
          sectionId: hero.id,
          sectionName: hero.name,
          field: "description",
          title: "Enhance Search Snippet Readability in Description",
          rationale: "Natural keyword integration in secondary paragraphs ensures meta snippet alignment.",
          category: "seo",
          currentValue: hero.content.description,
          suggestedValue: `${hero.content.description.slice(0, 140)} Engineered for peak quality and sustainable growth.`,
          impact: "Medium",
        });
      }
    } else if (selectedMode === "accessibility") {
      if (hero && hero.content.badge) {
        improvements.push({
          id: `opt-a11y-1`,
          sectionId: hero.id,
          sectionName: hero.name,
          field: "badge",
          title: "Accessible Badge Semantics",
          rationale: "Brief, declarative badge tags are read cleanly by screen readers without auditory confusion.",
          category: "accessibility",
          currentValue: hero.content.badge,
          suggestedValue: "Verified Quality Certified",
          impact: "Medium",
        });
      }
      if (cta && cta.content.buttonText) {
        improvements.push({
          id: `opt-a11y-2`,
          sectionId: cta.id,
          sectionName: cta.name,
          field: "buttonText",
          title: "Descriptive Button Label for Assistive Tech",
          rationale: "WCAG 2.4.4 requires link and button text to convey their clear destination independently of context.",
          category: "accessibility",
          currentValue: cta.content.buttonText,
          suggestedValue: "Get Started With Your Custom Order",
          impact: "High",
        });
      }
    } else {
      // Content / Visual fallback
      if (hero && hero.content.description) {
        improvements.push({
          id: `opt-content-1`,
          sectionId: hero.id,
          sectionName: hero.name,
          field: "description",
          title: "Elevate Brand Narrative Depth",
          rationale: "Sensory, evocative language fosters an emotional connection with discerning modern consumers.",
          category: "content",
          currentValue: hero.content.description,
          suggestedValue: "Meticulously designed at the intersection of craft, organic purity, and effortless everyday elegance.",
          impact: "High",
        });
      }
      if (features && features.content.title) {
        improvements.push({
          id: `opt-content-2`,
          sectionId: features.id,
          sectionName: features.name,
          field: "title",
          title: "Refine Feature Section Headline",
          rationale: "Orienting feature headlines around client empowerment rather than technical specs drives engagement.",
          category: "content",
          currentValue: features.content.title,
          suggestedValue: "Engineered For Uncompromising Everyday Performance",
          impact: "Medium",
        });
      }
    }

    return NextResponse.json({
      success: true,
      isLiveAI: false,
      mode: selectedMode,
      improvements,
    });
  } catch (error: any) {
    console.error("API /api/ai/improve error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to analyze website improvements." },
      { status: 500 }
    );
  }
}
