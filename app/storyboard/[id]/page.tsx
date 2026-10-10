"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageFinderModal from "@/components/ui/ImageFinderModal";
import {
  StoryboardDocument,
  StoryboardSection,
  StoryboardStatus,
  StoryboardLayoutType,
} from "@/types/storyboard";
import { ImageMetadata, SectionType } from "@/types/project";
import { projectService } from "@/lib/projects/projectService";
import {
  Sparkles,
  ArrowRight,
  Download,
  Edit3,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  Laptop,
  Smartphone,
  Eye,
  Camera,
  Check,
  AlertCircle,
  FileText,
  ChevronRight,
  Sliders,
} from "lucide-react";

export default function StoryboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [storyboard, setStoryboard] = useState<StoryboardDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Viewport mode: desktop composition vs mobile composition
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Photo replacement modal state
  const [replacingSectionId, setReplacingSectionId] = useState<string | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoSearchQuery, setPhotoSearchQuery] = useState("");

  // Approval & Generation state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);

  // PDF Export state
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    loadStoryboard();
  }, [id]);

  const loadStoryboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/storyboard/${id}`);
      const data = await res.json();
      if (data.success && data.storyboard) {
        setStoryboard(data.storyboard);
      } else {
        setError(data.error || "Storyboard not found.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load storyboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!storyboard) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/storyboard/${storyboard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyboard),
      });
      const data = await res.json();
      if (data.success && data.storyboard) {
        setStoryboard(data.storyboard);
        setHasUnsavedChanges(false);
        setSaveToast("All storyboard changes saved successfully.");
        setTimeout(() => setSaveToast(null), 3000);
      }
    } catch (err: any) {
      alert("Failed to save changes: " + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateHeadline = (secId: string, newHeadline: string) => {
    if (!storyboard) return;
    const pages = storyboard.pages.map((p) => ({
      ...p,
      sections: p.sections.map((s) => (s.id === secId ? { ...s, headline: newHeadline } : s)),
    }));
    setStoryboard({ ...storyboard, pages });
    setHasUnsavedChanges(true);
  };

  const handleUpdateSummary = (secId: string, newSummary: string) => {
    if (!storyboard) return;
    const pages = storyboard.pages.map((p) => ({
      ...p,
      sections: p.sections.map((s) => (s.id === secId ? { ...s, contentSummary: newSummary } : s)),
    }));
    setStoryboard({ ...storyboard, pages });
    setHasUnsavedChanges(true);
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (!storyboard) return;
    const currentSections = [...(storyboard.pages[0]?.sections || [])];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentSections.length) return;

    const temp = currentSections[index];
    currentSections[index] = currentSections[targetIdx];
    currentSections[targetIdx] = temp;

    // Re-number sections
    currentSections.forEach((s, idx) => {
      s.sectionNumber = idx + 1;
    });

    const pages = [{ ...storyboard.pages[0], sections: currentSections }];
    setStoryboard({ ...storyboard, pages });
    setHasUnsavedChanges(true);
  };

  const handleDeleteSection = (secId: string) => {
    if (!storyboard) return;
    const filtered = (storyboard.pages[0]?.sections || [])
      .filter((s) => s.id !== secId)
      .map((s, idx) => ({ ...s, sectionNumber: idx + 1 }));

    const pages = [{ ...storyboard.pages[0], sections: filtered }];
    setStoryboard({ ...storyboard, pages });
    setHasUnsavedChanges(true);
  };

  const handleAddSection = () => {
    if (!storyboard) return;
    const current = storyboard.pages[0]?.sections || [];
    const newSec: StoryboardSection = {
      id: `sec-custom-${Date.now().toString(36)}`,
      sectionNumber: current.length + 1,
      name: "Custom Section",
      type: "features",
      headline: "New Custom Section",
      subheadline: "Enter your custom headline",
      contentSummary: "Describe the content and value proposition of this section.",
      layout: "split",
      enabled: true,
    };
    const pages = [{ ...storyboard.pages[0], sections: [...current, newSec] }];
    setStoryboard({ ...storyboard, pages });
    setHasUnsavedChanges(true);
  };

  const handleOpenPhotoModal = (sec: StoryboardSection) => {
    setReplacingSectionId(sec.id);
    const keywords = sec.imageRequirement?.keywords?.join(" ") || sec.name;
    setPhotoSearchQuery(keywords);
    setPhotoModalOpen(true);
  };

  const handleSelectNewPhoto = (image: ImageMetadata) => {
    if (!storyboard || !replacingSectionId) return;

    const pages = storyboard.pages.map((p) => ({
      ...p,
      sections: p.sections.map((s) =>
        s.id === replacingSectionId ? { ...s, selectedImage: image } : s
      ),
    }));

    const updatedManifest = {
      ...storyboard.imageManifest,
      [replacingSectionId]: image,
    };

    setStoryboard({
      ...storyboard,
      pages,
      imageManifest: updatedManifest,
    });
    setHasUnsavedChanges(true);
    setPhotoModalOpen(false);
  };

  // PDF Export Workflow
  const handleExportPdf = async () => {
    if (!storyboard) return;
    if (hasUnsavedChanges) {
      const confirmSave = confirm("You have unsaved changes. Save before exporting to PDF?");
      if (confirmSave) {
        await handleSaveChanges();
      }
    }

    setIsExportingPdf(true);
    try {
      const res = await fetch(`/api/storyboard/${storyboard.id}/pdf`);
      if (!res.ok) {
        throw new Error("Failed to generate PDF document.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${storyboard.projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-storyboard.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert("PDF Export error: " + err?.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Server-Side Explicit Approval & Full Generation
  const handleApproveAndGenerate = async () => {
    if (!storyboard) return;

    if (hasUnsavedChanges) {
      await handleSaveChanges();
    }

    setIsApproving(true);
    setGenerationStage(1); // 1: Approving on server

    try {
      // Step 1: Explicit server-side approval gate
      const approveRes = await fetch(`/api/storyboard/${storyboard.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: storyboard.version }),
      });
      const approveData = await approveRes.json();
      if (!approveRes.ok || !approveData.success) {
        throw new Error(approveData.error || "Server rejected approval request.");
      }

      setGenerationStage(2); // 2: Generating full website from approved manifest

      // Step 2: Full website generation
      const genRes = await fetch(`/api/storyboard/${storyboard.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const genData = await genRes.json();
      if (!genRes.ok || !genData.success) {
        throw new Error(genData.error || "Failed to generate website.");
      }

      // Save generated project directly into local projectService storage
      if (genData.project) {
        projectService.saveProject(genData.project);
      }

      setGenerationStage(3); // 3: Complete

      setTimeout(() => {
        router.push(`/editor/${genData.projectId}`);
      }, 800);
    } catch (err: any) {
      alert("Generation failed: " + err?.message);
      setIsApproving(false);
      setShowApprovalModal(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 sb-bg-forest text-white justify-content-center align-items-center">
        <Navbar />
        <div className="text-center my-auto py-5">
          <div
            className="d-inline-flex p-3 rounded-circle mb-3 animate-spin"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}
          >
            <RefreshCw size={36} />
          </div>
          <h3 className="fw-bold mb-2">Loading Visual Storyboard...</h3>
          <p className="text-secondary small">Assembling website blueprint and verified stock photographs.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !storyboard) {
    return (
      <div className="d-flex flex-column min-vh-100 sb-bg-forest text-white">
        <Navbar />
        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <div className="sb-card p-5 text-center" style={{ maxWidth: 500 }}>
            <AlertCircle size={40} className="text-danger mb-3 mx-auto" />
            <h4 className="fw-bold mb-2">Storyboard Not Found</h4>
            <p className="text-secondary small mb-4">{error || "Could not load the requested storyboard."}</p>
            <Link href="/create" className="sb-btn-primary py-2 px-4">
              Return to Creation Studio
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sections = storyboard.pages[0]?.sections || [];

  return (
    <div className="d-flex flex-column min-vh-100 sb-bg-forest text-white position-relative">
      <Navbar />

      <main className="flex-grow-1 py-4 py-md-5 position-relative">
        {/* Subtle ambient glow blobs */}
        <div className="sb-glow-blob-emerald top-0 start-0 opacity-25" />
        <div className="sb-glow-blob-gold bottom-0 end-0 opacity-15" />

        <div className="container position-relative" style={{ zIndex: 2 }}>
          {/* ====================================================================
              STORYBOARD HEADER BAR
              ==================================================================== */}
          <div className="sb-card p-4 mb-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="badge rounded-pill px-3 py-1.5 fw-bold"
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#10B981",
                    }}
                  >
                    Visual Storyboard Preview
                  </span>
                  <span
                    className="badge rounded-pill px-2.5 py-1 small"
                    style={{
                      backgroundColor:
                        storyboard.status === "awaiting_approval"
                          ? "rgba(245, 158, 11, 0.15)"
                          : "rgba(16, 185, 129, 0.15)",
                      color: storyboard.status === "awaiting_approval" ? "#F59E0B" : "#10B981",
                      border: "1px solid currentColor",
                    }}
                  >
                    {storyboard.status === "awaiting_approval"
                      ? "Awaiting Your Approval"
                      : storyboard.status === "approved"
                      ? "Approved"
                      : storyboard.status === "website_ready"
                      ? "Website Ready"
                      : storyboard.status}
                  </span>
                  <span className="text-secondary small">• v{storyboard.version}</span>
                </div>

                <h1 className="display-6 fw-extrabold text-white mb-2">{storyboard.projectName}</h1>
                <p className="text-secondary small mb-0" style={{ maxWidth: 680 }}>
                  {storyboard.purpose}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="d-flex flex-wrap align-items-center gap-2">
                {/* Save Feedback */}
                {hasUnsavedChanges ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1.5"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? <RefreshCw size={14} className="spin" /> : <Clock size={14} />}
                    Save Changes
                  </button>
                ) : (
                  <span className="text-success small d-flex align-items-center gap-1">
                    <CheckCircle2 size={14} /> Saved
                  </span>
                )}

                {/* Edit Toggle */}
                <button
                  type="button"
                  className={`sb-filter-pill py-1.5 px-3 small d-flex align-items-center gap-1.5 ${
                    isEditing ? "active" : ""
                  }`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 size={14} />
                  {isEditing ? "Done Editing" : "Edit Storyboard"}
                </button>

                {/* Optional PDF Export */}
                <button
                  type="button"
                  className="sb-btn-outline btn-sm py-1.5 px-3 small d-flex align-items-center gap-1.5"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  title="Download offline visual specification PDF"
                >
                  <Download size={14} />
                  {isExportingPdf ? "Generating PDF..." : "Export PDF"}
                </button>

                {/* Primary Approval CTA */}
                <button
                  type="button"
                  className="sb-btn-primary btn-sm py-2 px-3.5 d-flex align-items-center gap-2"
                  onClick={() => setShowApprovalModal(true)}
                  id="btn-approve-storyboard"
                >
                  <Sparkles size={16} />
                  Approve &amp; Generate Website
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {saveToast && (
              <div
                className="alert py-1.5 px-3 rounded-pill mt-3 mb-0 small text-emerald d-inline-flex align-items-center gap-2"
                style={{ backgroundColor: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)" }}
              >
                <Check size={14} /> {saveToast}
              </div>
            )}

            {/* Architecture Metadata Bar */}
            <div
              className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-3 text-secondary small"
              style={{ borderColor: "rgba(16, 185, 129, 0.15)" }}
            >
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div>
                  <strong className="text-white">Category:</strong> {storyboard.category}
                </div>
                <div>
                  <strong className="text-white">Planned Pages:</strong> {storyboard.pages.length}
                </div>
                <div>
                  <strong className="text-white">Planned Sections:</strong> {sections.length} Sections
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <strong className="text-white">Palette:</strong>
                  <span
                    className="rounded-circle border"
                    style={{ width: 12, height: 12, backgroundColor: storyboard.palette.primary }}
                  />
                  <span
                    className="rounded-circle border"
                    style={{ width: 12, height: 12, backgroundColor: storyboard.palette.secondary }}
                  />
                  <span
                    className="rounded-circle border"
                    style={{ width: 12, height: 12, backgroundColor: storyboard.palette.accent }}
                  />
                  <span>{storyboard.palette.name}</span>
                </div>
              </div>

              {/* Viewport Composition Switcher */}
              <div className="d-flex align-items-center gap-1">
                <span className="me-1 small">Composition:</span>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      viewportMode === "desktop" ? "sb-btn-primary" : "btn-outline-secondary text-secondary"
                    }`}
                    onClick={() => setViewportMode("desktop")}
                    style={{ borderRadius: "8px 0 0 8px" }}
                  >
                    <Laptop size={14} className="me-1" />
                    Desktop
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      viewportMode === "mobile" ? "sb-btn-primary" : "btn-outline-secondary text-secondary"
                    }`}
                    onClick={() => setViewportMode("mobile")}
                    style={{ borderRadius: "0 8px 8px 0" }}
                  >
                    <Smartphone size={14} className="me-1" />
                    Mobile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================================
              VISUAL SECTION CARDS CONTAINER
              ==================================================================== */}
          <div
            className={`mx-auto transition-all ${
              viewportMode === "mobile" ? "max-w-480" : "w-100"
            }`}
            style={{ maxWidth: viewportMode === "mobile" ? "520px" : "100%" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <span>Proposed Website Sections ({sections.length})</span>
                <span className="badge bg-dark border text-secondary small fw-normal">
                  Non-executable storyboard
                </span>
              </h5>

              {isEditing && (
                <button
                  type="button"
                  className="sb-btn-outline btn-sm py-1 px-3 small d-flex align-items-center gap-1"
                  onClick={handleAddSection}
                >
                  <Plus size={14} /> Add Section
                </button>
              )}
            </div>

            {/* List of Section Cards */}
            <div className="d-flex flex-column gap-4 mb-5">
              {sections.map((sec, idx) => {
                const img = sec.selectedImage;

                return (
                  <div
                    key={sec.id}
                    className="sb-card card-3d-tilt card-spotlight p-4 position-relative overflow-hidden transition-all"
                    style={{
                      borderLeft: `4px solid ${
                        idx === 0
                          ? "#A3FF6F"
                          : idx === 1
                          ? "#8B7CFF"
                          : idx === sections.length - 1
                          ? "#36D9F5"
                          : "rgba(163, 255, 111, 0.4)"
                      }`,
                    }}
                  >
                    {/* Top Row: Section Index, Type, Layout, and Reordering */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-2 border-bottom border-dark">
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="badge rounded-pill fw-bold"
                          style={{
                            backgroundColor: "rgba(16, 185, 129, 0.2)",
                            color: "#10B981",
                            border: "1px solid rgba(16, 185, 129, 0.4)",
                            fontSize: "0.85rem",
                          }}
                        >
                          #{sec.sectionNumber}
                        </span>
                        <h5 className="fw-bold text-white mb-0">{sec.name}</h5>
                        <span
                          className="badge font-monospace small"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            color: "#94A3B8",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          {sec.type}
                        </span>
                        <span className="badge bg-dark text-secondary small">
                          Layout: {sec.layout}
                        </span>
                      </div>

                      {/* Editing & Reorder Controls */}
                      {isEditing && (
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary p-1"
                            disabled={idx === 0}
                            onClick={() => handleMoveSection(idx, "up")}
                            title="Move section up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary p-1"
                            disabled={idx === sections.length - 1}
                            onClick={() => handleMoveSection(idx, "down")}
                            title="Move section down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger p-1 ms-1"
                            onClick={() => handleDeleteSection(sec.id)}
                            title="Remove section"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Section Body: Grid of Headline/Copy + Visual Photograph Card */}
                    <div className="row g-4 align-items-center">
                      {/* Left Side: Headlines & Planned Copy */}
                      <div className={`col-12 ${img ? "col-lg-7" : "col-12"}`}>
                        {isEditing ? (
                          <div className="d-flex flex-column gap-2">
                            <div>
                              <label className="text-secondary small mb-1">Headline</label>
                              <input
                                type="text"
                                className="form-control text-white"
                                style={{
                                  backgroundColor: "rgba(8, 27, 19, 0.8)",
                                  borderColor: "rgba(16, 185, 129, 0.3)",
                                }}
                                value={sec.headline}
                                onChange={(e) => handleUpdateHeadline(sec.id, e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-secondary small mb-1">Content Summary</label>
                              <textarea
                                rows={3}
                                className="form-control text-white"
                                style={{
                                  backgroundColor: "rgba(8, 27, 19, 0.8)",
                                  borderColor: "rgba(16, 185, 129, 0.3)",
                                }}
                                value={sec.contentSummary}
                                onChange={(e) => handleUpdateSummary(sec.id, e.target.value)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="fw-bold text-white mb-2" style={{ lineHeight: 1.35 }}>
                              {sec.headline}
                            </h4>
                            {sec.subheadline && (
                              <h6 className="text-emerald small mb-2">{sec.subheadline}</h6>
                            )}
                            <p className="text-secondary small mb-3" style={{ lineHeight: 1.6 }}>
                              {sec.contentSummary}
                            </p>

                            {sec.callToAction && (
                              <div className="d-flex align-items-center gap-2 mt-2">
                                <span
                                  className="badge rounded-pill px-3 py-1.5"
                                  style={{
                                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                    color: "#10B981",
                                  }}
                                >
                                  CTA Button: {sec.callToAction.label} &rarr;
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Side: High-Resolution Real Stock Photograph */}
                      {img && (
                        <div className="col-12 col-lg-5">
                          <div
                            className="rounded-4 overflow-hidden position-relative shadow border"
                            style={{
                              borderColor: "rgba(16, 185, 129, 0.25)",
                              backgroundColor: "#061A12",
                              height: "220px",
                            }}
                          >
                            <img
                              src={img.url}
                              alt={img.alt || sec.headline}
                              className="w-100 h-100 object-fit-cover"
                            />

                            {/* Attribution Overlay Badge */}
                            <div
                              className="position-absolute bottom-0 start-0 end-0 p-2 d-flex justify-content-between align-items-center small"
                              style={{
                                backgroundColor: "rgba(4, 18, 12, 0.88)",
                                backdropFilter: "blur(6px)",
                                borderTop: "1px solid rgba(16, 185, 129, 0.25)",
                              }}
                            >
                              <div className="d-flex align-items-center gap-1.5 text-truncate me-2">
                                <Camera size={13} className="sb-text-emerald flex-shrink-0" />
                                <span className="text-secondary text-truncate" style={{ fontSize: "0.74rem" }}>
                                  Photo by{" "}
                                  <a
                                    href={img.photographerUrl || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-white fw-semibold text-decoration-none"
                                  >
                                    {img.photographer}
                                  </a>{" "}
                                  on {img.source.toUpperCase()}
                                </span>
                              </div>

                              <button
                                type="button"
                                className="sb-btn-outline btn-sm py-1 px-2.5 small flex-shrink-0"
                                style={{ fontSize: "0.72rem" }}
                                onClick={() => handleOpenPhotoModal(sec)}
                                title="Search and replace this section's stock photograph"
                              >
                                Replace Photo
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="sb-card p-4 text-center d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
              <div>
                <h5 className="fw-bold text-white mb-1">Satisfied with this visual storyboard?</h5>
                <p className="text-secondary small mb-0">
                  Approving will synthesize your website into the visual editor using these verified stock photos.
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="sb-btn-outline py-2 px-3.5 small"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                >
                  <Download size={14} className="me-1" />
                  Export PDF
                </button>
                <button
                  type="button"
                  className="sb-btn-primary py-2.5 px-4 fw-bold"
                  onClick={() => setShowApprovalModal(true)}
                  id="btn-approve-bottom"
                >
                  <Sparkles size={16} />
                  Approve &amp; Generate Website
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ====================================================================
          MODAL: PHOTO REPLACEMENT VIA PEXELS & UNSPLASH
          ==================================================================== */}
      <ImageFinderModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        initialQuery={photoSearchQuery}
        title="Find Alternative Stock Photograph"
        onSelectImage={handleSelectNewPhoto}
      />

      {/* ====================================================================
          MODAL: EXPLICIT APPROVAL CONFIRMATION & GENERATION PROGRESS
          ==================================================================== */}
      {showApprovalModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(11, 13, 18, 0.88)", backdropFilter: "blur(8px)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content p-4 rounded-4 shadow-2xl"
              style={{
                backgroundColor: "#151A24",
                border: "1px solid #303947",
                color: "#FFFFFF",
              }}
            >
              {!isApproving ? (
                <div>
                  <div
                    className="d-inline-flex p-3 rounded-circle mb-3"
                    style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="fw-bold text-white mb-2">Approve Storyboard &amp; Generate Website</h4>
                  <p className="small mb-4" style={{ color: "#D1D5DB" }}>
                    You are explicitly approving <strong>{storyboard.projectName} (v{storyboard.version})</strong> with {sections.length} planned sections and verified stock photographs.
                    <br /><br />
                    Once approved, SiteGenAI will synthesize the complete responsive website and open it inside the Visual Editor.
                  </p>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary py-2 px-3 small rounded-pill text-white"
                      style={{ borderColor: "#303947" }}
                      onClick={() => setShowApprovalModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="py-2 px-4 rounded-pill fw-bold"
                      style={{
                        backgroundColor: "#A3FF6F",
                        color: "#0B0D12",
                        border: "none",
                        boxShadow: "0 0 16px rgba(163, 255, 111, 0.25)",
                      }}
                      onClick={handleApproveAndGenerate}
                      id="modal-confirm-approve"
                    >
                      Confirm Approval &amp; Generate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div
                    className="d-inline-flex p-3 rounded-circle mb-3 animate-spin"
                    style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}
                  >
                    <RefreshCw size={36} />
                  </div>
                  <h4 className="fw-bold text-white mb-2">Generating Approved Website...</h4>
                  <p className="small mb-3" style={{ color: "#D1D5DB" }}>
                    {generationStage === 1
                      ? "Recording explicit approval on server..."
                      : generationStage === 2
                      ? "Synthesizing responsive components & stock photo manifests..."
                      : "Website ready! Redirecting to Visual Editor..."}
                  </p>
                  <div
                    className="progress rounded-pill mx-auto"
                    style={{ height: 6, maxWidth: 300, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  >
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      style={{
                        width: generationStage === 1 ? "40%" : generationStage === 2 ? "80%" : "100%",
                        backgroundColor: "#A3FF6F",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
