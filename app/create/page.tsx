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
  { name: "Emerald & Dark Charcoal", primary: "#A3FF6F", secondary: "#10141C", background: "#0B0D12", accent: "#202938" },
  { name: "Violet Creative", primary: "#8B7CFF", secondary: "#151A24", background: "#0B0D12", accent: "#303947" },
  { name: "Cyan Tech", primary: "#36D9F5", secondary: "#0E1726", background: "#0B0D12", accent: "#1E293B" },
  { name: "Coco Coastal (w1)", primary: "#087FE5", secondary: "#071B32", background: "#FFFFFF", accent: "#F8F5ED" },
  { name: "Obsidian Luxury", primary: "#FFFFFF", secondary: "#27272A", background: "#0B0D12", accent: "#18181B" },
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
  const [selectedPalette, setSelectedPalette] = useState(PRESET_PALETTES[0]); // Default Emerald & Dark Charcoal
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
  const [planningStageText, setPlanningStageText] = useState("Understanding your idea...");
  const [generatedProject, setGeneratedProject] = useState<WebsiteDocument | null>(null);
  const [zipDownloading, setZipDownloading] = useState(false);
  const [zipSuccess, setZipSuccess] = useState<string | null>(null);

  const GEN_STAGES = [
    "Understanding the website description & prompt intent...",
    "Querying stock photography and assembling image plan...",
    "Preparing structural page map & semantic hierarchy...",
    "Assembling responsive component blocks & typography...",
    "Applying visual design tokens & harmonious palette...",
    "Preparing live canvas preview & editor draft...",
  ];

  useEffect(() => {
    if (initialPromptQuery) {
      setPromptDescription(initialPromptQuery);
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
      setPlanningStageText("Understanding your idea...");

      const stageMessages = [
        "Understanding your idea...",
        "Planning your website sections...",
        "Finding suitable photographs with Pexels & Unsplash...",
        "Preparing your visual storyboard...",
      ];
      let msgIndex = 0;
      const progressTimer = setInterval(() => {
        msgIndex = (msgIndex + 1) % stageMessages.length;
        setPlanningStageText(stageMessages[msgIndex]);
      }, 1500);

      try {
        const res = await fetch("/api/storyboard/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptDescription,
            category: selectedType,
            style: selectedStyle,
            palette: selectedPalette,
          }),
        });

        clearInterval(progressTimer);
        const data = await res.json();

        if (data.success && data.storyboard) {
          router.push(`/storyboard/${data.storyboard.id}`);
          return;
        } else {
          throw new Error(data.error || "Failed to generate storyboard");
        }
      } catch (err: any) {
        clearInterval(progressTimer);
        console.warn("Storyboard planning error:", err);
        setPromptValidationErr(err.message || "Failed to generate storyboard. Please try again.");
      } finally {
        setIsPlanning(false);
      }
    }
    
    if (activeMode === "url") {
      if (!remixUrl.trim()) {
        setUrlValidationErr("Please enter a valid website URL.");
        return;
      }
      setUrlValidationErr("");

      const proposedName = `Remix: ${remixUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}`;
      const sections: BlueprintSection[] = [
        { id: "sec-header", name: "Navigation Header", type: "header", enabled: true, description: "Clean sticky header with brand mark and action button." },
        { id: "sec-hero", name: "Hero Value Proposition", type: "hero", enabled: true, description: "Modernized hero banner with stock photography." },
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
        palette: selectedPalette,
        typography: selectedFont,
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
      if (current < 5) {
        setGenStage(current);
        setGenProgress((current + 1) * 18);
      }
    }, 600);

    try {
      if (activeMode === "template" && selectedTemplateId === "w1") {
        clearInterval(interval);
        setGenStage(5);
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

        clearInterval(interval);
        setGenStage(5);
        setGenProgress(100);

        const data = await res.json();
        if (data.success && data.project) {
          const projectToSave: WebsiteDocument = {
            ...data.project,
            assets: uploadedAssets,
          };
          projectService.saveProject(projectToSave);
          setGeneratedProjectId(projectToSave.id);
          setGeneratedProject(projectToSave);
          setCurrentStep("complete");
        } else {
          throw new Error(data.error || "Generation endpoint did not return valid project");
        }
      }
    } catch (err) {
      console.warn("Backend generate error, assembling local project:", err);
      clearInterval(interval);
      setGenStage(5);
      setGenProgress(100);

      const localProject = projectService.createFromBlueprint(blueprint);
      localProject.assets = uploadedAssets;
      projectService.saveProject(localProject);
      setGeneratedProjectId(localProject.id);
      setGeneratedProject(localProject);
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
    <div className="d-flex flex-column min-vh-100 position-relative" style={{ backgroundColor: "#0B0D12", color: "#F1F5F9" }}>
      <Navbar />

      <main className="flex-grow-1 py-4 py-md-5 position-relative">
        {/* Subtle ambient background glow */}
        <div className="sb-glow-blob-emerald top-0 start-0 opacity-25" />
        <div className="sb-glow-blob-violet bottom-0 end-0 opacity-20" />

        <div className="container position-relative" style={{ zIndex: 2 }}>
          {/* Header */}
          <div className="text-center max-w-700 mx-auto mb-4">
            <span
              className="badge rounded-pill mb-2 px-3 py-1.5 fw-semibold"
              style={{
                backgroundColor: "rgba(163, 255, 111, 0.15)",
                border: "1px solid rgba(163, 255, 111, 0.35)",
                color: "#A3FF6F",
              }}
            >
              Interactive Creation Studio
            </span>
            <h1 className="display-6 fw-extrabold text-white mb-2">
              Build Your Website with <span className="sb-text-emerald">AI Discovery</span>
            </h1>
            <p className="small mb-0" style={{ color: "#D1D5DB" }}>
              Start with a prompt, remix an existing URL, or choose a starting template.
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="d-flex justify-content-center mb-4">
            <div
              className="d-inline-flex align-items-center gap-2 p-1.5 rounded-pill border small"
              style={{
                backgroundColor: "#151A24",
                borderColor: "#303947",
              }}
            >
              <span
                className={`badge rounded-pill px-3 py-1.5 ${
                  currentStep === "configure" ? "sb-btn-primary fw-bold" : "text-white"
                }`}
                style={currentStep !== "configure" ? { color: "#BFC7D2" } : {}}
              >
                1. Mode &amp; Inputs
              </span>
              <span style={{ color: "#BFC7D2" }}>&rarr;</span>
              <span
                className={`badge rounded-pill px-3 py-1.5 ${
                  currentStep === "blueprint" ? "sb-btn-primary fw-bold" : "text-white"
                }`}
                style={currentStep !== "blueprint" ? { color: "#BFC7D2" } : {}}
              >
                2. Review Blueprint
              </span>
              <span style={{ color: "#BFC7D2" }}>&rarr;</span>
              <span
                className={`badge rounded-pill px-3 py-1.5 ${
                  currentStep === "generating" || currentStep === "complete" ? "sb-btn-primary fw-bold" : "text-white"
                }`}
                style={currentStep !== "generating" && currentStep !== "complete" ? { color: "#BFC7D2" } : {}}
              >
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
                <div className="p-2 mb-4 rounded-3 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div className="nav nav-pills nav-fill gap-1" role="tablist">
                    <button
                      className={`sb-filter-pill py-2 d-flex align-items-center justify-content-center gap-2 ${
                        activeMode === "prompt" ? "active" : ""
                      }`}
                      onClick={() => setActiveMode("prompt")}
                      type="button"
                      id="tab-mode-prompt"
                    >
                      <Sparkles size={16} />
                      Start with a Prompt
                    </button>
                    <button
                      className={`sb-filter-pill py-2 d-flex align-items-center justify-content-center gap-2 ${
                        activeMode === "url" ? "active" : ""
                      }`}
                      onClick={() => setActiveMode("url")}
                      type="button"
                      id="tab-mode-url"
                    >
                      <LinkIcon size={16} />
                      Remix a URL
                    </button>
                    <button
                      className={`sb-filter-pill py-2 d-flex align-items-center justify-content-center gap-2 ${
                        activeMode === "template" ? "active" : ""
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
                  <form onSubmit={handleProceedToBlueprint} className="p-4 p-md-5 rounded-4 border shadow-md" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                    <div className="mb-4">
                      <label htmlFor="prompt-desc" className="d-flex justify-content-between text-white fw-semibold small mb-2">
                        <span>Website Description &amp; Vision *</span>
                        <span className="fw-normal" style={{ color: "#BFC7D2" }}>{promptDescription.length} / 500 chars</span>
                      </label>
                      <div
                        className="rounded-3 p-2"
                        style={{
                          backgroundColor: "#10141C",
                          border: "1px solid #303947",
                        }}
                      >
                        <textarea
                          id="prompt-desc"
                          rows={4}
                          className="form-control bg-transparent border-0 text-white shadow-none"
                          placeholder="Describe your brand, services, desired sections, and target audience. E.g. A modern artisanal coffee roastery with cozy aesthetics and online subscription..."
                          value={promptDescription}
                          onChange={(e) => {
                            setPromptDescription(e.target.value);
                            if (promptValidationErr) setPromptValidationErr("");
                          }}
                          maxLength={500}
                          required
                          style={{ outline: "none", resize: "vertical" }}
                        />
                      </div>
                      {promptValidationErr && (
                        <div className="text-danger small mt-1 fw-medium">{promptValidationErr}</div>
                      )}
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-6">
                        <label htmlFor="project-name-input" className="text-white fw-semibold small mb-2 d-block">
                          Project Name (Optional)
                        </label>
                        <input
                          id="project-name-input"
                          type="text"
                          className="form-control rounded-pill text-white px-3 py-2"
                          placeholder="e.g., COCO POUR Brand Experience"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          style={{
                            backgroundColor: "#10141C",
                            borderColor: "#303947",
                          }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="website-type-select" className="text-white fw-semibold small mb-2 d-block">
                          Website Type
                        </label>
                        <select
                          id="website-type-select"
                          className="form-select rounded-pill text-white px-3 py-2"
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          style={{
                            backgroundColor: "#10141C",
                            borderColor: "#303947",
                          }}
                        >
                          {TEMPLATE_CATEGORIES.filter((c) => c !== "All Templates").map((cat) => (
                            <option key={cat} value={cat} className="bg-dark text-white">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-6">
                        <label htmlFor="visual-style-select" className="text-white fw-semibold small mb-2 d-block">
                          Visual Style
                        </label>
                        <select
                          id="visual-style-select"
                          className="form-select rounded-pill text-white px-3 py-2"
                          value={selectedStyle}
                          onChange={(e) => setSelectedStyle(e.target.value)}
                          style={{
                            backgroundColor: "#10141C",
                            borderColor: "#303947",
                          }}
                        >
                          {PRESET_STYLES.map((st) => (
                            <option key={st} value={st} className="bg-dark text-white">
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="typography-select" className="text-white fw-semibold small mb-2 d-block">
                          Typography Pairing
                        </label>
                        <select
                          id="typography-select"
                          className="form-select rounded-pill text-white px-3 py-2"
                          value={selectedFont}
                          onChange={(e) => setSelectedFont(e.target.value)}
                          style={{
                            backgroundColor: "#10141C",
                            borderColor: "#303947",
                          }}
                        >
                          {PRESET_FONTS.map((font) => (
                            <option key={font} value={font} className="bg-dark text-white">
                              {font}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-white fw-semibold small mb-2 d-block">
                        Color Palette Preference
                      </label>
                      <div className="row g-2">
                        {PRESET_PALETTES.map((pal, idx) => {
                          const isSelected = selectedPalette.name === pal.name;
                          return (
                            <div key={idx} className="col-12 col-sm-6">
                              <div
                                onClick={() => setSelectedPalette(pal)}
                                className="p-2.5 rounded-3 d-flex align-items-center justify-content-between cursor-pointer transition-all border"
                                style={{
                                  cursor: "pointer",
                                  backgroundColor: isSelected ? "rgba(163, 255, 111, 0.12)" : "#10141C",
                                  borderColor: isSelected ? "#A3FF6F" : "#303947",
                                }}
                              >
                                <span className="small fw-semibold text-truncate text-white">{pal.name}</span>
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
                    <div
                      className="mb-4 p-3 rounded-4 border"
                      style={{
                        backgroundColor: "#10141C",
                        borderColor: "#303947",
                      }}
                    >
                      <div className="mb-2">
                        <h6 className="fw-bold mb-1 text-white d-flex align-items-center gap-2">
                          <Sparkles size={16} className="sb-text-emerald" />
                          Brand &amp; Media Assets (Optional)
                        </h6>
                        <p className="small mb-0" style={{ color: "#D1D5DB" }}>
                          Upload your logo, product photography, brand images, or reference videos. They will be integrated directly into your website sections alongside stock photography.
                        </p>
                      </div>
                      <AssetUploader assets={uploadedAssets} onAssetsChange={setUploadedAssets} />
                    </div>

                    <div
                      className="d-flex justify-content-end pt-3 border-top"
                      style={{ borderColor: "#303947" }}
                    >
                      <button
                        type="submit"
                        className="sb-btn-primary py-2.5 px-4 d-flex align-items-center gap-2 btn-magnetic"
                        disabled={isPlanning}
                        id="btn-proceed-blueprint"
                      >
                        {isPlanning ? (
                          <>
                            <RefreshCw size={18} className="spin" />
                            {planningStageText}
                          </>
                        ) : (
                          <>
                            Generate Storyboard
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* MODE 2: URL REMIX */}
                {activeMode === "url" && (
                  <form onSubmit={handleProceedToBlueprint} className="p-4 p-md-5 rounded-4 border shadow-md" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                    <div
                      className="p-3 mb-4 rounded-3 border small d-flex align-items-center gap-2 text-white"
                      style={{
                        backgroundColor: "rgba(245, 158, 11, 0.12)",
                        borderColor: "rgba(245, 158, 11, 0.35)",
                      }}
                    >
                      <AlertCircle size={18} className="sb-text-gold flex-shrink-0" />
                      <div>
                        <strong>Modernization Blueprint Mode:</strong> A structural modernization blueprint and photo plan will be generated based on your input URL and instructions.
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="remix-url-input" className="text-white fw-semibold small mb-2 d-block">
                        Website URL to Remix *
                      </label>
                      <div
                        className="d-flex align-items-center px-3 py-1.5 rounded-pill"
                        style={{
                          backgroundColor: "#10141C",
                          border: "1px solid #303947",
                        }}
                      >
                        <LinkIcon size={16} className="me-2 flex-shrink-0" style={{ color: "#BFC7D2" }} />
                        <input
                          id="remix-url-input"
                          type="text"
                          className="form-control bg-transparent border-0 text-white p-0 shadow-none small"
                          placeholder="https://example.com/brand"
                          value={remixUrl}
                          onChange={(e) => {
                            setRemixUrl(e.target.value);
                            if (urlValidationErr) setUrlValidationErr("");
                          }}
                          required
                          style={{ outline: "none" }}
                        />
                      </div>
                      {urlValidationErr && <div className="text-danger small mt-1">{urlValidationErr}</div>}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="remix-instructions" className="text-white fw-semibold small mb-2 d-block">
                        Design Change Instructions
                      </label>
                      <div
                        className="rounded-3 p-2"
                        style={{
                          backgroundColor: "#10141C",
                          border: "1px solid #303947",
                        }}
                      >
                        <textarea
                          id="remix-instructions"
                          rows={3}
                          className="form-control bg-transparent border-0 text-white shadow-none"
                          placeholder="e.g., Make it look like a high-end luxury editorial, simplify the hero headline, and introduce modern photography sections..."
                          value={remixInstructions}
                          onChange={(e) => setRemixInstructions(e.target.value)}
                          style={{ outline: "none", resize: "vertical" }}
                        />
                      </div>
                    </div>

                    <div
                      className="d-flex justify-content-end pt-3 border-top"
                      style={{ borderColor: "#303947" }}
                    >
                      <button type="submit" className="sb-btn-primary py-2.5 px-4 btn-magnetic" id="btn-remix-blueprint">
                        Generate Remix Blueprint
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </form>
                )}

                {/* MODE 3: TEMPLATE */}
                {activeMode === "template" && (
                  <div className="p-4 rounded-4 border shadow-md" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                      <div>
                        <h5 className="fw-bold text-white mb-1">Select a Template Starting Point</h5>
                        <p className="small mb-0" style={{ color: "#D1D5DB" }}>Choose from registered templates, including COCO POUR (w1).</p>
                      </div>
                      <input
                        type="text"
                        className="form-control rounded-pill text-white px-3 py-1.5 small"
                        placeholder="Search templates..."
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        style={{
                          maxWidth: 220,
                          backgroundColor: "#10141C",
                          borderColor: "#303947",
                        }}
                      />
                    </div>

                    {/* Category filter */}
                    <div className="d-flex gap-2 overflow-x-auto pb-2 mb-4">
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`sb-filter-pill py-1.5 px-3 small ${
                            templateCategory === cat ? "active" : ""
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
                              className="p-3 rounded-4 h-100 cursor-pointer transition-all border card-3d-tilt"
                              style={{
                                cursor: "pointer",
                                backgroundColor: isSelected ? "rgba(163, 255, 111, 0.12)" : "#10141C",
                                borderColor: isSelected ? "#A3FF6F" : "#303947",
                                boxShadow: isSelected ? "0 0 20px rgba(163, 255, 111, 0.25)" : "none",
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <span
                                  className="badge rounded-pill small fw-semibold"
                                  style={{
                                    backgroundColor: "rgba(163, 255, 111, 0.15)",
                                    border: "1px solid rgba(163, 255, 111, 0.35)",
                                    color: "#A3FF6F",
                                  }}
                                >
                                  {tmpl.categories[0]}
                                </span>
                                {tmpl.id === "w1" && (
                                  <span className="badge bg-success text-white small fw-bold">
                                    Integrated w1
                                  </span>
                                )}
                              </div>
                              <h6 className="fw-bold text-white mb-1">{tmpl.name}</h6>
                              <p className="small mb-3" style={{ minHeight: "38px", color: "#D1D5DB" }}>
                                {tmpl.description.slice(0, 95)}...
                              </p>
                              <div
                                className="d-flex justify-content-between align-items-center pt-2 border-top"
                                style={{ borderColor: "#303947" }}
                              >
                                <span className="small fw-semibold" style={{ color: "#BFC7D2" }}>{tmpl.style}</span>
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

                    <div
                      className="d-flex justify-content-end pt-3 border-top"
                      style={{ borderColor: "#303947" }}
                    >
                      <button
                        type="button"
                        onClick={handleProceedToBlueprint}
                        className="sb-btn-primary py-2.5 px-4 btn-magnetic"
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
                <div className="p-4 p-md-5 mb-4 rounded-4 border shadow-md" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div
                    className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 pb-3 border-bottom"
                    style={{ borderColor: "#303947" }}
                  >
                    <div>
                      <span
                        className="badge rounded-pill mb-2 px-3 py-1.5 fw-semibold"
                        style={{
                          backgroundColor: "rgba(163, 255, 111, 0.15)",
                          border: "1px solid rgba(163, 255, 111, 0.35)",
                          color: "#A3FF6F",
                        }}
                      >
                        Proposed Architecture
                      </span>
                      <h3 className="fw-bold text-white mb-1">Review Your Website Blueprint</h3>
                      <p className="small mb-0" style={{ color: "#D1D5DB" }}>
                        Customize sections, color tokens, and stock photo planning before generating the interactive draft.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="sb-btn-outline btn-sm py-1.5 px-3 d-flex align-items-center gap-1"
                      onClick={() => setCurrentStep("configure")}
                    >
                      &larr; Back to Inputs
                    </button>
                  </div>

                  {/* Blueprint Metadata Fields */}
                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <label htmlFor="blueprint-name-input" className="text-white fw-semibold small mb-2 d-block">
                        Website Name
                      </label>
                      <input
                        id="blueprint-name-input"
                        type="text"
                        className="form-control rounded-pill text-white px-3 py-2"
                        value={blueprint.name}
                        onChange={(e) => setBlueprint({ ...blueprint, name: e.target.value })}
                        style={{
                          backgroundColor: "#10141C",
                          borderColor: "#303947",
                        }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label htmlFor="blueprint-style-input" className="text-white fw-semibold small mb-2 d-block">
                        Visual Style &amp; Category
                      </label>
                      <input
                        id="blueprint-style-input"
                        type="text"
                        className="form-control rounded-pill px-3 py-2"
                        value={`${blueprint.type} • ${blueprint.style}`}
                        disabled
                        style={{
                          backgroundColor: "#10141C",
                          borderColor: "#303947",
                          color: "#BFC7D2",
                        }}
                      />
                    </div>
                  </div>

                  {/* Ordered Sections Manager */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="text-white fw-semibold small mb-0">
                        Proposed Sections ({blueprint.sections.filter((s) => s.enabled).length} Enabled)
                      </label>
                      <small style={{ color: "#BFC7D2" }}>Use arrows to reorder, checkboxes to toggle</small>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {blueprint.sections.map((sec, idx) => (
                        <div
                          key={sec.id}
                          className={`p-3 rounded-3 border d-flex align-items-center justify-content-between gap-3 ${
                            sec.enabled ? "bg-opacity-10" : "opacity-50"
                          }`}
                          style={{
                            backgroundColor: sec.enabled ? "#10141C" : "#0B0D12",
                            borderColor: sec.enabled ? "rgba(163, 255, 111, 0.35)" : "#303947",
                          }}
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
                              <div className="fw-semibold text-white small d-flex align-items-center gap-2">
                                <span>{sec.name}</span>
                                <span
                                  className="badge font-monospace"
                                  style={{
                                    fontSize: "0.7rem",
                                    backgroundColor: "rgba(163, 255, 111, 0.15)",
                                    color: "#A3FF6F",
                                  }}
                                >
                                  {sec.type}
                                </span>
                              </div>
                              <small className="d-none d-md-block" style={{ color: "#D1D5DB" }}>{sec.description}</small>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              className="btn btn-sm p-1 rounded border"
                              style={{
                                backgroundColor: "#202938",
                                borderColor: "#303947",
                                color: "#FFFFFF",
                              }}
                              disabled={idx === 0}
                              onClick={() => moveSection(idx, "up")}
                              title="Move section up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm p-1 rounded border"
                              style={{
                                backgroundColor: "#202938",
                                borderColor: "#303947",
                                color: "#FFFFFF",
                              }}
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

                  <div
                    className="d-flex justify-content-between align-items-center pt-3 border-top"
                    style={{ borderColor: "#303947" }}
                  >
                    <span className="small" style={{ color: "#D1D5DB" }}>
                      Blueprint and stock photo discovery ready for generation
                    </span>
                    <button
                      type="button"
                      className="sb-btn-primary py-2.5 px-4 btn-magnetic"
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
              STEP 3: GENERATION SEQUENCE
              ====================================================================== */}
          {currentStep === "generating" && (
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-6 text-center">
                <div className="p-5 rounded-4 border shadow-xl" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div
                    className="d-inline-flex p-3 rounded-circle mb-4 spin"
                    style={{
                      backgroundColor: "rgba(163, 255, 111, 0.15)",
                      color: "#A3FF6F",
                    }}
                  >
                    <RefreshCw size={36} />
                  </div>

                  <span
                    className="badge rounded-pill mb-2 px-3 py-1.5 fw-semibold"
                    style={{
                      backgroundColor: "rgba(163, 255, 111, 0.15)",
                      border: "1px solid rgba(163, 255, 111, 0.35)",
                      color: "#A3FF6F",
                    }}
                  >
                    AI Synthesis &amp; Stock Photo Discovery
                  </span>
                  <h3 className="fw-bold text-white mb-3">Synthesizing Your Website</h3>
                  <p className="small mb-4" style={{ color: "#D1D5DB" }}>
                    {GEN_STAGES[genStage]}
                  </p>

                  {/* Progress Bar */}
                  <div
                    className="progress mb-4 rounded-pill"
                    style={{ height: "8px", backgroundColor: "#10141C" }}
                  >
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{
                        width: `${genProgress}%`,
                        background: "linear-gradient(90deg, #A3FF6F, #7CE643)",
                      }}
                      aria-valuenow={genProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>

                  {/* Checklist of stages */}
                  <div
                    className="text-start p-3 rounded-3 border"
                    style={{
                      backgroundColor: "#10141C",
                      borderColor: "#303947",
                    }}
                  >
                    {GEN_STAGES.map((label, idx) => {
                      const isDone = idx < genStage;
                      const isCurrent = idx === genStage;
                      return (
                        <div key={idx} className="d-flex align-items-center gap-2 py-1 small">
                          {isDone ? (
                            <CheckCircle2 size={16} className="sb-text-emerald" />
                          ) : isCurrent ? (
                            <span className="spinner-border spinner-border-sm" role="status" style={{ color: "#A3FF6F" }}></span>
                          ) : (
                            <span
                              className="rounded-circle border"
                              style={{ width: 14, height: 14, borderColor: "#303947" }}
                            ></span>
                          )}
                          <span className={isDone ? "text-white fw-medium" : isCurrent ? "sb-text-emerald fw-bold" : "text-white"} style={!isDone && !isCurrent ? { color: "#BFC7D2" } : {}}>
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
                <div className="p-4 p-md-5 rounded-4 border shadow-xl" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div
                    className="d-inline-flex p-3 rounded-circle mb-3"
                    style={{
                      backgroundColor: "rgba(163, 255, 111, 0.15)",
                      color: "#A3FF6F",
                    }}
                  >
                    <CheckCircle2 size={40} />
                  </div>

                  {blueprint?.isLiveAI ? (
                    <div>
                      <span
                        className="badge rounded-pill mb-2 px-3 py-1.5 small d-inline-flex align-items-center gap-1 fw-semibold"
                        style={{
                          backgroundColor: "rgba(163, 255, 111, 0.15)",
                          border: "1px solid rgba(163, 255, 111, 0.35)",
                          color: "#A3FF6F",
                        }}
                      >
                        <Sparkles size={14} />
                        Synthesized Live with {blueprint.modelUsed || "Gemini 3.8 Flash"} &amp; Stock Photo Discovery
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span
                        className="badge rounded-pill mb-2 px-3 py-1.5 small d-inline-flex align-items-center gap-1 fw-semibold"
                        style={{
                          backgroundColor: "rgba(163, 255, 111, 0.15)",
                          border: "1px solid rgba(163, 255, 111, 0.35)",
                          color: "#A3FF6F",
                        }}
                      >
                        <Sparkles size={14} />
                        Synthesized with Verified Stock Photography Engine
                      </span>
                    </div>
                  )}

                  <h3 className="fw-bold text-white mb-2">Website Draft Ready!</h3>
                  <p className="small mb-4" style={{ color: "#D1D5DB" }}>
                    Your website structure, theme tokens, and verified stock photographs have been synthesized into your local workspace.
                  </p>

                  {/* Actions Row */}
                  <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                    <Link
                      href={`/editor/${generatedProjectId}`}
                      className="sb-btn-primary py-2.5 px-4 d-flex align-items-center gap-2 btn-magnetic"
                      id="btn-open-generated-editor"
                    >
                      Open in Visual Editor
                      <ArrowRight size={18} />
                    </Link>

                    <button
                      type="button"
                      className="sb-btn-outline py-2.5 px-4 d-flex align-items-center gap-2"
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
                    <div
                      className="alert py-2 px-3 small rounded-3 mb-4 fw-semibold"
                      style={{
                        backgroundColor: "rgba(163, 255, 111, 0.15)",
                        borderColor: "rgba(163, 255, 111, 0.35)",
                        color: "#A3FF6F",
                      }}
                    >
                      {zipSuccess}
                    </div>
                  )}

                  {/* Quick Local Run Helper */}
                  <div
                    className="p-3 rounded-3 border text-start small"
                    style={{
                      backgroundColor: "#10141C",
                      borderColor: "#303947",
                    }}
                  >
                    <div className="fw-bold mb-1 d-flex align-items-center gap-2 text-white">
                      <Terminal size={15} className="sb-text-emerald" />
                      Run Standalone Website Locally
                    </div>
                    <p className="mb-2" style={{ fontSize: "0.82rem", color: "#D1D5DB" }}>
                      Extract your downloaded ZIP archive and launch with Node.js or Python:
                    </p>
                    <pre
                      className="p-2 rounded-2 mb-0"
                      style={{
                        backgroundColor: "#0B0D12",
                        border: "1px solid #303947",
                        color: "#A3FF6F",
                        fontSize: "0.78rem",
                      }}
                    >
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
    <Suspense fallback={<div className="p-5 text-center text-white min-vh-100" style={{ backgroundColor: "#0B0D12" }}>Loading studio...</div>}>
      <CreateStudioContent />
    </Suspense>
  );
}
