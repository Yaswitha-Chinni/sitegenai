"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TEMPLATES_REGISTRY, TEMPLATE_CATEGORIES } from "@/lib/templates/registry";
import { projectService } from "@/lib/projects/projectService";
import { WebsiteBlueprint, BlueprintSection, WebsiteDocument } from "@/types/project";
import AssetUploader from "@/components/ui/AssetUploader";
import { UploadedAsset } from "@/types/asset";
import {
  Sparkles,
  Link as LinkIcon,
  LayoutTemplate,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Palette,
  Type,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  Download,
  Terminal,
} from "lucide-react";

type CreationMode = "prompt" | "url" | "template";

const PRESET_STYLES = [
  "Minimal",
  "Modern",
  "Editorial",
  "Elegant",
  "Bold",
  "Corporate",
  "Playful",
];

const PRESET_PALETTES = [
  { name: "Oceanic Blue (SiteGenAI)", primary: "#356DFF", secondary: "#0F172A", background: "#FFFFFF", accent: "#EFF5FF" },
  { name: "Coco Coastal (w1)", primary: "#087FE5", secondary: "#071B32", background: "#FFFFFF", accent: "#F8F5ED" },
  { name: "Emerald Vitality", primary: "#10B981", secondary: "#064E3B", background: "#FFFFFF", accent: "#ECFDF5" },
  { name: "Obsidian Luxury", primary: "#18181B", secondary: "#71717A", background: "#FAFAFA", accent: "#F4F4F5" },
  { name: "Indigo Tech", primary: "#6366F1", secondary: "#1E1B4B", background: "#FFFFFF", accent: "#EEF2FF" },
];

const PRESET_FONTS = [
  "Plus Jakarta Sans & Outfit",
  "Inter & Outfit",
  "Playfair Display & Plus Jakarta Sans",
  "Space Grotesk & Inter",
];

function CreateStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPromptQuery = searchParams.get("prompt") || "";

  // Modes
  const [activeMode, setActiveMode] = useState<CreationMode>("prompt");

  // Prompt Mode Fields
  const [promptDescription, setPromptDescription] = useState(initialPromptQuery);
  const [projectName, setProjectName] = useState("");
  const [selectedType, setSelectedType] = useState("Restaurant");
  const [selectedStyle, setSelectedStyle] = useState("Editorial");
  const [selectedPalette, setSelectedPalette] = useState(PRESET_PALETTES[1]); // Default Coco Coastal
  const [selectedFont, setSelectedFont] = useState(PRESET_FONTS[0]);
  const [promptValidationErr, setPromptValidationErr] = useState("");

  // URL Remix Fields
  const [remixUrl, setRemixUrl] = useState("");
  const [remixInstructions, setRemixInstructions] = useState("");
  const [urlValidationErr, setUrlValidationErr] = useState("");

  // Template Mode Fields
  const [selectedTemplateId, setSelectedTemplateId] = useState("w1");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState("All Templates");

  // Blueprint & Generation Workflow State
  const [currentStep, setCurrentStep] = useState<"configure" | "blueprint" | "generating" | "complete">("configure");
  const [blueprint, setBlueprint] = useState<WebsiteBlueprint | null>(null);

  // Simulated Generation Stages
  const [genStage, setGenStage] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [generatedProjectId, setGeneratedProjectId] = useState<string | null>(null);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<WebsiteDocument | null>(null);
  const [zipDownloading, setZipDownloading] = useState(false);
  const [zipSuccess, setZipSuccess] = useState<string | null>(null);

  const GEN_STAGES = [
    "Understanding the website description & intent...",
    "Preparing structural page map & semantic hierarchy...",
    "Assembling responsive component blocks & typography...",
    "Applying visual design tokens & harmonious palette...",
    "Preparing live canvas preview & editor draft...",
  ];

  useEffect(() => {
    if (initialPromptQuery) {
      setPromptDescription(initialPromptQuery);
      // Auto-extract suggested name if prompt provided
      if (!projectName) {
        setProjectName(initialPromptQuery.slice(0, 32).trim() + "...");
      }
    }
  }, [initialPromptQuery]);

  // Handle Generate action from configure step
  const handleProceedToBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeMode === "prompt") {
      if (!promptDescription.trim() || promptDescription.length < 10) {
        setPromptValidationErr("Please provide a descriptive prompt (at least 10 characters).");
        return;
      }
      setPromptValidationErr("");
      setIsPlanning(true);

      const proposedName = projectName.trim() || `${selectedType} Experience`;

      try {
        const res = await fetch("/api/ai/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptDescription,
            category: selectedType,
            style: selectedStyle,
            assets: uploadedAssets,
          }),
        });
        const data = await res.json();
        if (data.success && data.blueprint) {
          setBlueprint({
            ...data.blueprint,
            name: proposedName || data.blueprint.name,
            palette: selectedPalette,
            typography: selectedFont,
            isLiveAI: data.isLiveAI,
            modelUsed: data.modelUsed,
          });
        } else {
          throw new Error(data.error || "Plan endpoint returned error");
        }
      } catch (err) {
        // Fallback curated blueprint
        const sections: BlueprintSection[] = [
          { id: "sec-header", name: "Header & Navigation", type: "header", enabled: true, description: "Sticky brand logo, page anchors, and primary CTA." },
          { id: "sec-hero", name: "Hero Headline & Media", type: "hero", enabled: true, description: `Spotlight headline tailored for ${selectedType} audience.` },
          { id: "sec-features", name: "Key Pillars & Benefits", type: "features", enabled: true, description: "Core pillars with icons and short summaries." },
          { id: "sec-story", name: "Brand Narrative & Highlights", type: "story", enabled: true, description: "Origin story with key metrics and values." },
          { id: "sec-cta", name: "Final Call to Action", type: "cta", enabled: true, description: "Lead generation and conversion banner." },
          { id: "sec-footer", name: "Footer & Legal", type: "footer", enabled: true, description: "Multi-column links and social handles." },
        ];
        setBlueprint({
          name: proposedName,
          purpose: promptDescription,
          type: selectedType,
          style: selectedStyle,
          pages: ["Home", "About", "Services", "Contact"],
          sections,
          palette: selectedPalette,
          typography: selectedFont,
          isLiveAI: false,
        });
      } finally {
        setIsPlanning(false);
        setCurrentStep("blueprint");
      }
    } else if (activeMode === "url") {
      if (!remixUrl.trim() || !remixUrl.includes(".")) {
        setUrlValidationErr("Please enter a valid URL (e.g. https://example.com).");
        return;
      }
      setUrlValidationErr("");

      // Simulated URL analysis
      const domainName = remixUrl.replace(/(^\w+:|^)\/\//, "").split("/")[0];
      const proposedName = `${domainName} Redesign`;

      const sections: BlueprintSection[] = [
        { id: "sec-header", name: "Clean Modernized Header", type: "header", enabled: true, description: `Adapted navigation structure from ${domainName}.` },
        { id: "sec-hero", name: "Hero Showcase", type: "hero", enabled: true, description: "Refined headline typography and improved hero contrast." },
        { id: "sec-story", name: "Brand Craftsmanship & Heritage", type: "story", enabled: true, description: "Purpose-driven brand narrative." },
        { id: "sec-product", name: "Signature Offerings & Catalog", type: "product", enabled: true, description: "Optimized product/service presentation." },
        { id: "sec-features", name: "Core Capabilities Bento", type: "features", enabled: true, description: "Streamlined grid replacing cluttered legacy lists." },
        { id: "sec-testimonials", name: "Client Reviews & Social Proof", type: "testimonials", enabled: true, description: "Verified reviews and credibility badges." },
        { id: "sec-faq", name: "Frequently Asked Questions", type: "faq", enabled: true, description: "Clear answers to resolve customer hesitations." },
        { id: "sec-cta", name: "High-Conversion CTA", type: "cta", enabled: true, description: "Clear value proposition and focused signup form." },
        { id: "sec-footer", name: "Comprehensive Footer", type: "footer", enabled: true, description: "Standardized modern footer and legal directory." },
      ];

      setBlueprint({
        name: proposedName,
        purpose: `Remix design for ${remixUrl}. Instructions: ${remixInstructions || "Modernize styling and improve hierarchy."}`,
        type: "Remixed URL",
        style: "Modern",
        pages: ["Home", "Overview", "Contact"],
        sections,
        palette: PRESET_PALETTES[0],
        typography: PRESET_FONTS[0],
      });

      setCurrentStep("blueprint");
    } else if (activeMode === "template") {
      const template = TEMPLATES_REGISTRY.find((t) => t.id === selectedTemplateId) || TEMPLATES_REGISTRY[0];
      const proposedName = `${template.name} Studio Project`;

      const sections: BlueprintSection[] = template.sections.map((secName, idx) => ({
        id: `sec-${idx}`,
        name: secName,
        type: idx === 0 ? "header" : idx === 1 ? "hero" : idx === template.sections.length - 1 ? "footer" : "features",
        enabled: true,
        description: `Imported from ${template.name} template architecture.`,
      }));

      setBlueprint({
        name: proposedName,
        purpose: template.description,
        type: template.categories[0],
        style: template.style,
        pages: template.pages,
        sections,
        palette: {
          primary: template.colors.primary,
          secondary: template.colors.secondary,
          background: template.colors.background,
          accent: template.colors.accent,
        },
        typography: "Plus Jakarta Sans & Outfit",
      });

      setCurrentStep("blueprint");
    }
  };

  // Section manipulation in Blueprint
  const toggleSectionEnabled = (secId: string) => {
    if (!blueprint) return;
    setBlueprint({
      ...blueprint,
      sections: blueprint.sections.map((s) => (s.id === secId ? { ...s, enabled: !s.enabled } : s)),
    });
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!blueprint) return;
    const newSections = [...blueprint.sections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    setBlueprint({ ...blueprint, sections: newSections });
  };

  // Run Generation Sequence with Real Backend AI
  const handleApproveBlueprint = async () => {
    if (!blueprint) return;
    setCurrentStep("generating");
    setGenStage(0);
    setGenProgress(15);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < 4) {
        setGenStage(current);
        setGenProgress((current + 1) * 20);
      }
    }, 600);

    try {
      if (activeMode === "template" && selectedTemplateId === "w1") {
        clearInterval(interval);
        setGenStage(4);
        setGenProgress(100);
        const createdDoc = projectService.createFromTemplate("w1", blueprint.name);
        createdDoc.assets = uploadedAssets;
        projectService.saveProject(createdDoc);
        setGeneratedProjectId(createdDoc.id);
        setGeneratedProject(createdDoc);
        setCurrentStep("complete");
      } else {
        // Call backend API /api/ai/generate
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blueprint,
            assets: uploadedAssets,
          }),
        });
        const data = await res.json();
        clearInterval(interval);
        setGenStage(4);
        setGenProgress(100);

        let createdDoc: WebsiteDocument;
        if (data.success && data.website) {
          createdDoc = data.website;
          createdDoc.assets = uploadedAssets;
          projectService.saveProject(createdDoc);
        } else {
          createdDoc = projectService.createFromBlueprint(blueprint);
          createdDoc.assets = uploadedAssets;
          projectService.saveProject(createdDoc);
        }

        setGeneratedProjectId(createdDoc.id);
        setGeneratedProject(createdDoc);
        setCurrentStep("complete");
      }
    } catch (err) {
      clearInterval(interval);
      setGenStage(4);
      setGenProgress(100);
      const fallbackDoc = projectService.createFromBlueprint(blueprint);
      fallbackDoc.assets = uploadedAssets;
      projectService.saveProject(fallbackDoc);
      setGeneratedProjectId(fallbackDoc.id);
      setGeneratedProject(fallbackDoc);
      setCurrentStep("complete");
    }
  };

  // Filter templates for Template mode
  const filteredTemplates = TEMPLATES_REGISTRY.filter((t) => {
    const matchesCat = templateCategory === "All Templates" || t.categories.includes(templateCategory as any);
    const matchesSearch =
      !templateSearch ||
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="flex-grow-1 py-4 py-md-5">
        <div className="container">
          {/* Header */}
          <div className="text-center max-w-700 mx-auto mb-4">
            <span className="sg-badge sg-badge-primary mb-2">Interactive Creation Studio</span>
            <h1 className="display-6 fw-extrabold mb-2">Build Your Website</h1>
            <p className="text-secondary small mb-0">
              Start with a prompt, remix an existing URL, or choose a starting template.
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="d-flex justify-content-center mb-4">
            <div className="d-inline-flex align-items-center gap-2 p-1 rounded-pill bg-white border shadow-sm small">
              <span className={`badge rounded-pill ${currentStep === "configure" ? "bg-primary text-white" : "bg-light text-secondary"}`}>
                1. Mode &amp; Inputs
              </span>
              <span className="text-muted">&rarr;</span>
              <span className={`badge rounded-pill ${currentStep === "blueprint" ? "bg-primary text-white" : "bg-light text-secondary"}`}>
                2. Review Blueprint
              </span>
              <span className="text-muted">&rarr;</span>
              <span className={`badge rounded-pill ${currentStep === "generating" || currentStep === "complete" ? "bg-primary text-white" : "bg-light text-secondary"}`}>
                3. Generation &amp; Editor
              </span>
            </div>
          </div>

          {/* ======================================================================
              STEP 1: CONFIGURE MODE & INPUTS
              ====================================================================== */}
          {currentStep === "configure" && (
            <div className="row justify-content-center">
              <div className="col-12 col-lg-9 col-xl-8">
                {/* Mode Selector Tabs */}
                <div className="sg-card p-2 mb-4 bg-white shadow-sm">
                  <div className="nav nav-pills nav-fill gap-1" role="tablist">
                    <button
                      className={`nav-link py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                        activeMode === "prompt" ? "active bg-primary text-white shadow-sm" : "text-secondary"
                      }`}
                      onClick={() => setActiveMode("prompt")}
                      type="button"
                      id="tab-mode-prompt"
                    >
                      <Sparkles size={16} />
                      Start with a Prompt
                    </button>
                    <button
                      className={`nav-link py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                        activeMode === "url" ? "active bg-primary text-white shadow-sm" : "text-secondary"
                      }`}
                      onClick={() => setActiveMode("url")}
                      type="button"
                      id="tab-mode-url"
                    >
                      <LinkIcon size={16} />
                      Remix a URL
                    </button>
                    <button
                      className={`nav-link py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                        activeMode === "template" ? "active bg-primary text-white shadow-sm" : "text-secondary"
                      }`}
                      onClick={() => setActiveMode("template")}
                      type="button"
                      id="tab-mode-template"
                    >
                      <LayoutTemplate size={16} />
                      Start from a Template
                    </button>
                  </div>
                </div>

                {/* MODE 1: PROMPT */}
                {activeMode === "prompt" && (
                  <form onSubmit={handleProceedToBlueprint} className="sg-card p-4 p-md-5 bg-white shadow-md">
                    <div className="mb-4">
                      <label htmlFor="prompt-desc" className="sg-form-label d-flex justify-content-between">
                        <span>Website Description *</span>
                        <span className="text-muted fw-normal small">{promptDescription.length} / 500 chars</span>
                      </label>
                      <textarea
                        id="prompt-desc"
                        rows={4}
                        className="sg-form-control w-100"
                        placeholder="Describe your brand, services, desired sections, and target audience..."
                        value={promptDescription}
                        onChange={(e) => {
                          setPromptDescription(e.target.value);
                          if (promptValidationErr) setPromptValidationErr("");
                        }}
                        maxLength={500}
                        required
                      />
                      {promptValidationErr && (
                        <div className="text-danger small mt-1 fw-medium">{promptValidationErr}</div>
                      )}
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-6">
                        <label htmlFor="project-name-input" className="sg-form-label">Project Name (Optional)</label>
                        <input
                          id="project-name-input"
                          type="text"
                          className="sg-form-control w-100"
                          placeholder="e.g., COCO POUR Brand Experience"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="website-type-select" className="sg-form-label">Website Type</label>
                        <select
                          id="website-type-select"
                          className="sg-form-control w-100 form-select"
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                        >
                          {TEMPLATE_CATEGORIES.filter((c) => c !== "All Templates").map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-6">
                        <label htmlFor="visual-style-select" className="sg-form-label">Visual Style</label>
                        <select
                          id="visual-style-select"
                          className="sg-form-control w-100 form-select"
                          value={selectedStyle}
                          onChange={(e) => setSelectedStyle(e.target.value)}
                        >
                          {PRESET_STYLES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="typography-select" className="sg-form-label">Typography Pairing</label>
                        <select
                          id="typography-select"
                          className="sg-form-control w-100 form-select"
                          value={selectedFont}
                          onChange={(e) => setSelectedFont(e.target.value)}
                        >
                          {PRESET_FONTS.map((font) => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="sg-form-label d-block mb-2">Color Palette Preference</label>
                      <div className="row g-2">
                        {PRESET_PALETTES.map((pal, idx) => {
                          const isSelected = selectedPalette.name === pal.name;
                          return (
                            <div key={idx} className="col-12 col-sm-6">
                              <div
                                onClick={() => setSelectedPalette(pal)}
                                className={`p-2 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${
                                  isSelected ? "border-primary bg-primary-subtle shadow-sm" : "bg-light"
                                }`}
                                style={{ cursor: "pointer" }}
                              >
                                <span className="small fw-semibold text-truncate">{pal.name}</span>
                                <div className="d-flex align-items-center gap-1">
                                  <span className="rounded-circle border" style={{ width: 14, height: 14, backgroundColor: pal.primary }}></span>
                                  <span className="rounded-circle border" style={{ width: 14, height: 14, backgroundColor: pal.secondary }}></span>
                                  <span className="rounded-circle border" style={{ width: 14, height: 14, backgroundColor: pal.accent }}></span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Brand Assets Upload (Logo, Product, Brand, Video) */}
                    <div className="mb-4 p-3 rounded-4 border bg-light">
                      <div className="mb-2">
                        <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
                          <Sparkles size={16} className="text-primary" />
                          Brand &amp; Media Assets (Optional)
                        </h6>
                        <p className="small text-secondary mb-0">
                          Upload your logo, product photography, brand images, or reference videos. They will be integrated directly into your website sections.
                        </p>
                      </div>
                      <AssetUploader assets={uploadedAssets} onAssetsChange={setUploadedAssets} />
                    </div>

                    <div className="d-flex justify-content-end pt-3 border-top">
                      <button
                        type="submit"
                        className="btn btn-sg-primary btn-sg-lg d-flex align-items-center gap-2"
                        disabled={isPlanning}
                        id="btn-proceed-blueprint"
                      >
                        {isPlanning ? (
                          <>
                            <RefreshCw size={18} className="spin" />
                            Synthesizing Blueprint with AI...
                          </>
                        ) : (
                          <>
                            Generate Website Blueprint
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* MODE 2: URL REMIX */}
                {activeMode === "url" && (
                  <form onSubmit={handleProceedToBlueprint} className="sg-card p-4 p-md-5 bg-white shadow-md">
                    <div className="p-3 mb-4 rounded-3 border bg-warning-subtle text-dark small d-flex align-items-center gap-2">
                      <AlertCircle size={18} className="text-warning flex-shrink-0" />
                      <div>
                        <strong>Phase 1 Simulated Workflow:</strong> No external website scraping occurs in the browser. A structural modernization blueprint will be generated based on your input URL and instructions.
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="remix-url-input" className="sg-form-label">Website URL to Remix *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">
                          <LinkIcon size={16} />
                        </span>
                        <input
                          id="remix-url-input"
                          type="text"
                          className="form-control sg-form-control"
                          placeholder="https://example.com/brand"
                          value={remixUrl}
                          onChange={(e) => {
                            setRemixUrl(e.target.value);
                            if (urlValidationErr) setUrlValidationErr("");
                          }}
                          required
                        />
                      </div>
                      {urlValidationErr && <div className="text-danger small mt-1">{urlValidationErr}</div>}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="remix-instructions" className="sg-form-label">Design Change Instructions</label>
                      <textarea
                        id="remix-instructions"
                        rows={3}
                        className="sg-form-control w-100"
                        placeholder="e.g., Make it look like a high-end luxury editorial, simplify the hero headline, and introduce a modern video loop section..."
                        value={remixInstructions}
                        onChange={(e) => setRemixInstructions(e.target.value)}
                      />
                    </div>

                    <div className="d-flex justify-content-end pt-3 border-top">
                      <button type="submit" className="btn btn-sg-primary btn-sg-lg" id="btn-remix-blueprint">
                        Generate Remix Blueprint
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </form>
                )}

                {/* MODE 3: TEMPLATE */}
                {activeMode === "template" && (
                  <div className="sg-card p-4 bg-white shadow-md">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                      <div>
                        <h5 className="fw-bold mb-1">Select a Template Starting Point</h5>
                        <p className="small text-secondary mb-0">Choose from registered templates, including COCO POUR (w1).</p>
                      </div>
                      <input
                        type="text"
                        className="sg-form-control"
                        placeholder="Search templates..."
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        style={{ maxWidth: 220 }}
                      />
                    </div>

                    {/* Category filter */}
                    <div className="d-flex gap-2 overflow-x-auto pb-2 mb-4">
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`btn btn-sm text-nowrap ${
                            templateCategory === cat ? "btn-primary" : "btn-light border text-secondary"
                          }`}
                          onClick={() => setTemplateCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Template Cards Grid */}
                    <div className="row g-3 mb-4">
                      {filteredTemplates.map((tmpl) => {
                        const isSelected = selectedTemplateId === tmpl.id;
                        return (
                          <div key={tmpl.id} className="col-12 col-md-6">
                            <div
                              onClick={() => setSelectedTemplateId(tmpl.id)}
                              className={`sg-card p-3 h-100 cursor-pointer transition-all ${
                                isSelected ? "border-primary shadow-md" : "border"
                              }`}
                              style={{
                                cursor: "pointer",
                                border: isSelected ? "2px solid var(--sg-primary)" : "1px solid var(--sg-border)",
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="badge bg-primary-subtle text-primary small">
                                  {tmpl.categories[0]}
                                </span>
                                {tmpl.id === "w1" && (
                                  <span className="badge bg-success-subtle text-success small">
                                    Integrated w1
                                  </span>
                                )}
                              </div>
                              <h6 className="fw-bold mb-1">{tmpl.name}</h6>
                              <p className="small text-secondary mb-3" style={{ minHeight: "38px" }}>
                                {tmpl.description.slice(0, 95)}...
                              </p>
                              <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                                <span className="small text-muted">{tmpl.style}</span>
                                <div className="form-check m-0">
                                  <input
                                    type="radio"
                                    className="form-check-input"
                                    name="templateSelectRadio"
                                    checked={isSelected}
                                    onChange={() => setSelectedTemplateId(tmpl.id)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="d-flex justify-content-end pt-3 border-top">
                      <button
                        type="button"
                        onClick={handleProceedToBlueprint}
                        className="btn btn-sg-primary btn-sg-lg"
                        id="btn-template-blueprint"
                      >
                        Continue with Selected Template
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================================
              STEP 2: WEBSITE BLUEPRINT REVIEW & EDIT
              ====================================================================== */}
          {currentStep === "blueprint" && blueprint && (
            <div className="row justify-content-center">
              <div className="col-12 col-lg-10 col-xl-9">
                <div className="sg-card p-4 p-md-5 bg-white shadow-md mb-4">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 pb-3 border-bottom">
                    <div>
                      <span className="sg-badge sg-badge-primary mb-2">Proposed Architecture</span>
                      <h3 className="fw-bold mb-1">Review Your Website Blueprint</h3>
                      <p className="small text-secondary mb-0">
                        Customize sections, color tokens, and pages before generating the interactive draft.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sg-outline btn-sg-sm d-flex align-items-center gap-1"
                      onClick={() => setCurrentStep("configure")}
                    >
                      &larr; Back to Inputs
                    </button>
                  </div>

                  {/* Blueprint Metadata Fields */}
                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <label htmlFor="blueprint-name-input" className="sg-form-label">Website Name</label>
                      <input
                        id="blueprint-name-input"
                        type="text"
                        className="sg-form-control w-100"
                        value={blueprint.name}
                        onChange={(e) => setBlueprint({ ...blueprint, name: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label htmlFor="blueprint-style-input" className="sg-form-label">Visual Style &amp; Category</label>
                      <input
                        id="blueprint-style-input"
                        type="text"
                        className="sg-form-control w-100"
                        value={`${blueprint.type} &bull; ${blueprint.style}`}
                        disabled
                      />
                    </div>
                  </div>

                  {/* Ordered Sections Manager */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="sg-form-label mb-0">
                        Proposed Sections ({blueprint.sections.filter((s) => s.enabled).length} Enabled)
                      </label>
                      <small className="text-muted">Use arrows to reorder, checkboxes to toggle</small>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {blueprint.sections.map((sec, idx) => (
                        <div
                          key={sec.id}
                          className={`p-3 rounded-3 border d-flex align-items-center justify-content-between gap-3 ${
                            sec.enabled ? "bg-white shadow-sm" : "bg-light opacity-50"
                          }`}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <input
                              type="checkbox"
                              className="form-check-input mt-0"
                              checked={sec.enabled}
                              onChange={() => toggleSectionEnabled(sec.id)}
                              id={`check-${sec.id}`}
                            />
                            <div>
                              <div className="fw-semibold small d-flex align-items-center gap-2">
                                <span>{sec.name}</span>
                                <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: "0.7rem" }}>
                                  {sec.type}
                                </span>
                              </div>
                              <small className="text-secondary d-none d-md-block">{sec.description}</small>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              className="btn btn-light btn-sm p-1 border"
                              disabled={idx === 0}
                              onClick={() => moveSection(idx, "up")}
                              title="Move section up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-light btn-sm p-1 border"
                              disabled={idx === blueprint.sections.length - 1}
                              onClick={() => moveSection(idx, "down")}
                              title="Move section down"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="small text-muted">
                      Blueprint is ready for simulated synthesis
                    </span>
                    <button
                      type="button"
                      className="btn btn-sg-primary btn-sg-lg"
                      onClick={handleApproveBlueprint}
                      id="btn-approve-blueprint"
                    >
                      <Sparkles size={18} />
                      Approve Blueprint &amp; Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================
              STEP 3: SIMULATED DEMO GENERATION
              ====================================================================== */}
          {currentStep === "generating" && (
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-6 text-center">
                <div className="sg-card p-5 bg-white shadow-lg">
                  <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-4 animate-spin">
                    <RefreshCw size={36} />
                  </div>

                  <span className="sg-badge sg-badge-primary mb-2">Simulated Demo Generation</span>
                  <h3 className="fw-bold mb-3">Synthesizing Your Website</h3>
                  <p className="text-secondary small mb-4">
                    {GEN_STAGES[genStage]}
                  </p>

                  {/* Progress Bar */}
                  <div className="progress mb-4" style={{ height: "8px" }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                      role="progressbar"
                      style={{ width: `${genProgress}%` }}
                      aria-valuenow={genProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>

                  {/* Checklist of stages */}
                  <div className="text-start bg-light p-3 rounded-3 border">
                    {GEN_STAGES.map((label, idx) => {
                      const isDone = idx < genStage;
                      const isCurrent = idx === genStage;
                      return (
                        <div key={idx} className="d-flex align-items-center gap-2 py-1 small">
                          {isDone ? (
                            <CheckCircle2 size={16} className="text-success" />
                          ) : isCurrent ? (
                            <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                          ) : (
                            <span className="rounded-circle border" style={{ width: 14, height: 14 }}></span>
                          )}
                          <span className={isDone ? "text-dark fw-medium" : isCurrent ? "text-primary fw-bold" : "text-muted"}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================
              STEP 4: GENERATION COMPLETE
              ====================================================================== */}
          {currentStep === "complete" && generatedProjectId && (
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-7 text-center">
                <div className="sg-card p-4 p-md-5 bg-white shadow-lg">
                  <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
                    <CheckCircle2 size={40} />
                  </div>

                  {blueprint?.isLiveAI ? (
                    <div>
                      <span className="badge bg-primary-subtle text-primary mb-2 px-3 py-2 rounded-pill small d-inline-flex align-items-center gap-1">
                        <Sparkles size={14} />
                        Synthesized Live with {blueprint.modelUsed || "Gemini 3.8 Flash"}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="badge bg-secondary-subtle text-secondary mb-2 px-3 py-2 rounded-pill small d-inline-flex align-items-center gap-1">
                        <Sparkles size={14} />
                        Synthesized with Curated Synthesis Engine
                      </span>
                    </div>
                  )}

                  <h3 className="fw-bold mb-2">Website Draft Ready!</h3>
                  <p className="text-secondary small mb-4">
                    Your website structure, theme tokens, and semantic sections have been synthesized into your local workspace.
                  </p>

                  {/* Actions Row */}
                  <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                    <Link href={`/editor/${generatedProjectId}`} className="btn btn-sg-primary btn-sg-lg d-flex align-items-center gap-2" id="btn-open-generated-editor">
                      Open in Visual Editor
                      <ArrowRight size={18} />
                    </Link>

                    <button
                      type="button"
                      className="btn btn-sg-outline btn-sg-lg d-flex align-items-center gap-2"
                      disabled={zipDownloading}
                      onClick={async () => {
                        const project = generatedProject || projectService.getProjectById(generatedProjectId);
                        if (!project) return;
                        setZipDownloading(true);
                        setZipSuccess(null);
                        const res = await projectService.downloadProjectZip(project);
                        setZipDownloading(false);
                        if (res.success) {
                          setZipSuccess("Standalone ZIP archive downloaded successfully!");
                        }
                      }}
                    >
                      <Download size={18} />
                      {zipDownloading ? "Building ZIP..." : "Download ZIP Package"}
                    </button>
                  </div>

                  {zipSuccess && (
                    <div className="alert alert-success py-2 px-3 small rounded-3 mb-4">
                      {zipSuccess}
                    </div>
                  )}

                  {/* Quick Local Run Helper */}
                  <div className="p-3 rounded-3 border bg-light text-start small">
                    <div className="fw-bold mb-1 d-flex align-items-center gap-2 text-dark">
                      <Terminal size={15} className="text-primary" />
                      Run Standalone Website Locally
                    </div>
                    <p className="text-secondary mb-2" style={{ fontSize: "0.78rem" }}>
                      Extract your downloaded ZIP archive and launch with Node.js or Python:
                    </p>
                    <pre className="p-2 bg-dark text-success rounded-2 mb-0" style={{ fontSize: "0.76rem" }}>
                      <code>npx -y serve -p 3000 .</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CreateStudioPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center">Loading studio...</div>}>
      <CreateStudioContent />
    </Suspense>
  );
}
