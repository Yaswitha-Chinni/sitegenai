"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { projectService } from "@/lib/projects/projectService";
import { WebsiteDocument } from "@/types/project";
import SectionRenderer from "@/components/preview/SectionRenderer";
import ViewportSwitcher, { ViewportMode } from "@/components/ui/ViewportSwitcher";
import LocalhostModal from "@/components/ui/LocalhostModal";
import {
  ArrowLeft,
  Server,
  Download,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  Eye,
  Sparkles,
} from "lucide-react";

interface PreviewPageProps {
  params: Promise<{ projectId: string }>;
}

export default function StandalonePreviewPage({ params }: PreviewPageProps) {
  const router = useRouter();
  const { projectId } = use(params);

  const [project, setProject] = useState<WebsiteDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLocalhostModal, setShowLocalhostModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadProject();
  }, [projectId, refreshKey]);

  const loadProject = () => {
    setLoading(true);
    const p = projectService.getProjectById(projectId);
    if (p) {
      setProject(p);
    }
    setLoading(false);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center min-vh-100"
        style={{ backgroundColor: "#0B0D12", color: "#FFFFFF" }}
      >
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: "#A3FF6F" }} role="status"></div>
          <p className="fw-semibold">Loading Live Website Preview...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div
        className="d-flex align-items-center justify-content-center min-vh-100 p-4"
        style={{ backgroundColor: "#0B0D12", color: "#FFFFFF" }}
      >
        <div
          className="p-5 rounded-4 border text-center shadow-2xl"
          style={{ maxWidth: 480, backgroundColor: "#151A24", borderColor: "#303947" }}
        >
          <h4 className="fw-bold mb-2">Website Not Found</h4>
          <p className="small mb-4" style={{ color: "#D1D5DB" }}>
            The website you are trying to preview could not be loaded from local storage.
          </p>
          <Link
            href="/dashboard"
            className="btn btn-sm px-4 fw-bold rounded-pill"
            style={{ backgroundColor: "#A3FF6F", color: "#0B0D12" }}
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isW1 = project.templateSource === "w1" || project.templateId === "w1";
  const isW2 = project.templateSource === "w2" || project.templateId === "w2";

  const getViewportMaxWidth = () => {
    switch (viewportMode) {
      case "mobile":
        return "390px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column position-relative"
      style={{ backgroundColor: "#0B0D12", color: "#172033" }}
    >
      {/* ======================================================================
          FLOATING STICKY PREVIEW TOOLBAR
          ====================================================================== */}
      <header
        className="position-sticky top-0 start-0 end-0 py-2.5 px-3 px-md-4 d-flex align-items-center justify-content-between gap-3 shadow-lg"
        style={{
          zIndex: 1050,
          backgroundColor: "rgba(16, 20, 28, 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #303947",
        }}
      >
        {/* Left: Back to Editor & Name */}
        <div className="d-flex align-items-center gap-3">
          <Link
            href={`/editor/${project.id}`}
            className="btn btn-sm d-flex align-items-center gap-1.5 rounded-pill text-white border"
            style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
          >
            <ArrowLeft size={15} />
            <span className="d-none d-sm-inline">Back to Editor</span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold text-white mb-0 text-truncate" style={{ maxWidth: 220 }}>
              {project.name}
            </h6>
            <span
              className="badge rounded-pill small d-none d-md-inline"
              style={{
                backgroundColor: "rgba(163, 255, 111, 0.15)",
                border: "1px solid rgba(163, 255, 111, 0.3)",
                color: "#A3FF6F",
              }}
            >
              Full Page Live Preview
            </span>
          </div>
        </div>

        {/* Center: Viewport Switcher */}
        <div className="d-flex align-items-center gap-2">
          <ViewportSwitcher currentMode={viewportMode} onChange={setViewportMode} />

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-circle text-white p-1.5 d-none d-sm-inline-flex"
            style={{ borderColor: "#303947", width: 32, height: 32 }}
            onClick={() => setRefreshKey((k) => k + 1)}
            title="Refresh Preview"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5"
            style={{
              backgroundColor: "rgba(163, 255, 111, 0.15)",
              border: "1px solid rgba(163, 255, 111, 0.35)",
              color: "#A3FF6F",
            }}
            onClick={() => setShowLocalhostModal(true)}
          >
            <Server size={14} />
            <span className="d-none d-md-inline">Run on Localhost</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-circle text-white p-1.5"
            style={{ borderColor: "#303947", width: 32, height: 32 }}
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      {/* ======================================================================
          FULL-PAGE NATURAL SCROLL CONTAINER (FROM HEADER TO FOOTER)
          ====================================================================== */}
      <main className="flex-grow-1 d-flex justify-content-center p-0 w-100 overflow-y-auto">
        <div
          className="w-100 transition-all"
          style={{
            maxWidth: getViewportMaxWidth(),
            minHeight: "100vh",
            backgroundColor: isW1 ? "#FFFFFF" : isW2 ? "#080504" : project.theme?.backgroundColor || "#FFFFFF",
            boxShadow: viewportMode !== "desktop" ? "0 0 40px rgba(0,0,0,0.5)" : "none",
          }}
        >
          {isW1 ? (
            /* W1 Native Standalone Website Preview */
            <iframe
              src="/templates/w1/index.html"
              title="COCO POUR Standalone Live Experience"
              className="w-100 border-0"
              style={{
                minHeight: "100vh",
                height: "100%",
                display: "block",
              }}
            />
          ) : isW2 ? (
            /* W2 Native Standalone Website Preview */
            <iframe
              src="/templates/w2/index.html"
              title="BRUVA Coffee Standalone Live Experience"
              className="w-100 border-0"
              style={{
                minHeight: "100vh",
                height: "100%",
                display: "block",
              }}
            />
          ) : (
            /* Custom & AI Synthesized Website: Natural Full-Page Sections */
            <div className="w-100">
              <SectionRenderer
                sections={project.sections}
                theme={project.theme}
                isEditableCanvas={false}
              />
            </div>
          )}
        </div>
      </main>

      {/* Localhost Runner Modal */}
      {showLocalhostModal && (
        <LocalhostModal
          project={project}
          isOpen={showLocalhostModal}
          onClose={() => setShowLocalhostModal(false)}
        />
      )}
    </div>
  );
}
