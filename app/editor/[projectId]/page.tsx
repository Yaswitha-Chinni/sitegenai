"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ViewportSwitcher, { ViewportMode } from "@/components/ui/ViewportSwitcher";
import SectionRenderer, { SelectedElementInfo } from "@/components/preview/SectionRenderer";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { projectService } from "@/lib/projects/projectService";
import {
  WebsiteDocument,
  WebsiteSection,
  SectionType,
  ElementCustomStyle,
  SectionItem,
} from "@/types/project";
import {
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  Download,
  Copy,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Palette,
  Type,
  Layout,
  Sliders,
  MoveVertical,
  CheckCircle2,
  Settings,
  X,
  FileCode,
  Share2,
  Maximize2,
  Check,
  Film,
  Server,
  Terminal,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  Camera,
  Crosshair,
  Crop,
  Layers,
  Component as ComponentIcon,
  Smile,
  Save,
  ChevronRight,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Square,
  Box,
  Heading,
  MousePointer,
  HelpCircle,
  History,
  Search,
  ExternalLink,
  Play,
  Globe,
  FileText,
} from "lucide-react";
import ProjectSettingsModal from "@/components/ui/ProjectSettingsModal";
import VideoGeneratorModal from "@/components/ui/VideoGeneratorModal";
import AssetUploader from "@/components/ui/AssetUploader";
import ImageFinderModal from "@/components/ui/ImageFinderModal";
import LocalhostModal from "@/components/ui/LocalhostModal";
import AiAssistantModal from "@/components/ui/AiAssistantModal";
import ResponsiveLabModal from "@/components/ui/ResponsiveLabModal";
import SeoAuditModal from "@/components/ui/SeoAuditModal";
import VersionHistoryModal from "@/components/ui/VersionHistoryModal";
import CommandPalette from "@/components/ui/CommandPalette";
import { WebsiteImprovement } from "@/app/api/ai/improve/route";
import { ICON_REGISTRY, renderRegisteredIcon } from "@/lib/icons/iconRegistry";
import { UploadedAsset } from "@/types/asset";
import { ImageMetadata } from "@/types/project";

interface EditorPageProps {
  params: Promise<{ projectId: string }>;
}

const GOOGLE_FONTS = [
  "Outfit, sans-serif",
  "Plus Jakarta Sans, sans-serif",
  "Inter, sans-serif",
  "Roboto, sans-serif",
  "Playfair Display, serif",
  "Cinzel, serif",
  "Montserrat, sans-serif",
  "system-ui, sans-serif",
];

const FONT_WEIGHTS = [
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semi-Bold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "Extra Bold (800)", value: "800" },
];

const BORDER_RADIUS_PRESETS = [
  { label: "Square (0px)", value: "0px" },
  { label: "Subtle (4px)", value: "4px" },
  { label: "Smooth (8px)", value: "8px" },
  { label: "Card (14px)", value: "14px" },
  { label: "Rounded (24px)", value: "24px" },
  { label: "Pill (9999px)", value: "9999px" },
];

const SHADOW_PRESETS = [
  { label: "None", value: "none" },
  { label: "Soft", value: "0 2px 8px rgba(0,0,0,0.25)" },
  { label: "Medium", value: "0 8px 24px rgba(0,0,0,0.4)" },
  { label: "Elevated", value: "0 16px 36px rgba(0,0,0,0.6)" },
  { label: "Emerald Glow", value: "0 0 24px rgba(163,255,111,0.3)" },
];

export default function VisualEditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  const router = useRouter();

  // Document & History State
  const [project, setProject] = useState<WebsiteDocument | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historyPast, setHistoryPast] = useState<WebsiteDocument[]>([]);
  const [historyFuture, setHistoryFuture] = useState<WebsiteDocument[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Selection & Mode State
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo | null>(null);
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // Sidebar Tabs
  const [leftTab, setLeftTab] = useState<"layers" | "sections" | "pages" | "brand" | "assets" | "add" | "icons" | "theme">("layers");
  const [propertiesTab, setPropertiesTab] = useState<"content" | "typography" | "dimensions" | "styling" | "icons">("content");

  // Icon Search State
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [iconCategory, setIconCategory] = useState<string>("all");

  // Modals & UI States
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImageFinderModal, setShowImageFinderModal] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [deleteSectionTarget, setDeleteSectionTarget] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Master Prompt Feature Modals
  const [showLocalhostModal, setShowLocalhostModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showResponsiveLabModal, setShowResponsiveLabModal] = useState(false);
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [canvasViewMode, setCanvasViewMode] = useState<"visual" | "native">("visual");
  const [localhostServerStatus, setLocalhostServerStatus] = useState<"stopped" | "running">("stopped");
  const [newPageName, setNewPageName] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Initial Load: localStorage first, then server API fallback
  useEffect(() => {
    async function initProject() {
      setIsLoading(true);
      setLoadError(null);

      // Check client storage
      const local = projectService.getProjectById(projectId);
      if (local) {
        setProject(local);
        if (local.sections.length > 0) {
          setSelectedSectionId(local.sections[0].id);
        }
        setIsLoading(false);
        return;
      }

      // Check server API
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.project) {
            projectService.saveProject(data.project);
            setProject(data.project);
            if (data.project.sections.length > 0) {
              setSelectedSectionId(data.project.sections[0].id);
            }
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Server project load error:", err);
      }

      // If not found, show error state
      setLoadError(`Project "${projectId}" could not be found.`);
      setIsLoading(false);
    }

    initProject();
  }, [projectId]);

  // Commit change with Undo/Redo stack
  const commitChange = useCallback((nextProject: WebsiteDocument) => {
    if (!project) return;
    setHistoryPast((prev) => [...prev.slice(-25), JSON.parse(JSON.stringify(project))]);
    setHistoryFuture([]);
    setProject(nextProject);
    setHasUnsavedChanges(true);
    setSaveStatus("unsaved");
  }, [project]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0 || !project) return;
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);
    setHistoryFuture((prev) => [JSON.parse(JSON.stringify(project)), ...prev]);
    setHistoryPast(newPast);
    setProject(previous);
    setHasUnsavedChanges(true);
    setSaveStatus("unsaved");
    showToast("Undone last change.");
  }, [historyPast, project]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0 || !project) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);
    setHistoryPast((prev) => [...prev, JSON.parse(JSON.stringify(project))]);
    setHistoryFuture(newFuture);
    setProject(next);
    setHasUnsavedChanges(true);
    setSaveStatus("unsaved");
    showToast("Redone change.");
  }, [historyFuture, project]);

  // Save Project
  const handleSave = useCallback(async () => {
    if (!project) return;
    setSaveStatus("saving");
    try {
      projectService.saveProject(project);
      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      showToast("All changes saved successfully.");
    } catch (e: any) {
      showToast("Save error: " + e?.message);
      setSaveStatus("unsaved");
    }
  }, [project]);

  // Check localhost server status
  useEffect(() => {
    if (projectId) {
      fetch(`/api/projects/localhost-run?projectId=${projectId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.status === "running") {
            setLocalhostServerStatus("running");
          } else {
            setLocalhostServerStatus("stopped");
          }
        })
        .catch(() => {});
    }
  }, [projectId, showLocalhostModal]);

  // Master Tool Handlers
  const handleApplyImprovement = useCallback((imp: WebsiteImprovement) => {
    if (!project) return;
    const next = JSON.parse(JSON.stringify(project)) as WebsiteDocument;

    const secIdx = next.sections.findIndex((s) => s.id === imp.sectionId);
    if (secIdx >= 0) {
      if (imp.field === "title" || imp.field === "subtitle" || imp.field === "description" || imp.field === "buttonText" || imp.field === "badge") {
        (next.sections[secIdx].content as any)[imp.field] = imp.suggestedValue;
      }
    }

    commitChange(next);
    showToast(`Applied AI: "${imp.title}"`);
  }, [project, commitChange]);

  const handleApplyAllImprovements = useCallback((improvements: WebsiteImprovement[]) => {
    if (!project) return;
    let next = JSON.parse(JSON.stringify(project)) as WebsiteDocument;

    for (const imp of improvements) {
      const secIdx = next.sections.findIndex((s) => s.id === imp.sectionId);
      if (secIdx >= 0) {
        if (imp.field === "title" || imp.field === "subtitle" || imp.field === "description" || imp.field === "buttonText" || imp.field === "badge") {
          (next.sections[secIdx].content as any)[imp.field] = imp.suggestedValue;
        }
      }
    }

    commitChange(next);
    showToast(`Applied all ${improvements.length} AI improvements.`);
  }, [project, commitChange]);

  const handleApplyResponsiveFix = useCallback((updatedProject: WebsiteDocument) => {
    commitChange(updatedProject);
    showToast("Applied responsive layout optimizations.");
  }, [commitChange]);

  const handleApplySeoFix = useCallback((updatedProject: WebsiteDocument) => {
    commitChange(updatedProject);
    showToast("Applied SEO & accessibility audit fixes.");
  }, [commitChange]);

  const handleRestoreSnapshot = useCallback((restoredProject: WebsiteDocument) => {
    commitChange(restoredProject);
    showToast("Restored snapshot version.");
  }, [commitChange]);

  // Keyboard Shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+S (Save), Ctrl+K (Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, handleSave]);

  const selectedSection = project?.sections.find((s) => s.id === selectedSectionId);

  // Update Section Helper
  const updateSelectedSection = (updater: (sec: WebsiteSection) => WebsiteSection) => {
    if (!project || !selectedSectionId) return;
    const nextSections = project.sections.map((s) => (s.id === selectedSectionId ? updater(s) : s));
    commitChange({ ...project, sections: nextSections });
  };

  // Update Element Custom Style
  const updateSelectedElementStyle = (styleUpdates: Partial<ElementCustomStyle>) => {
    if (!project || !selectedSectionId || !selectedElement) return;
    const { elementId } = selectedElement;

    updateSelectedSection((sec) => {
      const currentStyles = sec.elementStyles || {};
      const existing = currentStyles[elementId] || {};
      const updated = { ...existing, ...styleUpdates };
      return {
        ...sec,
        elementStyles: {
          ...currentStyles,
          [elementId]: updated,
        },
      };
    });
  };

  // Inline Text Change Handler
  const handleInlineTextChange = (sectionId: string, elementId: string, newText: string, itemIndex?: number) => {
    if (!project) return;
    const nextSections = project.sections.map((s) => {
      if (s.id !== sectionId) return s;
      const content = { ...s.content };

      if (elementId.endsWith("-title") && itemIndex === undefined) {
        content.title = newText;
      } else if (elementId.endsWith("-subtitle")) {
        content.subtitle = newText;
      } else if (elementId.endsWith("-description")) {
        content.description = newText;
      } else if (elementId.endsWith("-badge")) {
        content.badge = newText;
      } else if (elementId.endsWith("-button")) {
        content.buttonText = newText;
      } else if (elementId.endsWith("-secondary-button")) {
        content.secondaryButtonText = newText;
      } else if (itemIndex !== undefined && content.items && content.items[itemIndex]) {
        const items = [...content.items];
        items[itemIndex] = { ...items[itemIndex], title: newText };
        content.items = items;
      }

      return { ...s, content };
    });

    commitChange({ ...project, sections: nextSections });
  };

  // Step Font Size Helper
  const stepFontSize = (delta: number) => {
    if (!selectedSection || !selectedElement) return;
    const currentCustom = selectedSection.elementStyles?.[selectedElement.elementId];
    let currentPx = 16;
    if (currentCustom?.fontSize) {
      if (typeof currentCustom.fontSize === "number") currentPx = currentCustom.fontSize;
      else currentPx = parseInt(currentCustom.fontSize, 10) || 16;
    } else {
      if (selectedElement.elementType === "heading") currentPx = 36;
      else if (selectedElement.elementType === "subheading") currentPx = 20;
      else if (selectedElement.elementType === "button") currentPx = 15;
      else if (selectedElement.elementType === "badge") currentPx = 13;
      else currentPx = 16;
    }

    const nextPx = Math.max(10, Math.min(120, currentPx + delta));
    updateSelectedElementStyle({ fontSize: nextPx });
  };

  // Add Element into current section
  const handleInsertElement = (type: string) => {
    if (!selectedSection) {
      showToast("Please select a section to insert an element.");
      return;
    }

    const nextSec = { ...selectedSection };
    const items = [...(nextSec.content.items || [])];

    if (type === "item" || type === "card" || type === "feature" || type === "product") {
      const newItem: SectionItem = {
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
        description: "Customized description tailored to your brand.",
        tag: "New",
        price: "$19.00",
      };
      items.push(newItem);
      nextSec.content = { ...nextSec.content, items };
      updateSelectedSection(() => nextSec);
      showToast(`Added new ${type} card to section.`);
    } else if (type === "button") {
      if (!nextSec.content.buttonText) {
        nextSec.content = { ...nextSec.content, buttonText: "Take Action", buttonLink: "#" };
      } else {
        nextSec.content = { ...nextSec.content, secondaryButtonText: "Learn More", secondaryButtonLink: "#" };
      }
      updateSelectedSection(() => nextSec);
      showToast("Added button to section.");
    } else if (type === "badge") {
      nextSec.content = { ...nextSec.content, badge: "Special Highlight" };
      updateSelectedSection(() => nextSec);
      showToast("Added badge to section.");
    } else if (type === "image") {
      nextSec.content = {
        ...nextSec.content,
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
      };
      updateSelectedSection(() => nextSec);
      showToast("Added image block to section.");
    }
  };

  // Move Section Up/Down
  const moveSection = (index: number, direction: "up" | "down") => {
    if (!project) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= project.sections.length) return;
    const newSections = [...project.sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    commitChange({ ...project, sections: newSections });
  };

  // Toggle Section Visibility
  const toggleSectionVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project) return;
    const newSections = project.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s));
    commitChange({ ...project, sections: newSections });
  };

  // Duplicate Section
  const duplicateSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project) return;
    const target = project.sections.find((s) => s.id === id);
    if (!target) return;
    const newSec: WebsiteSection = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-${target.type}-${Date.now().toString(36)}`,
      name: `${target.name} (Copy)`,
    };
    const targetIdx = project.sections.findIndex((s) => s.id === id);
    const newSections = [...project.sections];
    newSections.splice(targetIdx + 1, 0, newSec);
    commitChange({ ...project, sections: newSections });
    setSelectedSectionId(newSec.id);
    showToast(`Duplicated ${target.name}.`);
  };

  // Delete Section
  const confirmDeleteSection = () => {
    if (!project || !deleteSectionTarget) return;
    const filtered = project.sections.filter((s) => s.id !== deleteSectionTarget);
    commitChange({ ...project, sections: filtered });
    if (selectedSectionId === deleteSectionTarget) {
      setSelectedSectionId(filtered[0]?.id || null);
      setSelectedElement(null);
    }
    setDeleteSectionTarget(null);
    showToast("Section removed.");
  };

  // Add Section to Page
  const handleAddSection = (type: SectionType, name: string) => {
    if (!project) return;
    const newSec: WebsiteSection = {
      id: `sec-${type}-${Date.now().toString(36)}`,
      type,
      name,
      visible: true,
      content: {
        badge: "New Block",
        title: name,
        description: "Add your customized section description and key message here.",
        buttonText: "Learn More",
      },
      style: {
        backgroundColor: "#151A24",
        textColor: "#FFFFFF",
        paddingY: "lg",
        alignment: "center",
        borderRadius: "none",
      },
      animation: "fade",
    };
    const newSections = [...project.sections, newSec];
    commitChange({ ...project, sections: newSections });
    setSelectedSectionId(newSec.id);
    setShowAddSectionModal(false);
    showToast(`Added ${name} to page.`);
  };

  // Export ZIP
  const handleExportZip = async () => {
    if (!project) return;
    setIsExportingZip(true);
    try {
      const res = await projectService.downloadProjectZip(project);
      if (!res.success) throw new Error(res.error || "Export failed.");
      showToast("Website ZIP downloaded successfully!");
      setShowExportModal(false);
    } catch (e: any) {
      alert("Export failed: " + e.message);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Filtered Icons
  const filteredIcons = ICON_REGISTRY.filter((icon) => {
    const matchesQuery =
      icon.name.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
      icon.keywords.some((k) => k.toLowerCase().includes(iconSearchQuery.toLowerCase()));
    const matchesCat = iconCategory === "all" || icon.category === iconCategory;
    return matchesQuery && matchesCat;
  });

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: "#0B0D12" }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: "#A3FF6F" }} role="status"></div>
          <p className="fw-semibold text-white">Loading SiteGenAI Visual Editor...</p>
        </div>
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 p-4" style={{ backgroundColor: "#0B0D12" }}>
        <div className="p-4 rounded-4 border text-center shadow-lg" style={{ maxWidth: 480, backgroundColor: "#151A24", borderColor: "#303947" }}>
          <AlertCircle size={44} className="text-danger mx-auto mb-3" />
          <h4 className="fw-bold text-white mb-2">Project Not Found</h4>
          <p className="small mb-4" style={{ color: "#D1D5DB" }}>{loadError || "The requested project could not be found."}</p>
          <div className="d-flex justify-content-center gap-2">
            <Link href="/dashboard" className="sb-btn-primary btn-sm px-4">
              Go to Dashboard
            </Link>
            <Link href="/templates" className="sb-btn-outline btn-sm px-4">
              Explore Templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active element style resolution for the properties sidebar
  const activeCustomStyle: ElementCustomStyle =
    selectedSection && selectedElement ? selectedSection.elementStyles?.[selectedElement.elementId] || {} : {};

  const isW1 = Boolean(project?.templateSource === "w1" || project?.templateId === "w1" || project?.id.includes("w1"));
  const isW2 = Boolean(project?.templateSource === "w2" || project?.templateId === "w2" || project?.id.includes("w2"));

  return (
    <div className="d-flex flex-column vh-100 overflow-hidden" style={{ backgroundColor: "#0B0D12", color: "#F1F5F9" }}>
      {/* ========================================================================
          1. TOP TOOLBAR
          ======================================================================== */}
      <header
        className="py-2 px-3 d-flex align-items-center justify-content-between gap-3 z-3 shadow-sm flex-shrink-0 border-bottom"
        style={{
          backgroundColor: "#10141C",
          borderColor: "#303947",
        }}
      >
        {/* Left: Back & Title */}
        <div className="d-flex align-items-center gap-3">
          <Link
            href="/dashboard"
            className="btn btn-sm d-flex align-items-center gap-1.5 border text-white"
            style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
          >
            <ArrowLeft size={15} />
            <span className="d-none d-sm-inline">Dashboard</span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="fw-bold fs-6 border-0 text-white py-1 px-2 rounded"
              value={project.name}
              onChange={(e) => {
                const next = { ...project, name: e.target.value };
                setProject(next);
                setHasUnsavedChanges(true);
                setSaveStatus("unsaved");
              }}
              style={{
                maxWidth: "260px",
                backgroundColor: "transparent",
                outline: "none",
              }}
              title="Click to rename project"
            />
            {saveStatus === "unsaved" ? (
              <span className="badge border small" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", borderColor: "rgba(245, 158, 11, 0.35)" }}>Unsaved</span>
            ) : (
              <span className="badge border small" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F", borderColor: "rgba(163, 255, 111, 0.35)" }}>Saved</span>
            )}
          </div>
        </div>

        {/* Center: Undo/Redo, Viewport Switcher & Quick Tools */}
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm me-1" role="group">
            <button
              type="button"
              className="btn text-white border"
              style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
              disabled={historyPast.length === 0}
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              className="btn text-white border"
              style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
              disabled={historyFuture.length === 0}
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={15} />
            </button>
          </div>

          <ViewportSwitcher currentMode={viewportMode} onChange={setViewportMode} />

          {/* Quick Tool Launchers */}
          <div className="d-none d-lg-flex align-items-center gap-1 ms-2 border-start ps-2" style={{ borderColor: "#303947" }}>
            <button
              type="button"
              className="btn btn-sm text-white border px-2 py-1 d-flex align-items-center gap-1.5"
              style={{ backgroundColor: "#151A24", borderColor: "#303947", fontSize: "0.78rem" }}
              onClick={() => setShowCommandPalette(true)}
              title="Search commands (Ctrl+K)"
            >
              <Search size={13} style={{ color: "#A3FF6F" }} />
              <span className="font-monospace text-muted" style={{ fontSize: "0.7rem" }}>Ctrl+K</span>
            </button>

            <button
              type="button"
              className="btn btn-sm text-white border px-2 py-1 d-flex align-items-center gap-1.5"
              style={{ backgroundColor: "#151A24", borderColor: "#303947", fontSize: "0.78rem" }}
              onClick={() => setShowAiModal(true)}
              title="AI Website Improvement Assistant"
            >
              <Sparkles size={13} style={{ color: "#A3FF6F" }} />
              <span>AI Assist</span>
            </button>

            <button
              type="button"
              className="btn btn-sm text-white border px-2 py-1 d-flex align-items-center gap-1.5"
              style={{ backgroundColor: "#151A24", borderColor: "#303947", fontSize: "0.78rem" }}
              onClick={() => setShowResponsiveLabModal(true)}
              title="Responsive Testing Lab"
            >
              <Sliders size={13} />
              <span>Responsive Lab</span>
            </button>

            <button
              type="button"
              className="btn btn-sm text-white border px-2 py-1 d-flex align-items-center gap-1.5"
              style={{ backgroundColor: "#151A24", borderColor: "#303947", fontSize: "0.78rem" }}
              onClick={() => setShowSeoModal(true)}
              title="SEO & Accessibility Audit"
            >
              <CheckCircle2 size={13} />
              <span>Audit</span>
            </button>

            <button
              type="button"
              className="btn btn-sm text-white border px-2 py-1 d-flex align-items-center gap-1.5"
              style={{ backgroundColor: "#151A24", borderColor: "#303947", fontSize: "0.78rem" }}
              onClick={() => setShowVersionHistoryModal(true)}
              title="Version History & Safe Rollback"
            >
              <History size={13} />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="d-flex align-items-center gap-2">
          {/* Run on Localhost */}
          <button
            type="button"
            className="btn btn-sm d-flex align-items-center gap-1.5 border"
            style={{
              backgroundColor: localhostServerStatus === "running" ? "rgba(163, 255, 111, 0.15)" : "#151A24",
              borderColor: localhostServerStatus === "running" ? "#A3FF6F" : "#303947",
              color: localhostServerStatus === "running" ? "#A3FF6F" : "#FFFFFF",
              fontWeight: 600,
            }}
            onClick={() => setShowLocalhostModal(true)}
            title="Launch Managed Localhost Server"
          >
            <Server size={14} className={localhostServerStatus === "running" ? "sb-text-emerald" : ""} />
            <span className="d-none d-sm-inline">Run on Localhost</span>
            {localhostServerStatus === "running" && (
              <span className="badge rounded-pill bg-success px-1.5 py-0.5" style={{ fontSize: "0.62rem" }}>LIVE</span>
            )}
          </button>

          {/* Toggle Preview in Canvas */}
          <button
            type="button"
            className="btn btn-sm d-flex align-items-center gap-1.5 border"
            style={{
              backgroundColor: isPreviewMode ? "#A3FF6F" : "#151A24",
              color: isPreviewMode ? "#0B0D12" : "#FFFFFF",
              borderColor: isPreviewMode ? "#A3FF6F" : "#303947",
              fontWeight: 600,
            }}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            title="Toggle Visual Preview Canvas"
          >
            <Eye size={14} />
            <span className="d-none d-sm-inline">{isPreviewMode ? "Exit Preview" : "Preview"}</span>
          </button>

          {/* Standalone Fullscreen Preview */}
          <Link
            href={`/preview/${projectId}`}
            target="_blank"
            className="btn btn-sm d-flex align-items-center gap-1 border text-white"
            style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
            title="Open Dedicated Full-Page Scrollable Preview in New Tab"
          >
            <ExternalLink size={13} />
            <span className="d-none d-md-inline small">Full Preview</span>
          </Link>

          {/* Save */}
          <button
            type="button"
            className="btn btn-sm d-flex align-items-center gap-1.5 border"
            style={{
              backgroundColor: hasUnsavedChanges ? "rgba(163, 255, 111, 0.15)" : "#151A24",
              borderColor: hasUnsavedChanges ? "#A3FF6F" : "#303947",
              color: hasUnsavedChanges ? "#A3FF6F" : "#FFFFFF",
              fontWeight: 600,
            }}
            onClick={handleSave}
            title="Save Project (Ctrl+S)"
          >
            <Save size={14} />
            <span>Save</span>
          </button>

          {/* Export ZIP */}
          <button
            type="button"
            className="sb-btn-primary btn-sm py-1.5 px-3 d-flex align-items-center gap-1.5 btn-magnetic"
            onClick={() => setShowExportModal(true)}
            title="Export Standalone Production ZIP"
          >
            <Download size={14} />
            <span className="d-none d-sm-inline">Export</span>
          </button>
        </div>
      </header>

      {/* ========================================================================
          2. THREE-COLUMN WORKSPACE
          ======================================================================== */}
      <div className="editor-layout flex-grow-1 overflow-hidden d-flex" style={{ backgroundColor: "#0B0D12" }}>
        {/* ======================================================================
            2.1 LEFT PANEL: STRUCTURE, ADD ELEMENTS, ICONS, SECTIONS, THEME
            ====================================================================== */}
        {!isPreviewMode && (
          <aside
            className="editor-sidebar-left p-0 d-flex flex-column border-end"
            style={{
              width: "320px",
              minWidth: "320px",
              zIndex: 10,
              backgroundColor: "#10141C",
              borderColor: "#303947",
            }}
          >
            {/* Top Navigation Tabs */}
            <div
              className="d-flex border-bottom px-2 pt-2 gap-1 overflow-x-auto flex-shrink-0"
              style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
            >
              {[
                { id: "layers", label: "Layers", icon: <Layers size={13} className="me-1" /> },
                { id: "sections", label: "Sections", icon: <Layout size={13} className="me-1" /> },
                { id: "pages", label: "Pages", icon: <FileText size={13} className="me-1" /> },
                { id: "brand", label: "Brand", icon: <Sparkles size={13} className="me-1" /> },
                { id: "assets", label: "Assets", icon: <ImageIcon size={13} className="me-1" /> },
                { id: "add", label: "Blocks", icon: <Plus size={13} className="me-1" /> },
                { id: "icons", label: "Icons", icon: <Smile size={13} className="me-1" /> },
                { id: "theme", label: "Theme", icon: <Palette size={13} className="me-1" /> },
              ].map((tab) => {
                const isActive = leftTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className="btn btn-sm py-1.5 px-2 border-0 fw-semibold small transition-all text-nowrap"
                    style={{
                      color: isActive ? "#A3FF6F" : "#BFC7D2",
                      backgroundColor: isActive ? "#10141C" : "transparent",
                      borderBottom: isActive ? "2px solid #A3FF6F" : "2px solid transparent",
                      borderRadius: "6px 6px 0 0",
                      fontSize: "0.78rem",
                    }}
                    onClick={() => setLeftTab(tab.id as any)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: LAYERS / PAGE STRUCTURE TREE */}
            {leftTab === "layers" && (
              <div className="p-3 d-flex flex-column gap-2 overflow-y-auto flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-bold text-uppercase" style={{ fontSize: "0.74rem", color: "#BFC7D2" }}>
                    Page Structure Tree
                  </span>
                  <span className="badge border font-monospace small" style={{ backgroundColor: "#151A24", borderColor: "#303947", color: "#A3FF6F" }}>
                    {project.sections.length} Sections
                  </span>
                </div>

                <div className="d-flex flex-column gap-2">
                  {project.sections.map((sec, sIdx) => {
                    const isSecSelected = selectedSectionId === sec.id;
                    return (
                      <div
                        key={sec.id}
                        className="rounded-3 p-2 border"
                        style={{
                          backgroundColor: "#151A24",
                          borderColor: isSecSelected ? "rgba(163, 255, 111, 0.45)" : "#303947",
                        }}
                      >
                        <div
                          className="d-flex align-items-center justify-content-between p-1.5 rounded-2 cursor-pointer"
                          onClick={() => {
                            setSelectedSectionId(sec.id);
                            setSelectedElement(null);
                          }}
                          style={{
                            cursor: "pointer",
                            backgroundColor: isSecSelected ? "rgba(163, 255, 111, 0.12)" : "transparent",
                            color: isSecSelected ? "#A3FF6F" : "#FFFFFF",
                          }}
                        >
                          <div className="d-flex align-items-center gap-2 text-truncate">
                            <span className="badge border" style={{ fontSize: "0.68rem", backgroundColor: "#10141C", borderColor: "#303947", color: "#BFC7D2" }}>
                              {sIdx + 1}
                            </span>
                            <span className="small text-truncate fw-semibold">{sec.name}</span>
                          </div>

                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              className="btn btn-sm p-1 border-0 text-white"
                              disabled={sIdx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSection(sIdx, "up");
                              }}
                              title="Move section up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm p-1 border-0 text-white"
                              disabled={sIdx === project.sections.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSection(sIdx, "down");
                              }}
                              title="Move section down"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Child Elements inside this section */}
                        {isSecSelected && (
                          <div className="ps-2 pt-2 d-flex flex-column gap-1 border-top mt-1" style={{ borderColor: "#303947" }}>
                            {/* Heading */}
                            <div
                              className="p-1 ps-2 rounded small d-flex align-items-center gap-2 cursor-pointer"
                              onClick={() => setSelectedElement({ sectionId: sec.id, elementId: `${sec.id}-title`, elementType: "heading" })}
                              style={{
                                cursor: "pointer",
                                fontSize: "0.82rem",
                                backgroundColor: selectedElement?.elementId === `${sec.id}-title` ? "rgba(163, 255, 111, 0.2)" : "transparent",
                                color: selectedElement?.elementId === `${sec.id}-title` ? "#A3FF6F" : "#D1D5DB",
                                fontWeight: selectedElement?.elementId === `${sec.id}-title` ? "700" : "500",
                              }}
                            >
                              <Heading size={13} />
                              <span>Heading (H1/H2)</span>
                            </div>

                            {/* Subheading / Description */}
                            {sec.content.description && (
                              <div
                                className="p-1 ps-2 rounded small d-flex align-items-center gap-2 cursor-pointer"
                                onClick={() => setSelectedElement({ sectionId: sec.id, elementId: `${sec.id}-description`, elementType: "paragraph" })}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "0.82rem",
                                  backgroundColor: selectedElement?.elementId === `${sec.id}-description` ? "rgba(163, 255, 111, 0.2)" : "transparent",
                                  color: selectedElement?.elementId === `${sec.id}-description` ? "#A3FF6F" : "#D1D5DB",
                                  fontWeight: selectedElement?.elementId === `${sec.id}-description` ? "700" : "500",
                                }}
                              >
                                <Type size={13} />
                                <span>Paragraph Text</span>
                              </div>
                            )}

                            {/* Button */}
                            {sec.content.buttonText && (
                              <div
                                className="p-1 ps-2 rounded small d-flex align-items-center gap-2 cursor-pointer"
                                onClick={() => setSelectedElement({ sectionId: sec.id, elementId: `${sec.id}-button`, elementType: "button" })}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "0.82rem",
                                  backgroundColor: selectedElement?.elementId === `${sec.id}-button` ? "rgba(163, 255, 111, 0.2)" : "transparent",
                                  color: selectedElement?.elementId === `${sec.id}-button` ? "#A3FF6F" : "#D1D5DB",
                                  fontWeight: selectedElement?.elementId === `${sec.id}-button` ? "700" : "500",
                                }}
                              >
                                <MousePointer size={13} />
                                <span>Button: {sec.content.buttonText}</span>
                              </div>
                            )}

                            {/* Image */}
                            {sec.content.imageUrl && (
                              <div
                                className="p-1 ps-2 rounded small d-flex align-items-center gap-2 cursor-pointer"
                                onClick={() => setSelectedElement({ sectionId: sec.id, elementId: `${sec.id}-image`, elementType: "image" })}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "0.82rem",
                                  backgroundColor: selectedElement?.elementId === `${sec.id}-image` ? "rgba(163, 255, 111, 0.2)" : "transparent",
                                  color: selectedElement?.elementId === `${sec.id}-image` ? "#A3FF6F" : "#D1D5DB",
                                  fontWeight: selectedElement?.elementId === `${sec.id}-image` ? "700" : "500",
                                }}
                              >
                                <ImageIcon size={13} />
                                <span>Visual Asset</span>
                              </div>
                            )}

                            {/* Items / Cards */}
                            {sec.content.items?.map((item, iIdx) => (
                              <div
                                key={iIdx}
                                className="p-1 ps-2 rounded small d-flex align-items-center gap-2 cursor-pointer"
                                onClick={() => setSelectedElement({ sectionId: sec.id, elementId: `${sec.id}-item-${iIdx}`, elementType: "card", itemIndex: iIdx })}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "0.82rem",
                                  backgroundColor: selectedElement?.elementId === `${sec.id}-item-${iIdx}` ? "rgba(163, 255, 111, 0.2)" : "transparent",
                                  color: selectedElement?.elementId === `${sec.id}-item-${iIdx}` ? "#A3FF6F" : "#D1D5DB",
                                  fontWeight: selectedElement?.elementId === `${sec.id}-item-${iIdx}` ? "700" : "500",
                                }}
                              >
                                <ComponentIcon size={13} />
                                <span className="text-truncate">Card {iIdx + 1}: {item.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: ADD ELEMENTS DRAWER */}
            {leftTab === "add" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                <div>
                  <h6 className="fw-bold text-white mb-1">Add Elements</h6>
                  <p className="small mb-3" style={{ color: "#D1D5DB" }}>Click any block to insert into the active section.</p>
                </div>

                <div className="d-flex flex-column gap-2">
                  {[
                    { type: "button", label: "Call to Action Button", desc: "Primary or secondary action button", icon: <MousePointer size={18} /> },
                    { type: "card", label: "Feature / Product Card", desc: "Interactive card with title and specs", icon: <ComponentIcon size={18} /> },
                    { type: "badge", label: "Tagline Badge", desc: "High-contrast category tag", icon: <Sparkles size={18} /> },
                    { type: "image", label: "Visual Media Showcase", desc: "Pexels or Unsplash verified image", icon: <ImageIcon size={18} /> },
                  ].map((el) => (
                    <div
                      key={el.type}
                      className="p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer transition-all"
                      style={{
                        backgroundColor: "#151A24",
                        borderColor: "#303947",
                        cursor: "pointer",
                      }}
                      onClick={() => handleInsertElement(el.type)}
                    >
                      <div className="p-2 rounded-3 text-dark" style={{ backgroundColor: "#A3FF6F" }}>
                        {el.icon}
                      </div>
                      <div>
                        <div className="fw-bold small text-white">{el.label}</div>
                        <small style={{ color: "#BFC7D2" }}>{el.desc}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: VECTOR ICONS LIBRARY */}
            {leftTab === "icons" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                <div>
                  <h6 className="fw-bold text-white mb-1">Lucide Vector Icons</h6>
                  <p className="small mb-2" style={{ color: "#D1D5DB" }}>Search and apply vector icons directly to selected elements.</p>
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Search icons (e.g. check, star, cart)..."
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                  />
                  <div className="d-flex flex-wrap gap-1">
                    {["all", "actions", "commerce", "media", "business"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className="btn btn-xs py-0 px-2 rounded-pill small border"
                        onClick={() => setIconCategory(cat)}
                        style={{
                          fontSize: "0.72rem",
                          backgroundColor: iconCategory === cat ? "#A3FF6F" : "#151A24",
                          color: iconCategory === cat ? "#0B0D12" : "#D1D5DB",
                          borderColor: iconCategory === cat ? "#A3FF6F" : "#303947",
                          fontWeight: 600,
                        }}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row g-2 overflow-y-auto">
                  {filteredIcons.map((iconDef) => (
                    <div key={iconDef.name} className="col-3">
                      <button
                        type="button"
                        className="btn border p-2 w-100 d-flex flex-column align-items-center justify-content-center transition-all text-white"
                        style={{ height: 58, backgroundColor: "#151A24", borderColor: "#303947" }}
                        onClick={() => {
                          if (selectedElement) {
                            updateSelectedElementStyle({ iconName: iconDef.name });
                            showToast(`Applied ${iconDef.label} icon to selected element.`);
                          } else {
                            showToast("Select an element to attach this icon.");
                          }
                        }}
                        title={`Click to apply ${iconDef.label}`}
                      >
                        {renderRegisteredIcon(iconDef.name, { size: 18 })}
                        <span className="small text-truncate mt-1" style={{ fontSize: "0.62rem", maxWidth: "100%", color: "#BFC7D2" }}>
                          {iconDef.name}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: SECTIONS MANAGER */}
            {leftTab === "sections" && (
              <div className="p-3 d-flex flex-column gap-2 overflow-y-auto flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold text-white mb-0">Manage Sections</h6>
                  <button
                    type="button"
                    className="sb-btn-primary btn-sm py-1 px-2.5 d-flex align-items-center gap-1"
                    onClick={() => setShowAddSectionModal(true)}
                  >
                    <Plus size={13} />
                    Add Section
                  </button>
                </div>

                <div className="d-flex flex-column gap-2">
                  {project.sections.map((sec) => (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className="p-2 rounded-3 border d-flex align-items-center justify-content-between gap-2 cursor-pointer"
                      style={{
                        cursor: "pointer",
                        backgroundColor: selectedSectionId === sec.id ? "rgba(163, 255, 111, 0.12)" : "#151A24",
                        borderColor: selectedSectionId === sec.id ? "#A3FF6F" : "#303947",
                        color: selectedSectionId === sec.id ? "#A3FF6F" : "#FFFFFF",
                      }}
                    >
                      <span className="small text-truncate fw-semibold">{sec.name}</span>
                      <div className="d-flex align-items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm p-1 border-0 text-white"
                          onClick={(e) => toggleSectionVisibility(sec.id, e)}
                        >
                          {sec.visible ? <Eye size={13} /> : <EyeOff size={13} style={{ color: "#BFC7D2" }} />}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm p-1 border-0 text-white"
                          onClick={(e) => duplicateSection(sec.id, e)}
                          title="Duplicate section"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm p-1 border-0 text-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteSectionTarget(sec.id);
                          }}
                          title="Delete section"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: GLOBAL THEME */}
            {leftTab === "theme" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                <h6 className="fw-bold text-white mb-1">Global Brand Tokens</h6>
                <div>
                  <label className="form-label small fw-semibold">Primary Brand Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={project.theme.primaryColor || "#A3FF6F"}
                      onChange={(e) =>
                        commitChange({
                          ...project,
                          theme: { ...project.theme, primaryColor: e.target.value },
                        })
                      }
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      value={project.theme.primaryColor || "#A3FF6F"}
                      onChange={(e) =>
                        commitChange({
                          ...project,
                          theme: { ...project.theme, primaryColor: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label small fw-semibold">Global Font Family</label>
                  <select
                    className="form-select form-select-sm"
                    value={project.theme.fontFamily || GOOGLE_FONTS[0]}
                    onChange={(e) =>
                      commitChange({
                        ...project,
                        theme: { ...project.theme, fontFamily: e.target.value },
                      })
                    }
                  >
                    {GOOGLE_FONTS.map((font) => (
                      <option key={font} value={font} className="bg-dark text-white">
                        {font.split(",")[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TAB 6: PAGES MANAGEMENT */}
            {leftTab === "pages" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold text-white mb-0">Website Pages</h6>
                  <span className="badge border small" style={{ backgroundColor: "#151A24", borderColor: "#303947", color: "#A3FF6F" }}>
                    {(project.pages || ["Home"]).length} Pages
                  </span>
                </div>
                <p className="small mb-2" style={{ color: "#D1D5DB" }}>Manage navigation routes and page metadata.</p>

                <div className="d-flex flex-column gap-2">
                  {(project.pages || ["Home"]).map((pageName) => {
                    const isActivePage = (project.activePage || "Home") === pageName;
                    return (
                      <div
                        key={pageName}
                        className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer"
                        style={{
                          backgroundColor: isActivePage ? "rgba(163, 255, 111, 0.12)" : "#151A24",
                          borderColor: isActivePage ? "#A3FF6F" : "#303947",
                          color: isActivePage ? "#A3FF6F" : "#FFFFFF",
                        }}
                        onClick={() => {
                          commitChange({ ...project, activePage: pageName });
                          showToast(`Switched to page: ${pageName}`);
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <FileText size={14} />
                          <span className="small fw-semibold">{pageName}</span>
                          {pageName === "Home" && (
                            <span className="badge bg-secondary text-white" style={{ fontSize: "0.62rem" }}>Index</span>
                          )}
                        </div>
                        {pageName !== "Home" && (
                          <button
                            type="button"
                            className="btn btn-sm p-1 border-0 text-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              const remaining = (project.pages || ["Home"]).filter((p) => p !== pageName);
                              commitChange({ ...project, pages: remaining, activePage: "Home" });
                              showToast(`Removed page: ${pageName}`);
                            }}
                            title="Delete page"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-top pt-3" style={{ borderColor: "#303947" }}>
                  <label className="form-label small fw-semibold">Add New Page</label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. About, Pricing, Contact"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newPageName.trim()) {
                          const pages = project.pages || ["Home"];
                          if (!pages.includes(newPageName.trim())) {
                            commitChange({ ...project, pages: [...pages, newPageName.trim()], activePage: newPageName.trim() });
                            setNewPageName("");
                            showToast(`Created page: ${newPageName.trim()}`);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="sb-btn-primary btn-sm px-3 flex-shrink-0"
                      disabled={!newPageName.trim()}
                      onClick={() => {
                        const pages = project.pages || ["Home"];
                        if (!pages.includes(newPageName.trim())) {
                          commitChange({ ...project, pages: [...pages, newPageName.trim()], activePage: newPageName.trim() });
                          setNewPageName("");
                          showToast(`Created page: ${newPageName.trim()}`);
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: BRAND KIT & DESIGN TOKENS */}
            {leftTab === "brand" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold text-white mb-0">Brand Kit &amp; Tokens</h6>
                  <span className="badge border small" style={{ backgroundColor: "#151A24", borderColor: "#303947", color: "#A3FF6F" }}>
                    Design Tokens
                  </span>
                </div>
                <p className="small mb-3" style={{ color: "#D1D5DB" }}>
                  Configure project tokens. Changes require explicit confirmation to preserve template designs.
                </p>

                <div>
                  <label className="form-label small fw-semibold">Primary Brand Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={project.theme?.primaryColor || "#087FE5"}
                      onChange={(e) =>
                        setProject({
                          ...project,
                          theme: { ...project.theme, primaryColor: e.target.value },
                        })
                      }
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      value={project.theme?.primaryColor || "#087FE5"}
                      onChange={(e) =>
                        setProject({
                          ...project,
                          theme: { ...project.theme, primaryColor: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label small fw-semibold">Secondary Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={project.theme?.secondaryColor || "#071B32"}
                      onChange={(e) =>
                        setProject({
                          ...project,
                          theme: { ...project.theme, secondaryColor: e.target.value },
                        })
                      }
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      value={project.theme?.secondaryColor || "#071B32"}
                      onChange={(e) =>
                        setProject({
                          ...project,
                          theme: { ...project.theme, secondaryColor: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label small fw-semibold">Typography Font Family</label>
                  <select
                    className="form-select form-select-sm"
                    value={project.theme?.fontFamily || GOOGLE_FONTS[0]}
                    onChange={(e) =>
                      setProject({
                        ...project,
                        theme: { ...project.theme, fontFamily: e.target.value },
                      })
                    }
                  >
                    {GOOGLE_FONTS.map((font) => (
                      <option key={font} value={font} className="bg-dark text-white">
                        {font.split(",")[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-3 border mt-2" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div className="small fw-semibold text-white mb-1">Apply Tokens to Template</div>
                  <p className="small mb-3" style={{ fontSize: "0.78rem", color: "#BFC7D2" }}>
                    Explicitly update template sections with these brand tokens.
                  </p>
                  <button
                    type="button"
                    className="sb-btn-primary btn-sm w-100 fw-semibold"
                    onClick={() => {
                      commitChange(project);
                      showToast("Applied brand tokens across project.");
                    }}
                  >
                    Apply Brand Tokens
                  </button>
                </div>
              </div>
            )}

            {/* TAB 8: ASSET MANAGER */}
            {leftTab === "assets" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold text-white mb-0">Project Media Assets</h6>
                  <span className="badge border small" style={{ backgroundColor: "#151A24", borderColor: "#303947", color: "#A3FF6F" }}>
                    Media Library
                  </span>
                </div>
                <p className="small mb-2" style={{ color: "#D1D5DB" }}>Manage image assets, alt text, and replacement.</p>

                <div className="d-flex flex-column gap-3">
                  {project.sections
                    .filter((sec) => sec.content.imageUrl || sec.content.videoUrl)
                    .map((sec) => (
                      <div key={sec.id} className="p-2.5 rounded-3 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="small fw-semibold text-white text-truncate">{sec.name}</span>
                          <span className="badge border font-monospace small" style={{ fontSize: "0.65rem", backgroundColor: "#10141C", borderColor: "#303947", color: "#A3FF6F" }}>
                            {sec.content.videoUrl ? "VIDEO" : "IMAGE"}
                          </span>
                        </div>

                        {sec.content.imageUrl && (
                          <div>
                            <img
                              src={sec.content.imageUrl}
                              alt={sec.content.title || "Section media"}
                              className="rounded-2 w-100 mb-2 border"
                              style={{ maxHeight: 110, objectFit: "cover", borderColor: "#303947" }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <label className="form-label small" style={{ fontSize: "0.74rem" }}>Alt Text</label>
                            <input
                              type="text"
                              className="form-control form-control-sm mb-2"
                              value={sec.content.imageMetadata?.alt || sec.content.title || ""}
                              placeholder="Descriptive alt text for SEO & a11y..."
                              onChange={(e) => {
                                updateSelectedSection((curr) => ({
                                  ...curr,
                                  content: {
                                    ...curr.content,
                                    imageMetadata: {
                                      url: curr.content.imageUrl || "",
                                      width: 800,
                                      height: 600,
                                      alt: e.target.value,
                                      source: curr.content.imageMetadata?.source || "curated",
                                    },
                                  },
                                }));
                              }}
                            />
                          </div>
                        )}

                        {sec.content.videoUrl && (
                          <div className="small font-monospace text-truncate p-1.5 rounded mb-2" style={{ backgroundColor: "#10141C", color: "#A3FF6F", fontSize: "0.72rem" }}>
                            {sec.content.videoUrl}
                          </div>
                        )}

                        <button
                          type="button"
                          className="btn btn-sm w-100 border text-white d-flex align-items-center justify-content-center gap-1.5"
                          style={{ backgroundColor: "#202938", borderColor: "#303947", fontSize: "0.78rem" }}
                          onClick={() => {
                            setSelectedSectionId(sec.id);
                            setShowImageFinderModal(true);
                          }}
                        >
                          <Camera size={13} />
                          <span>Replace Media</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ======================================================================
            2.2 CENTER CANVAS: LIVE WEBSITE PREVIEW
            ====================================================================== */}
        <section className="editor-canvas-area flex-grow-1 overflow-auto p-3 d-flex justify-content-center position-relative">
          <div className={`viewport-frame-wrapper viewport-${viewportMode} w-100`} style={{ maxWidth: viewportMode === "mobile" ? "420px" : viewportMode === "tablet" ? "820px" : "1200px" }}>
            <div className="preview-browser-frame shadow-2xl mb-4 rounded-4 overflow-hidden border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
              <div className="browser-header-bar p-2.5 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
                <div className="d-flex align-items-center gap-2">
                  <div className="browser-dots d-flex gap-1.5">
                    <span className="rounded-circle bg-danger d-inline-block" style={{ width: 10, height: 10 }}></span>
                    <span className="rounded-circle bg-warning d-inline-block" style={{ width: 10, height: 10 }}></span>
                    <span className="rounded-circle bg-success d-inline-block" style={{ width: 10, height: 10 }}></span>
                  </div>
                  <div className="badge border px-3 py-1 font-monospace small" style={{ backgroundColor: "#0B0D12", borderColor: "#303947", color: "#A3FF6F" }}>
                    https://{project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.sitegenai.app
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {(isW1 || isW2) && (
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className="btn btn-xs py-0.5 px-2 border"
                        style={{
                          backgroundColor: canvasViewMode === "visual" ? "#A3FF6F" : "#151A24",
                          color: canvasViewMode === "visual" ? "#0B0D12" : "#FFFFFF",
                          borderColor: "#303947",
                          fontWeight: 600,
                          fontSize: "0.72rem",
                        }}
                        onClick={() => setCanvasViewMode("visual")}
                      >
                        Visual Editor
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs py-0.5 px-2 border"
                        style={{
                          backgroundColor: canvasViewMode === "native" ? "#A3FF6F" : "#151A24",
                          color: canvasViewMode === "native" ? "#0B0D12" : "#FFFFFF",
                          borderColor: "#303947",
                          fontWeight: 600,
                          fontSize: "0.72rem",
                        }}
                        onClick={() => setCanvasViewMode("native")}
                        title="View exact native GSAP animations and looping videos"
                      >
                        Native Template (Live GSAP)
                      </button>
                    </div>
                  )}
                  <span className="badge border small fw-semibold" style={{ backgroundColor: "#202938", borderColor: "#303947", color: "#BFC7D2" }}>
                    {viewportMode.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Live Rendered Canvas with Strict Template Preservation */}
              {canvasViewMode === "native" && (isW1 || isW2) ? (
                <iframe
                  src={isW1 ? "/templates/w1/index.html" : "/templates/w2/index.html"}
                  title={`${project.name} Native View`}
                  className="w-100 border-0"
                  style={{
                    height: "calc(100vh - 170px)",
                    minHeight: "750px",
                    display: "block",
                    backgroundColor: isW2 ? "#080504" : "#FFFFFF",
                  }}
                />
              ) : (
                <div
                  className={`rendered-website-canvas ${isW2 ? "template-theme-dark" : "template-theme-light"} preview-scroll-container`}
                  style={{
                    backgroundColor: isW2 ? "#080504" : (project.theme?.backgroundColor || "#FFFFFF"),
                    minHeight: "750px",
                  }}
                >
                  <SectionRenderer
                    sections={project.sections}
                    theme={project.theme}
                    selectedSectionId={selectedSectionId || undefined}
                    onSelectSection={(id) => setSelectedSectionId(id)}
                    selectedElement={selectedElement}
                    onSelectElement={(info) => setSelectedElement(info)}
                    onInlineTextChange={handleInlineTextChange}
                    isEditableCanvas={!isPreviewMode}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================================
            2.3 RIGHT PROPERTIES PANEL: ELEMENT INSPECTOR & STYLING CONTROLS
            ====================================================================== */}
        {!isPreviewMode && selectedSection && (
          <aside
            className="editor-sidebar-right p-0 d-flex flex-column border-start"
            style={{
              width: "350px",
              minWidth: "350px",
              zIndex: 10,
              backgroundColor: "#10141C",
              borderColor: "#303947",
            }}
          >
            {/* Element Header */}
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
              <div>
                <h6 className="fw-bold text-white mb-0">{selectedElement ? selectedElement.elementType.toUpperCase() : "SECTION"}</h6>
                <small style={{ color: "#BFC7D2" }}>{selectedElement?.elementId || selectedSection.name}</small>
              </div>
              <span className="badge border font-monospace small" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F", borderColor: "rgba(163, 255, 111, 0.35)" }}>
                Visual Inspector
              </span>
            </div>

            {/* Properties Navigation Tabs */}
            <div
              className="d-flex border-bottom px-2 pt-2 gap-1 overflow-x-auto flex-shrink-0"
              style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
            >
              {[
                { id: "content", label: "Content" },
                { id: "typography", label: "Typography" },
                { id: "dimensions", label: "Dimensions" },
                { id: "styling", label: "Colors" },
                { id: "icons", label: "Icons" },
              ].map((tab) => {
                const isActive = propertiesTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className="btn btn-sm py-1.5 px-2.5 border-0 fw-semibold small transition-all"
                    style={{
                      color: isActive ? "#A3FF6F" : "#BFC7D2",
                      backgroundColor: isActive ? "#10141C" : "transparent",
                      borderBottom: isActive ? "2px solid #A3FF6F" : "2px solid transparent",
                      borderRadius: "6px 6px 0 0",
                      fontSize: "0.82rem",
                    }}
                    onClick={() => setPropertiesTab(tab.id as any)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB: CONTENT CONTROLS */}
            {propertiesTab === "content" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                {selectedSection.content.title !== undefined && (
                  <div>
                    <label className="form-label small fw-semibold">Heading / Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={selectedSection.content.title || ""}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          content: { ...sec.content, title: e.target.value },
                        }))
                      }
                    />
                  </div>
                )}

                {selectedSection.content.subtitle !== undefined && (
                  <div>
                    <label className="form-label small fw-semibold">Subheading</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={selectedSection.content.subtitle || ""}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          content: { ...sec.content, subtitle: e.target.value },
                        }))
                      }
                    />
                  </div>
                )}

                {selectedSection.content.description !== undefined && (
                  <div>
                    <label className="form-label small fw-semibold">Body Description / Paragraph</label>
                    <textarea
                      rows={3}
                      className="form-control form-control-sm"
                      value={selectedSection.content.description || ""}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          content: { ...sec.content, description: e.target.value },
                        }))
                      }
                    />
                  </div>
                )}

                {selectedSection.content.buttonText !== undefined && (
                  <div>
                    <label className="form-label small fw-semibold">Primary Button Text</label>
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      value={selectedSection.content.buttonText || ""}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          content: { ...sec.content, buttonText: e.target.value },
                        }))
                      }
                    />
                    <label className="form-label small fw-semibold">Button Target Link</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={selectedSection.content.buttonLink || "#"}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          content: { ...sec.content, buttonLink: e.target.value },
                        }))
                      }
                    />
                  </div>
                )}

                {selectedSection.content.imageUrl && (
                  <div>
                    <label className="form-label small fw-semibold">Featured Image URL</label>
                    <div className="d-flex gap-2 mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={selectedSection.content.imageUrl || ""}
                        onChange={(e) =>
                          updateSelectedSection((sec) => ({
                            ...sec,
                            content: { ...sec.content, imageUrl: e.target.value },
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-sm flex-shrink-0 text-white border"
                        style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
                        onClick={() => setShowImageFinderModal(true)}
                        title="Discover stock photograph"
                      >
                        <Camera size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: TYPOGRAPHY CONTROLS */}
            {propertiesTab === "typography" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                {/* Font Size with Stepper Number Input and +/- buttons */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold mb-0">Font Size (px)</label>
                    <span className="badge border font-monospace small" style={{ backgroundColor: "#151A24", borderColor: "#303947", color: "#A3FF6F" }}>
                      {activeCustomStyle.fontSize || "Default"}
                    </span>
                  </div>
                  <div className="input-group input-group-sm">
                    <button
                      type="button"
                      className="btn text-white border"
                      style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
                      onClick={() => stepFontSize(-2)}
                      title="Decrease font size by 2px"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="form-control text-center font-monospace"
                      value={parseInt(String(activeCustomStyle.fontSize || 16), 10)}
                      onChange={(e) => updateSelectedElementStyle({ fontSize: Math.max(10, parseInt(e.target.value, 10) || 16) })}
                    />
                    <button
                      type="button"
                      className="btn text-white border"
                      style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
                      onClick={() => stepFontSize(2)}
                      title="Increase font size by 2px"
                    >
                      +
                    </button>
                  </div>

                  {/* Preset Size Buttons */}
                  <div className="d-flex gap-1 mt-2">
                    {[
                      { l: "SM", v: 14 },
                      { l: "MD", v: 16 },
                      { l: "LG", v: 22 },
                      { l: "XL", v: 32 },
                      { l: "2XL", v: 48 },
                    ].map((p) => (
                      <button
                        key={p.l}
                        type="button"
                        className="btn btn-sm border flex-grow-1 small py-1 text-white"
                        style={{ fontSize: "0.72rem", backgroundColor: "#151A24", borderColor: "#303947" }}
                        onClick={() => updateSelectedElementStyle({ fontSize: p.v })}
                      >
                        {p.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="form-label small fw-semibold">Font Family</label>
                  <select
                    className="form-select form-select-sm"
                    value={activeCustomStyle.fontFamily || ""}
                    onChange={(e) => updateSelectedElementStyle({ fontFamily: e.target.value })}
                  >
                    <option value="" className="bg-dark text-white">Theme Default</option>
                    {GOOGLE_FONTS.map((f) => (
                      <option key={f} value={f} className="bg-dark text-white">
                        {f.split(",")[0]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Weight */}
                <div>
                  <label className="form-label small fw-semibold">Font Weight</label>
                  <select
                    className="form-select form-select-sm"
                    value={activeCustomStyle.fontWeight || ""}
                    onChange={(e) => updateSelectedElementStyle({ fontWeight: e.target.value })}
                  >
                    <option value="" className="bg-dark text-white">Default Weight</option>
                    {FONT_WEIGHTS.map((w) => (
                      <option key={w.value} value={w.value} className="bg-dark text-white">
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="form-label small fw-semibold">Text Alignment</label>
                  <div className="btn-group btn-group-sm w-100" role="group">
                    {[
                      { align: "left", icon: <AlignLeft size={14} /> },
                      { align: "center", icon: <AlignCenter size={14} /> },
                      { align: "right", icon: <AlignRight size={14} /> },
                      { align: "justify", icon: <AlignJustify size={14} /> },
                    ].map((item) => {
                      const isAlignActive = activeCustomStyle.textAlign === item.align;
                      return (
                        <button
                          key={item.align}
                          type="button"
                          className="btn border"
                          style={{
                            backgroundColor: isAlignActive ? "#A3FF6F" : "#151A24",
                            color: isAlignActive ? "#0B0D12" : "#FFFFFF",
                            borderColor: "#303947",
                          }}
                          onClick={() => updateSelectedElementStyle({ textAlign: item.align as any })}
                        >
                          {item.icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="form-label small fw-semibold">Text Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={activeCustomStyle.color || "#FFFFFF"}
                      onChange={(e) => updateSelectedElementStyle({ color: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      value={activeCustomStyle.color || "#FFFFFF"}
                      onChange={(e) => updateSelectedElementStyle({ color: e.target.value })}
                    />
                  </div>
                </div>

                {/* Line Height & Letter Spacing */}
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Line Height</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="2.5"
                      className="form-control form-control-sm"
                      value={activeCustomStyle.lineHeight || 1.4}
                      onChange={(e) => updateSelectedElementStyle({ lineHeight: parseFloat(e.target.value) || 1.4 })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Letter Spacing</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="-0.02em"
                      value={activeCustomStyle.letterSpacing || ""}
                      onChange={(e) => updateSelectedElementStyle({ letterSpacing: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DIMENSIONS & SPACING */}
            {propertiesTab === "dimensions" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                {/* Width */}
                <div>
                  <label className="form-label small fw-semibold">Width / Max Width</label>
                  <select
                    className="form-select form-select-sm"
                    value={activeCustomStyle.maxWidth || ""}
                    onChange={(e) => updateSelectedElementStyle({ maxWidth: e.target.value })}
                  >
                    <option value="" className="bg-dark text-white">100% (Default)</option>
                    <option value="400px" className="bg-dark text-white">400px (Compact)</option>
                    <option value="600px" className="bg-dark text-white">600px (Standard)</option>
                    <option value="800px" className="bg-dark text-white">800px (Wide)</option>
                    <option value="1000px" className="bg-dark text-white">1000px (Full Container)</option>
                  </select>
                </div>

                {/* Padding */}
                <div>
                  <label className="form-label small fw-semibold">Padding (px)</label>
                  <input
                    type="range"
                    min="0"
                    max="64"
                    className="form-range"
                    value={parseInt(String(activeCustomStyle.padding || 0), 10)}
                    onChange={(e) => updateSelectedElementStyle({ padding: `${e.target.value}px` })}
                  />
                  <div className="d-flex justify-content-between small" style={{ color: "#BFC7D2" }}>
                    <span>0px</span>
                    <span className="font-monospace fw-bold text-white">{activeCustomStyle.padding || "0px"}</span>
                    <span>64px</span>
                  </div>
                </div>

                {/* Margin */}
                <div>
                  <label className="form-label small fw-semibold">Margin (px)</label>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    className="form-range"
                    value={parseInt(String(activeCustomStyle.margin || 0), 10)}
                    onChange={(e) => updateSelectedElementStyle({ margin: `${e.target.value}px` })}
                  />
                  <div className="d-flex justify-content-between small" style={{ color: "#BFC7D2" }}>
                    <span>0px</span>
                    <span className="font-monospace fw-bold text-white">{activeCustomStyle.margin || "0px"}</span>
                    <span>48px</span>
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <label className="form-label small fw-semibold">Border Radius</label>
                  <div className="d-flex flex-wrap gap-1">
                    {BORDER_RADIUS_PRESETS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        className="btn btn-sm border"
                        onClick={() => updateSelectedElementStyle({ borderRadius: r.value })}
                        style={{
                          fontSize: "0.72rem",
                          backgroundColor: activeCustomStyle.borderRadius === r.value ? "#A3FF6F" : "#151A24",
                          color: activeCustomStyle.borderRadius === r.value ? "#0B0D12" : "#FFFFFF",
                          borderColor: "#303947",
                          fontWeight: 600,
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: COLORS & STYLING */}
            {propertiesTab === "styling" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                {/* Background Color */}
                <div>
                  <label className="form-label small fw-semibold">Element Background Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={activeCustomStyle.backgroundColor || "#151A24"}
                      onChange={(e) => updateSelectedElementStyle({ backgroundColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      value={activeCustomStyle.backgroundColor || ""}
                      placeholder="transparent"
                      onChange={(e) => updateSelectedElementStyle({ backgroundColor: e.target.value })}
                    />
                  </div>
                </div>

                {/* Border Styling */}
                <div>
                  <label className="form-label small fw-semibold">Border Width &amp; Style</label>
                  <div className="d-flex gap-2 mb-2">
                    <select
                      className="form-select form-select-sm"
                      value={activeCustomStyle.borderStyle || "none"}
                      onChange={(e) => updateSelectedElementStyle({ borderStyle: e.target.value })}
                    >
                      <option value="none" className="bg-dark text-white">None</option>
                      <option value="solid" className="bg-dark text-white">Solid</option>
                      <option value="dashed" className="bg-dark text-white">Dashed</option>
                      <option value="dotted" className="bg-dark text-white">Dotted</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="form-control form-control-sm"
                      placeholder="1px"
                      value={parseInt(String(activeCustomStyle.borderWidth || 0), 10)}
                      onChange={(e) => updateSelectedElementStyle({ borderWidth: `${e.target.value}px` })}
                    />
                  </div>
                  <label className="form-label small fw-semibold">Border Color</label>
                  <input
                    type="color"
                    className="form-control form-control-color w-100"
                    value={activeCustomStyle.borderColor || "#303947"}
                    onChange={(e) => updateSelectedElementStyle({ borderColor: e.target.value })}
                  />
                </div>

                {/* Box Shadow */}
                <div>
                  <label className="form-label small fw-semibold">Box Shadow Presets</label>
                  <select
                    className="form-select form-select-sm"
                    value={activeCustomStyle.boxShadow || "none"}
                    onChange={(e) => updateSelectedElementStyle({ boxShadow: e.target.value })}
                  >
                    {SHADOW_PRESETS.map((s) => (
                      <option key={s.value} value={s.value} className="bg-dark text-white">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TAB: ICONS */}
            {propertiesTab === "icons" && (
              <div className="p-3 d-flex flex-column gap-3 overflow-y-auto flex-grow-1">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold mb-0">Attached Vector Icon</label>
                    {activeCustomStyle.iconName && (
                      <button
                        type="button"
                        className="btn btn-xs btn-outline-danger py-0 px-2 small"
                        onClick={() => updateSelectedElementStyle({ iconName: undefined })}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {activeCustomStyle.iconName ? (
                    <div className="p-3 rounded-3 border d-flex align-items-center gap-3" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                      <div className="p-2 rounded text-dark" style={{ backgroundColor: "#A3FF6F" }}>
                        {renderRegisteredIcon(activeCustomStyle.iconName, { size: 20 })}
                      </div>
                      <div>
                        <div className="fw-bold small text-white">{activeCustomStyle.iconName}</div>
                        <small style={{ color: "#BFC7D2" }}>Attached to element</small>
                      </div>
                    </div>
                  ) : (
                    <p className="small mb-2" style={{ color: "#D1D5DB" }}>No vector icon attached. Pick one below:</p>
                  )}
                </div>

                {/* Quick Icon Selector */}
                <div className="row g-2 overflow-y-auto">
                  {ICON_REGISTRY.slice(0, 16).map((iconDef) => (
                    <div key={iconDef.name} className="col-3">
                      <button
                        type="button"
                        className="btn p-2 w-100 d-flex flex-column align-items-center justify-content-center border"
                        style={{
                          height: 52,
                          backgroundColor: activeCustomStyle.iconName === iconDef.name ? "#A3FF6F" : "#151A24",
                          color: activeCustomStyle.iconName === iconDef.name ? "#0B0D12" : "#FFFFFF",
                          borderColor: "#303947",
                        }}
                        onClick={() => updateSelectedElementStyle({ iconName: iconDef.name })}
                      >
                        {renderRegisteredIcon(iconDef.name, { size: 16 })}
                        <span className="small text-truncate mt-1" style={{ fontSize: "0.6rem", maxWidth: "100%" }}>
                          {iconDef.name}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Icon Size */}
                <div>
                  <label className="form-label small fw-semibold">Icon Size (px)</label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    className="form-range"
                    value={activeCustomStyle.iconSize || 18}
                    onChange={(e) => updateSelectedElementStyle({ iconSize: parseInt(e.target.value, 10) })}
                  />
                  <div className="d-flex justify-content-between small" style={{ color: "#BFC7D2" }}>
                    <span>12px</span>
                    <span className="font-monospace fw-bold text-white">{activeCustomStyle.iconSize || 18}px</span>
                    <span>48px</span>
                  </div>
                </div>

                {/* Icon Color */}
                <div>
                  <label className="form-label small fw-semibold">Icon Color</label>
                  <input
                    type="color"
                    className="form-control form-control-color w-100"
                    value={activeCustomStyle.iconColor || "#A3FF6F"}
                    onChange={(e) => updateSelectedElementStyle({ iconColor: e.target.value })}
                  />
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ========================================================================
          3. MODALS
          ======================================================================== */}
      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-2xl rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
              <div className="modal-header border-bottom py-3 px-4" style={{ borderColor: "#303947" }}>
                <h5 className="modal-title fw-bold text-white mb-0">Add New Section to Website</h5>
                <button type="button" className="btn btn-sm text-white border p-1 rounded-circle" style={{ backgroundColor: "#202938", borderColor: "#303947" }} onClick={() => setShowAddSectionModal(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-2">
                  {[
                    { type: "hero", label: "Hero Banner" },
                    { type: "features", label: "Features Bento Grid" },
                    { type: "product", label: "Product Catalog" },
                    { type: "story", label: "Brand Story Split" },
                    { type: "testimonials", label: "Customer Reviews" },
                    { type: "gallery", label: "Media Showcase" },
                    { type: "faq", label: "FAQ Accordion" },
                    { type: "cta", label: "Conversion Banner" },
                  ].map((s) => (
                    <div key={s.type} className="col-6">
                      <button
                        type="button"
                        className="btn border p-3 w-100 text-start rounded-3 transition-all"
                        style={{ backgroundColor: "#10141C", borderColor: "#303947", color: "#FFFFFF" }}
                        onClick={() => handleAddSection(s.type as SectionType, s.label)}
                      >
                        <div className="fw-bold small text-white">{s.label}</div>
                        <small style={{ color: "#BFC7D2" }}>{s.type} block</small>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-2xl rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
              <div className="modal-header border-bottom py-3 px-4" style={{ borderColor: "#303947" }}>
                <h5 className="modal-title fw-bold text-white mb-0">Export Standalone Website</h5>
                <button type="button" className="btn btn-sm text-white border p-1 rounded-circle" style={{ backgroundColor: "#202938", borderColor: "#303947" }} onClick={() => setShowExportModal(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body p-4 text-center">
                <div className="p-3 rounded-circle d-inline-flex mb-3" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}>
                  <Download size={38} />
                </div>
                <h5 className="fw-bold text-white mb-2">Ready to Download</h5>
                <p className="small mb-4" style={{ color: "#D1D5DB" }}>
                  Exporting generates a production-ready ZIP containing HTML, Vanilla CSS, components, images, and project configuration.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="sb-btn-primary px-4 fw-semibold"
                    disabled={isExportingZip}
                    onClick={handleExportZip}
                  >
                    {isExportingZip ? "Packaging ZIP..." : "Download ZIP Package"}
                  </button>
                  <button
                    type="button"
                    className="btn border px-3 text-white"
                    style={{ backgroundColor: "#202938", borderColor: "#303947" }}
                    onClick={() => setShowExportModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Finder Modal */}
      {showImageFinderModal && selectedSection && (
        <ImageFinderModal
          isOpen={showImageFinderModal}
          onClose={() => setShowImageFinderModal(false)}
          title={`Discover Photo for ${selectedSection.name}`}
          initialQuery={selectedSection.content.title || selectedSection.name}
          onSelectImage={(img) => {
            updateSelectedSection((sec) => ({
              ...sec,
              content: {
                ...sec.content,
                imageUrl: img.url,
                imageMetadata: img,
              },
            }));
            setShowImageFinderModal(false);
            showToast("Updated section photo from stock library.");
          }}
        />
      )}

      {/* Confirm Delete Section Modal */}
      {deleteSectionTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Section"
          message="Are you sure you want to remove this section? This action can be undone with Ctrl+Z."
          confirmLabel="Delete Section"
          isDestructive={true}
          onConfirm={confirmDeleteSection}
          onCancel={() => setDeleteSectionTarget(null)}
        />
      )}

      {/* Localhost Managed Server Modal */}
      {showLocalhostModal && project && (
        <LocalhostModal
          project={project}
          isOpen={showLocalhostModal}
          onClose={() => setShowLocalhostModal(false)}
        />
      )}

      {/* AI Website Improvement Assistant Modal */}
      {showAiModal && project && (
        <AiAssistantModal
          project={project}
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onApplyImprovement={handleApplyImprovement}
          onApplyAllImprovements={handleApplyAllImprovements}
        />
      )}

      {/* Responsive Design Testing Lab Modal */}
      {showResponsiveLabModal && project && (
        <ResponsiveLabModal
          project={project}
          isOpen={showResponsiveLabModal}
          onClose={() => setShowResponsiveLabModal(false)}
          onApplyResponsiveFix={handleApplyResponsiveFix}
        />
      )}

      {/* SEO & Accessibility Audit Modal */}
      {showSeoModal && project && (
        <SeoAuditModal
          project={project}
          isOpen={showSeoModal}
          onClose={() => setShowSeoModal(false)}
          onApplySeoFix={handleApplySeoFix}
        />
      )}

      {/* Version History & Safe Restore Modal */}
      {showVersionHistoryModal && project && (
        <VersionHistoryModal
          project={project}
          isOpen={showVersionHistoryModal}
          onClose={() => setShowVersionHistoryModal(false)}
          onRestoreSnapshot={handleRestoreSnapshot}
        />
      )}

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onRunLocalhost={() => setShowLocalhostModal(true)}
        onPreview={() => setIsPreviewMode((prev) => !prev)}
        onSave={handleSave}
        onExport={() => setShowExportModal(true)}
        onOpenAiAssistant={() => setShowAiModal(true)}
        onOpenResponsiveLab={() => setShowResponsiveLabModal(true)}
        onOpenSeoAudit={() => setShowSeoModal(true)}
        onOpenVersionHistory={() => setShowVersionHistoryModal(true)}
        onSetViewport={(mode) => setViewportMode(mode)}
        onOpenBrandKit={() => setLeftTab("brand")}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="sg-toast-container">
          <div className="sg-toast" style={{ backgroundColor: "#151A24", border: "1px solid #303947" }}>
            <CheckCircle2 size={18} className="sb-text-emerald flex-shrink-0" />
            <span style={{ color: "#F1F5F9" }}>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
