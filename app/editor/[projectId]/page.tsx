"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ViewportSwitcher, { ViewportMode } from "@/components/ui/ViewportSwitcher";
import SectionRenderer from "@/components/preview/SectionRenderer";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { projectService } from "@/lib/projects/projectService";
import { WebsiteDocument, WebsiteSection, SectionType } from "@/types/project";
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
} from "lucide-react";
import ProjectSettingsModal from "@/components/ui/ProjectSettingsModal";
import VideoGeneratorModal from "@/components/ui/VideoGeneratorModal";
import AssetUploader from "@/components/ui/AssetUploader";
import { UploadedAsset } from "@/types/asset";

interface EditorPageProps {
  params: Promise<{ projectId: string }>;
}

function VisualEditorInner({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  const router = useRouter();

  // Document & History State
  const [project, setProject] = useState<WebsiteDocument | null>(null);
  const [historyPast, setHistoryPast] = useState<WebsiteDocument[]>([]);
  const [historyFuture, setHistoryFuture] = useState<WebsiteDocument[]>([]);

  // Selection & UI State
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "style" | "layout" | "animation" | "assets">("content");
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  // Modals & Export States
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [deleteSectionTarget, setDeleteSectionTarget] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load project on mount
  useEffect(() => {
    const loaded = projectService.getProjectById(projectId);
    if (loaded) {
      setProject(loaded);
      if (loaded.sections.length > 0) {
        setSelectedSectionId(loaded.sections[0].id);
      }
    } else {
      // Fallback create default
      const defaultDoc = projectService.createFromTemplate("w1", "My Website Project");
      setProject(defaultDoc);
      setSelectedSectionId(defaultDoc.sections[0]?.id || null);
    }
  }, [projectId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Push new state to history for undo/redo
  const commitChange = (nextProject: WebsiteDocument) => {
    if (!project) return;
    setHistoryPast((prev) => [...prev.slice(-20), JSON.parse(JSON.stringify(project))]);
    setHistoryFuture([]);
    setProject(nextProject);
    setSaveStatus("saving");

    // Save to storage
    projectService.saveProject(nextProject);
    setTimeout(() => setSaveStatus("saved"), 350);
  };

  // UNDO
  const handleUndo = () => {
    if (historyPast.length === 0 || !project) return;
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, historyPast.length - 1);

    setHistoryFuture((prev) => [JSON.parse(JSON.stringify(project)), ...prev]);
    setHistoryPast(newPast);
    setProject(previous);
    projectService.saveProject(previous);
    showToast("Action undone.");
  };

  // REDO
  const handleRedo = () => {
    if (historyFuture.length === 0 || !project) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    setHistoryPast((prev) => [...prev, JSON.parse(JSON.stringify(project))]);
    setHistoryFuture(newFuture);
    setProject(next);
    projectService.saveProject(next);
    showToast("Action redone.");
  };

  // Selected Section Object
  const selectedSection = project?.sections.find((s) => s.id === selectedSectionId);

  // Update Section Helper
  const updateSelectedSection = (updater: (sec: WebsiteSection) => WebsiteSection) => {
    if (!project || !selectedSectionId) return;
    const nextSections = project.sections.map((sec) => {
      if (sec.id === selectedSectionId) {
        return updater(sec);
      }
      return sec;
    });
    commitChange({ ...project, sections: nextSections });
  };

  // Section Tree Operations
  const moveSection = (index: number, direction: "up" | "down") => {
    if (!project) return;
    const newSections = [...project.sections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    commitChange({ ...project, sections: newSections });
  };

  const toggleSectionVisibility = (secId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project) return;
    const newSections = project.sections.map((s) => (s.id === secId ? { ...s, visible: !s.visible } : s));
    commitChange({ ...project, sections: newSections });
  };

  const duplicateSection = (secId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project) return;
    const target = project.sections.find((s) => s.id === secId);
    if (!target) return;

    const newSec: WebsiteSection = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-${Date.now().toString(36)}`,
      name: `${target.name} (Copy)`,
    };
    const targetIdx = project.sections.findIndex((s) => s.id === secId);
    const newSections = [...project.sections];
    newSections.splice(targetIdx + 1, 0, newSec);

    commitChange({ ...project, sections: newSections });
    setSelectedSectionId(newSec.id);
    showToast(`Duplicated "${target.name}".`);
  };

  const deleteSection = () => {
    if (!project || !deleteSectionTarget) return;
    const newSections = project.sections.filter((s) => s.id !== deleteSectionTarget);
    setDeleteSectionTarget(null);
    commitChange({ ...project, sections: newSections });
    if (selectedSectionId === deleteSectionTarget) {
      setSelectedSectionId(newSections[0]?.id || null);
    }
    showToast("Section removed.");
  };

  // Add Section Types
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
        backgroundColor: "#FFFFFF",
        textColor: "#172033",
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

  // Theme Switcher Presets
  const applyThemePreset = (primary: string, secondary: string, bg: string) => {
    if (!project) return;
    commitChange({
      ...project,
      theme: {
        ...project.theme,
        primaryColor: primary,
        secondaryColor: secondary,
        backgroundColor: bg,
      },
    });
    showToast("Updated project theme.");
  };

  if (!project) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading project editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light overflow-hidden">
      {/* ========================================================================
          10.1 TOP TOOLBAR
          ======================================================================== */}
      <header className="bg-white border-bottom py-2 px-3 d-flex align-items-center justify-content-between gap-3 z-3 shadow-sm">
        {/* Left: Back & Project Title */}
        <div className="d-flex align-items-center gap-3">
          <Link href="/dashboard" className="btn btn-light btn-sm border d-flex align-items-center gap-1">
            <ArrowLeft size={15} />
            <span className="d-none d-sm-inline">Dashboard</span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="fw-bold fs-6 border-0 bg-transparent py-1 px-2 rounded hover-bg-light"
              value={project.name}
              onChange={(e) => {
                const next = { ...project, name: e.target.value };
                setProject(next);
                projectService.saveProject(next);
              }}
              style={{ maxWidth: "260px" }}
              title="Click to rename project"
              id="editor-project-title-input"
            />
            {project.templateSource === "w1" && (
              <span className="badge bg-success-subtle text-success small border border-success-subtle">
                w1 Template
              </span>
            )}
          </div>
        </div>

        {/* Center: Undo/Redo & Viewport Switcher */}
        <div className="d-flex align-items-center gap-2">
          {/* Undo/Redo */}
          <div className="btn-group btn-group-sm me-2" role="group">
            <button
              type="button"
              className="btn btn-light border"
              disabled={historyPast.length === 0}
              onClick={handleUndo}
              title={`Undo (${historyPast.length} available)`}
              id="editor-btn-undo"
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              className="btn btn-light border"
              disabled={historyFuture.length === 0}
              onClick={handleRedo}
              title={`Redo (${historyFuture.length} available)`}
              id="editor-btn-redo"
            >
              <Redo2 size={15} />
            </button>
          </div>

          {/* Viewport Modes */}
          <ViewportSwitcher
            currentMode={viewportMode}
            onChange={setViewportMode}
            size="sm"
          />
        </div>

        {/* Right: Save Status, Preview & Export */}
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted d-none d-lg-flex align-items-center gap-1 me-2">
            <CheckCircle2 size={14} className={saveStatus === "saved" ? "text-success" : "text-muted"} />
            {saveStatus === "saved" ? "Draft Saved" : "Saving..."}
          </small>

          <button
            type="button"
            className="btn btn-sm btn-light border d-flex align-items-center gap-1"
            onClick={() => setShowSettingsModal(true)}
            title="Local Port & Server Settings"
            id="editor-btn-port-settings"
          >
            <Server size={14} className="text-primary" />
            <span className="d-none d-md-inline">Port :{project.localPort || 3000}</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-light border d-flex align-items-center gap-1"
            onClick={() => setShowVideoModal(true)}
            title="Promotional Video Synthesis Studio"
            id="editor-btn-video-studio"
          >
            <Film size={14} className="text-primary" />
            <span className="d-none d-md-inline">AI Videos</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${isPreviewMode ? "btn-primary" : "btn-light border"} d-flex align-items-center gap-1`}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            id="editor-btn-preview-mode"
          >
            <Eye size={15} />
            <span className="d-none d-sm-inline">{isPreviewMode ? "Exit Preview" : "Preview"}</span>
          </button>

          <button
            type="button"
            className="btn btn-sg-primary btn-sg-sm d-flex align-items-center gap-1"
            onClick={() => setShowExportModal(true)}
            id="editor-btn-export"
          >
            <Download size={15} />
            <span>Export ZIP</span>
          </button>
        </div>
      </header>

      {/* ========================================================================
          EDITOR THREE-COLUMN WORKSPACE
          ======================================================================== */}
      <div className="editor-layout flex-grow-1">
        {/* ======================================================================
            10.2 LEFT PANEL: SECTION TREE & PAGES
            ====================================================================== */}
        {!isPreviewMode && (
          <aside className="editor-sidebar-left p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Layout size={16} className="text-primary" />
                Section Tree
              </h6>
              <button
                type="button"
                className="btn btn-sm btn-sg-primary py-1 px-2 d-flex align-items-center gap-1"
                onClick={() => setShowAddSectionModal(true)}
                id="btn-open-add-section-modal"
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            <small className="text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>
              {project.sections.length} SECTIONS ON CURRENT PAGE
            </small>

            {/* Sections List */}
            <div className="d-flex flex-column gap-2 overflow-y-auto flex-grow-1">
              {project.sections.map((sec, idx) => {
                const isSelected = selectedSectionId === sec.id;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`p-2 rounded-3 border d-flex align-items-center justify-content-between gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary-subtle border-primary text-primary fw-semibold shadow-sm"
                        : "bg-white text-dark hover-bg-light"
                    } ${!sec.visible ? "opacity-50" : ""}`}
                    style={{ cursor: "pointer" }}
                    id={`tree-item-${sec.id}`}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: "0.68rem" }}>
                        {idx + 1}
                      </span>
                      <span className="small text-truncate">{sec.name}</span>
                    </div>

                    <div className="d-flex align-items-center gap-1 flex-shrink-0">
                      {/* Move Up/Down */}
                      <button
                        type="button"
                        className="btn btn-light btn-sm p-1 border-0"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(idx, "up");
                        }}
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-light btn-sm p-1 border-0"
                        disabled={idx === project.sections.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(idx, "down");
                        }}
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        className="btn btn-light btn-sm p-1 border-0"
                        onClick={(e) => toggleSectionVisibility(sec.id, e)}
                        title={sec.visible ? "Hide section" : "Show section"}
                      >
                        {sec.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-muted" />}
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        className="btn btn-light btn-sm p-1 border-0"
                        onClick={(e) => duplicateSection(sec.id, e)}
                        title="Duplicate"
                      >
                        <Copy size={12} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className="btn btn-light btn-sm p-1 border-0 text-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteSectionTarget(sec.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Theme Presets */}
            <div className="pt-3 border-top mt-3">
              <small className="fw-bold text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>
                THEME PALETTE
              </small>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-light border p-1 rounded-circle"
                  style={{ backgroundColor: "#356DFF", width: 22, height: 22 }}
                  onClick={() => applyThemePreset("#356DFF", "#0F172A", "#FFFFFF")}
                  title="Oceanic Blue"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-light border p-1 rounded-circle"
                  style={{ backgroundColor: "#087FE5", width: 22, height: 22 }}
                  onClick={() => applyThemePreset("#087FE5", "#071B32", "#FFFFFF")}
                  title="Coco Pour (w1)"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-light border p-1 rounded-circle"
                  style={{ backgroundColor: "#10B981", width: 22, height: 22 }}
                  onClick={() => applyThemePreset("#10B981", "#064E3B", "#FFFFFF")}
                  title="Emerald"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-light border p-1 rounded-circle"
                  style={{ backgroundColor: "#18181B", width: 22, height: 22 }}
                  onClick={() => applyThemePreset("#18181B", "#71717A", "#FAFAFA")}
                  title="Obsidian"
                />
              </div>
            </div>
          </aside>
        )}

        {/* ======================================================================
            10.3 CENTER: WEBSITE CANVAS
            ====================================================================== */}
        <section className="editor-canvas-area">
          <div className={`viewport-frame-wrapper viewport-${viewportMode}`}>
            <div className="preview-browser-frame shadow-lg bg-white mb-4">
              <div className="browser-header-bar">
                <div className="browser-dots">
                  <span className="browser-dot red"></span>
                  <span className="browser-dot yellow"></span>
                  <span className="browser-dot green"></span>
                </div>
                <div className="browser-url-pill">
                  <span>https://{project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.sitegenai.app</span>
                </div>
                <span className="badge bg-light text-secondary border small">
                  {viewportMode.toUpperCase()}
                </span>
              </div>

              {/* Dynamic Section Renderer */}
              <div className="bg-white">
                <SectionRenderer
                  sections={project.sections}
                  theme={project.theme}
                  selectedSectionId={selectedSectionId || undefined}
                  onSelectSection={(id) => setSelectedSectionId(id)}
                  isEditableCanvas={!isPreviewMode}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================
            10.4 RIGHT PROPERTIES PANEL
            ====================================================================== */}
        {!isPreviewMode && selectedSection && (
          <aside className="editor-sidebar-right p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-0">Properties</h6>
                <small className="text-muted">{selectedSection.name}</small>
              </div>
              <span className="badge bg-light text-secondary border font-monospace">
                {selectedSection.type}
              </span>
            </div>

            {/* Properties Navigation Tabs */}
            <div className="nav nav-pills nav-fill bg-light p-1 rounded-3 mb-3" role="tablist">
              <button
                type="button"
                className={`nav-link py-1 px-2 small fw-semibold ${activeTab === "content" ? "active bg-white text-primary shadow-sm" : "text-secondary"}`}
                onClick={() => setActiveTab("content")}
              >
                Content
              </button>
              <button
                type="button"
                className={`nav-link py-1 px-2 small fw-semibold ${activeTab === "style" ? "active bg-white text-primary shadow-sm" : "text-secondary"}`}
                onClick={() => setActiveTab("style")}
              >
                Style
              </button>
              <button
                type="button"
                className={`nav-link py-1 px-2 small fw-semibold ${activeTab === "layout" ? "active bg-white text-primary shadow-sm" : "text-secondary"}`}
                onClick={() => setActiveTab("layout")}
              >
                Layout
              </button>
              <button
                type="button"
                className={`nav-link py-1 px-2 small fw-semibold ${activeTab === "animation" ? "active bg-white text-primary shadow-sm" : "text-secondary"}`}
                onClick={() => setActiveTab("animation")}
              >
                Animation
              </button>
              <button
                type="button"
                className={`nav-link py-1 px-2 small fw-semibold ${activeTab === "assets" ? "active bg-white text-primary shadow-sm" : "text-secondary"}`}
                onClick={() => setActiveTab("assets")}
              >
                Assets
              </button>
            </div>

            {/* TAB 1: CONTENT CONTROLS */}
            {activeTab === "content" && (
              <div className="d-flex flex-column gap-3 overflow-y-auto">
                {selectedSection.content.badge !== undefined && (
                  <div>
                    <label className="sg-form-label">Badge / Tagline</label>
                    <input
                      type="text"
                      className="sg-form-control w-100"
                      value={selectedSection.content.badge || ""}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          content: { ...sec.content, badge: e.target.value },
                        }))
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="sg-form-label">Heading / Title</label>
                  <input
                    type="text"
                    className="sg-form-control w-100"
                    value={selectedSection.content.title || ""}
                    onChange={(e) =>
                      updateSelectedSection((sec) => ({
                        ...sec,
                        content: { ...sec.content, title: e.target.value },
                      }))
                    }
                  />
                </div>

                {selectedSection.content.subtitle !== undefined && (
                  <div>
                    <label className="sg-form-label">Subtitle</label>
                    <input
                      type="text"
                      className="sg-form-control w-100"
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
                    <label className="sg-form-label">Body Text / Description</label>
                    <textarea
                      rows={3}
                      className="sg-form-control w-100"
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
                    <label className="sg-form-label">Primary Button Label</label>
                    <input
                      type="text"
                      className="sg-form-control w-100"
                      value={selectedSection.content.buttonText || ""}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          content: { ...sec.content, buttonText: e.target.value },
                        }))
                      }
                    />
                  </div>
                )}

                {selectedSection.content.secondaryButtonText !== undefined && (
                  <div>
                    <label className="sg-form-label">Secondary Button Label</label>
                    <input
                      type="text"
                      className="sg-form-control w-100"
                      value={selectedSection.content.secondaryButtonText || ""}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          content: { ...sec.content, secondaryButtonText: e.target.value },
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: STYLE CONTROLS */}
            {activeTab === "style" && (
              <div className="d-flex flex-column gap-3 overflow-y-auto">
                <div>
                  <label className="sg-form-label">Background Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color border"
                      value={selectedSection.style.backgroundColor || "#FFFFFF"}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          style: { ...sec.style, backgroundColor: e.target.value },
                        }))
                      }
                    />
                    <input
                      type="text"
                      className="sg-form-control flex-grow-1"
                      value={selectedSection.style.backgroundColor || "#FFFFFF"}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          style: { ...sec.style, backgroundColor: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="sg-form-label">Text Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color border"
                      value={selectedSection.style.textColor || "#172033"}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          style: { ...sec.style, textColor: e.target.value },
                        }))
                      }
                    />
                    <input
                      type="text"
                      className="sg-form-control flex-grow-1"
                      value={selectedSection.style.textColor || "#172033"}
                      onChange={(e) =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          style: { ...sec.style, textColor: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="sg-form-label">Text Alignment</label>
                  <div className="btn-group w-100" role="group">
                    {(["left", "center", "right"] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        className={`btn btn-sm ${
                          selectedSection.style.alignment === align
                            ? "btn-primary text-white"
                            : "btn-light border text-secondary"
                        }`}
                        onClick={() =>
                          updateSelectedSection((sec) => ({
                            ...sec,
                            style: { ...sec.style, alignment: align },
                          }))
                        }
                      >
                        {align.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="sg-form-label">Section Padding</label>
                  <select
                    className="form-select form-select-sm sg-form-control"
                    value={selectedSection.style.paddingY}
                    onChange={(e) =>
                      updateSelectedSection((sec) => ({
                        ...sec,
                        style: { ...sec.style, paddingY: e.target.value as any },
                      }))
                    }
                  >
                    <option value="sm">Small (Compact)</option>
                    <option value="md">Medium (Standard)</option>
                    <option value="lg">Large (Spacious)</option>
                    <option value="xl">Extra Large (Heroic)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 3: LAYOUT CONTROLS */}
            {activeTab === "layout" && (
              <div className="d-flex flex-column gap-3 overflow-y-auto">
                <div className="p-3 rounded-3 bg-light border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold">Section Visibility</span>
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={selectedSection.visible}
                      onChange={() =>
                        updateSelectedSection((sec) => ({
                          ...sec,
                          visible: !sec.visible,
                        }))
                      }
                    />
                  </div>
                  <small className="text-muted d-block">
                    Hidden sections are omitted from the canvas and exported HTML.
                  </small>
                </div>

                <div className="p-3 rounded-3 bg-light border">
                  <small className="fw-bold d-block mb-1">Layout Grid System</small>
                  <p className="small text-muted mb-0">
                    Bootstrap 5.3 Responsive Container &amp; Flexbox Layout
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: ANIMATION CONTROLS */}
            {activeTab === "animation" && (
              <div className="d-flex flex-column gap-3 overflow-y-auto">
                <label className="sg-form-label">Entrance Animation Preset</label>
                {(["none", "fade", "slide-up", "zoom"] as const).map((preset) => (
                  <div
                    key={preset}
                    onClick={() =>
                      updateSelectedSection((sec) => ({
                        ...sec,
                        animation: preset,
                      }))
                    }
                    className={`p-2 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${
                      selectedSection.animation === preset ? "border-primary bg-primary-subtle text-primary fw-bold" : "bg-white"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="small text-capitalize">{preset} Entrance</span>
                    {selectedSection.animation === preset && <Check size={16} />}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: ASSET LIBRARY CONTROLS */}
            {activeTab === "assets" && (
              <div className="d-flex flex-column gap-3 overflow-y-auto">
                <div className="mb-2">
                  <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
                    <ImageIcon size={16} className="text-primary" />
                    Project Media Assets
                  </h6>
                  <p className="small text-secondary mb-0" style={{ fontSize: "0.78rem" }}>
                    Upload brand logos, product photography, or videos. Reusable across sections.
                  </p>
                </div>
                <AssetUploader
                  projectId={project.id}
                  assets={project.assets || []}
                  onAssetsChange={(nextAssets) => {
                    commitChange({ ...project, assets: nextAssets });
                    showToast("Updated project asset library.");
                  }}
                />
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ========================================================================
          ADD SECTION MODAL
          ======================================================================== */}
      {showAddSectionModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header py-3 px-4 border-bottom">
                <h5 className="modal-title fw-bold">Add Section to Website</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddSectionModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <div className="row g-2">
                  {[
                    { type: "hero", name: "Spotlight Hero", desc: "Hero header with headline, copy, and CTAs" },
                    { type: "features", name: "Features Grid", desc: "Three-column benefit cards" },
                    { type: "story", name: "Story & Narrative", desc: "Split text and metrics breakdown" },
                    { type: "tabs", name: "Interactive Moments", desc: "Tabbed moment switcher" },
                    { type: "product", name: "Product Showcase", desc: "Showcase with specs & benefits" },
                    { type: "promo", name: "Promotional Banner", desc: "Electric blue retailer spotlight" },
                    { type: "recipes", name: "Culinary Journal", desc: "Three recipe and card items" },
                    { type: "cta", name: "Call to Action", desc: "Lead magnet or subscription strip" },
                    { type: "footer", name: "Site Footer", desc: "Standard multi-column footer" },
                  ].map((item) => (
                    <div key={item.type} className="col-12 col-sm-6">
                      <div
                        onClick={() => handleAddSection(item.type as SectionType, item.name)}
                        className="p-3 rounded-3 border bg-light hover-bg-white cursor-pointer h-100 transition-all"
                        style={{ cursor: "pointer" }}
                      >
                        <div className="fw-bold small mb-1 text-primary">{item.name}</div>
                        <small className="text-secondary d-block" style={{ fontSize: "0.78rem" }}>
                          {item.desc}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          EXPORT MODAL (STANDALONE ZIP ARCHIVE & SOURCE FILES)
          ======================================================================== */}
      {showExportModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header py-3 px-4 border-bottom">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Download size={20} className="text-primary" />
                  Export &amp; Download Website Package
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowExportModal(false);
                    setExportError(null);
                    setExportSuccess(null);
                  }}
                />
              </div>
              <div className="modal-body p-4">
                <p className="text-secondary small mb-3">
                  Export your website as a real, standalone downloadable ZIP containing semantic HTML5, custom CSS stylesheets, interactive scripts, media assets, and a comprehensive README with local setup instructions.
                </p>

                {/* Primary Action: Download ZIP */}
                <div className="p-4 rounded-4 border bg-primary-subtle border-primary-subtle mb-4 text-center">
                  <h6 className="fw-bold mb-1 text-primary-emphasis">Download Standalone ZIP Archive</h6>
                  <p className="small text-secondary mb-3">
                    Includes all HTML, CSS, JavaScript, media assets, and local dev scripts configured for port {project.localPort || 3000}.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary px-4 py-2 rounded-pill fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                    disabled={isExportingZip}
                    onClick={async () => {
                      setIsExportingZip(true);
                      setExportError(null);
                      setExportSuccess(null);
                      const res = await projectService.downloadProjectZip(project);
                      setIsExportingZip(false);
                      if (res.success) {
                        setExportSuccess("ZIP package generated and downloaded successfully!");
                      } else {
                        setExportError(res.error || "Failed to generate export package.");
                      }
                    }}
                  >
                    {isExportingZip ? (
                      <>
                        <RefreshCw size={16} className="spin" />
                        Packaging ZIP Archive...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Download Production ZIP Package
                      </>
                    )}
                  </button>
                </div>

                {exportSuccess && (
                  <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>{exportSuccess}</span>
                  </div>
                )}

                {exportError && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-danger flex-shrink-0" />
                    <span>{exportError}</span>
                  </div>
                )}

                {/* Exact Local Run Commands */}
                <div className="p-3 rounded-3 border bg-light mb-4">
                  <div className="fw-bold small mb-1 d-flex align-items-center gap-2 text-dark">
                    <Terminal size={15} className="text-primary" />
                    How to Run Locally on Port {project.localPort || 3000}
                  </div>
                  <p className="text-secondary small mb-2">
                    Extract your downloaded ZIP file into a folder, open a terminal there, and run:
                  </p>
                  <pre className="p-2 bg-dark text-success rounded-2 small mb-2">
                    <code>npx -y serve -p {project.localPort || 3000} .</code>
                  </pre>
                  <small className="text-muted d-block">
                    Alternatively, using Python: <code>python -m http.server {project.localPort || 3000}</code>
                  </small>
                </div>

                {/* Secondary Option: JSON Definition */}
                <div className="mb-3">
                  <label className="sg-form-label">Project JSON Definition</label>
                  <textarea
                    rows={4}
                    readOnly
                    className="form-control font-monospace small bg-light"
                    value={JSON.stringify(project, null, 2)}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(project, null, 2));
                      showToast("JSON copied to clipboard!");
                    }}
                  >
                    Copy JSON
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-sitegenai.json`;
                      a.click();
                      showToast("Downloaded JSON draft!");
                    }}
                  >
                    Download JSON File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Settings & Port Selector Modal */}
      {showSettingsModal && (
        <ProjectSettingsModal
          project={project}
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onUpdateProject={(updated) => {
            commitChange(updated);
            showToast(`Local dev port updated to :${updated.localPort || 3000}`);
          }}
        />
      )}

      {/* AI Promotional Video Synthesis Modal */}
      {showVideoModal && (
        <VideoGeneratorModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          brandName={project.name}
          tagline={project.description}
          projectId={project.id}
          onSelectHeroVideo={(videoUrl) => {
            const heroSec = project.sections.find((s) => s.type === "hero");
            if (heroSec) {
              const updated = project.sections.map((s) =>
                s.id === heroSec.id
                  ? {
                      ...s,
                      content: {
                        ...s.content,
                        videoUrl,
                        mediaType: "video" as const,
                      },
                    }
                  : s
              );
              commitChange({ ...project, sections: updated });
              showToast("Applied promotional video to hero section!");
            }
          }}
        />
      )}

      {/* Delete Section Modal */}
      <ConfirmModal
        isOpen={deleteSectionTarget !== null}
        title="Remove Section?"
        message="Are you sure you want to delete this section from your website? You can undo this change using the toolbar Undo button."
        confirmLabel="Remove Section"
        isDestructive={true}
        onConfirm={deleteSection}
        onCancel={() => setDeleteSectionTarget(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="sg-toast-container">
          <div className="sg-toast">
            <CheckCircle2 size={16} className="text-success" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VisualEditorPage({ params }: EditorPageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading visual editor...</span>
          </div>
        </div>
      }
    >
      <VisualEditorInner params={params} />
    </React.Suspense>
  );
}
