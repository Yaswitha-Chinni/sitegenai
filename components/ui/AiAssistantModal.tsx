"use client";

import React, { useState } from "react";
import { WebsiteDocument } from "@/types/project";
import { WebsiteImprovement } from "@/app/api/ai/improve/route";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Search,
  Eye,
  Sliders,
  X,
  Check,
  Zap,
} from "lucide-react";

interface AiAssistantModalProps {
  project: WebsiteDocument;
  isOpen: boolean;
  onClose: () => void;
  onApplyImprovement: (improvement: WebsiteImprovement) => void;
  onApplyAllImprovements: (improvements: WebsiteImprovement[]) => void;
}

const MODES = [
  { id: "conversion", label: "Conversion Optimization", icon: TrendingUp },
  { id: "content", label: "Content & Copywriting", icon: Sparkles },
  { id: "seo", label: "SEO & Discoverability", icon: Search },
  { id: "accessibility", label: "Accessibility (A11y)", icon: Eye },
  { id: "responsive", label: "Mobile Responsiveness", icon: Sliders },
  { id: "visual", label: "Visual Aesthetics", icon: Zap },
] as const;

export default function AiAssistantModal({
  project,
  isOpen,
  onClose,
  onApplyImprovement,
  onApplyAllImprovements,
}: AiAssistantModalProps) {
  const [activeMode, setActiveMode] = useState<typeof MODES[number]["id"]>("conversion");
  const [isLoading, setIsLoading] = useState(false);
  const [improvements, setImprovements] = useState<WebsiteImprovement[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLiveAI, setIsLiveAI] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunAnalysis = async (mode = activeMode) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, mode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze website.");
      }

      setImprovements(data.improvements || []);
      setIsLiveAI(data.isLiveAI || false);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not analyze website improvements.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleApply = (imp: WebsiteImprovement) => {
    onApplyImprovement(imp);
    setAppliedIds((prev) => [...prev, imp.id]);
  };

  const handleApplyAll = () => {
    onApplyAllImprovements(improvements);
    setAppliedIds(improvements.map((i) => i.id));
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{
        backgroundColor: "rgba(11, 13, 18, 0.88)",
        backdropFilter: "blur(8px)",
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div
          className="modal-content border rounded-4 shadow-2xl overflow-hidden text-white"
          style={{
            backgroundColor: "#151A24",
            borderColor: "#303947",
          }}
        >
          {/* Header */}
          <div
            className="modal-header py-3 px-4 d-flex align-items-center justify-content-between"
            style={{ borderBottom: "1px solid #303947" }}
          >
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="p-1.5 rounded-3 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "#8B7CFF", color: "#FFFFFF" }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0 fs-6">AI Website Improvement Assistant</h5>
                <small style={{ color: "#BFC7D2", fontSize: "0.78rem" }}>
                  Analyze sections, copy, SEO, and visual hierarchy with targeted 1-click recommendations
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {isLiveAI && (
                <span
                  className="badge rounded-pill small"
                  style={{
                    backgroundColor: "rgba(163, 255, 111, 0.15)",
                    color: "#A3FF6F",
                    border: "1px solid rgba(163, 255, 111, 0.3)",
                  }}
                >
                  Live Gemini 3.8 Flash
                </span>
              )}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary text-white rounded-circle"
                style={{ width: 32, height: 32, padding: 0, borderColor: "#303947" }}
                onClick={onClose}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="modal-body p-4">
            {/* Mode Selector Tabs */}
            <div className="d-flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
              {MODES.map((m) => {
                const Icon = m.icon;
                const isActive = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 flex-shrink-0"
                    style={{
                      backgroundColor: isActive ? "#A3FF6F" : "#10141C",
                      color: isActive ? "#0B0D12" : "#BFC7D2",
                      border: `1px solid ${isActive ? "#A3FF6F" : "#303947"}`,
                    }}
                    onClick={() => {
                      setActiveMode(m.id);
                      handleRunAnalysis(m.id);
                    }}
                  >
                    <Icon size={14} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div
                className="alert py-2.5 px-3 rounded-3 small d-flex align-items-center gap-2 mb-3"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#FCA5A5",
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-5">
                <div className="spinner-border mb-3" style={{ color: "#A3FF6F" }} role="status"></div>
                <h6 className="fw-bold text-white mb-1">Analyzing Website Architecture &amp; Copy...</h6>
                <p className="small" style={{ color: "#BFC7D2" }}>
                  Auditing &quot;{project.name}&quot; for {activeMode} optimizations...
                </p>
              </div>
            )}

            {/* Initial empty state */}
            {!isLoading && improvements.length === 0 && !errorMsg && (
              <div
                className="text-center py-5 p-4 rounded-4"
                style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
              >
                <div
                  className="p-3 rounded-circle d-inline-flex mb-3"
                  style={{ backgroundColor: "rgba(139, 124, 255, 0.15)", color: "#8B7CFF" }}
                >
                  <Sparkles size={32} />
                </div>
                <h5 className="fw-bold text-white mb-2">Ready to Optimize Your Website</h5>
                <p className="small max-w-600 mx-auto mb-4" style={{ color: "#BFC7D2" }}>
                  Select an objective above and launch AI analysis. The assistant will propose targeted, non-destructive recommendations that you can review and apply individually or all at once.
                </p>
                <button
                  type="button"
                  className="btn rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: "#A3FF6F", color: "#0B0D12" }}
                  onClick={() => handleRunAnalysis(activeMode)}
                >
                  <Sparkles size={16} />
                  Run {MODES.find((m) => m.id === activeMode)?.label} Analysis
                </button>
              </div>
            )}

            {/* Results cards */}
            {!isLoading && improvements.length > 0 && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-white">
                      {improvements.length} Proposed Recommendations
                    </span>
                    <span
                      className="badge rounded-pill"
                      style={{ backgroundColor: "#202938", color: "#36D9F5", border: "1px solid #303947" }}
                    >
                      {activeMode.toUpperCase()}
                    </span>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill px-3 text-white"
                      style={{ borderColor: "#303947" }}
                      onClick={() => handleRunAnalysis(activeMode)}
                    >
                      <RefreshCw size={13} className="me-1" /> Re-Analyze
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm rounded-pill px-3 fw-bold"
                      style={{ backgroundColor: "#A3FF6F", color: "#0B0D12" }}
                      onClick={handleApplyAll}
                      disabled={appliedIds.length === improvements.length}
                    >
                      Apply All Recommendations
                    </button>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3">
                  {improvements.map((imp) => {
                    const isApplied = appliedIds.includes(imp.id);
                    return (
                      <div
                        key={imp.id}
                        className="p-3.5 rounded-4 transition-all"
                        style={{
                          backgroundColor: "#10141C",
                          border: `1px solid ${isApplied ? "rgba(163, 255, 111, 0.4)" : "#303947"}`,
                        }}
                      >
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span
                              className="badge rounded-pill fw-bold"
                              style={{
                                backgroundColor:
                                  imp.impact === "High"
                                    ? "rgba(163, 255, 111, 0.15)"
                                    : "rgba(54, 217, 245, 0.15)",
                                color: imp.impact === "High" ? "#A3FF6F" : "#36D9F5",
                                border: "1px solid currentColor",
                                fontSize: "0.72rem",
                              }}
                            >
                              {imp.impact} Impact
                            </span>
                            <span className="small text-white fw-bold">{imp.title}</span>
                            <span className="small" style={{ color: "#8E9CAE" }}>
                              • Section: {imp.sectionName} ({imp.field})
                            </span>
                          </div>

                          <button
                            type="button"
                            className="btn btn-sm rounded-pill px-3 py-1 fw-bold align-self-start align-self-md-auto"
                            style={{
                              backgroundColor: isApplied ? "rgba(163, 255, 111, 0.2)" : "#A3FF6F",
                              color: isApplied ? "#A3FF6F" : "#0B0D12",
                              border: isApplied ? "1px solid #A3FF6F" : "none",
                              fontSize: "0.8rem",
                            }}
                            onClick={() => handleSingleApply(imp)}
                            disabled={isApplied}
                          >
                            {isApplied ? (
                              <>
                                <Check size={13} className="me-1" /> Applied
                              </>
                            ) : (
                              "Apply Change"
                            )}
                          </button>
                        </div>

                        {/* Rationale explanation */}
                        <p className="small mb-3" style={{ color: "#D1D5DB", lineHeight: 1.5 }}>
                          {imp.rationale}
                        </p>

                        {/* Before vs After comparison */}
                        <div className="row g-2">
                          <div className="col-12 col-md-6">
                            <div
                              className="p-2.5 rounded-3 h-100"
                              style={{ backgroundColor: "#0B0D12", border: "1px solid #303947" }}
                            >
                              <span className="small fw-semibold d-block mb-1" style={{ color: "#8E9CAE", fontSize: "0.72rem" }}>
                                CURRENT:
                              </span>
                              <div className="small font-monospace" style={{ color: "#FCA5A5", fontSize: "0.8rem" }}>
                                &quot;{imp.currentValue || "(Empty)"}&quot;
                              </div>
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <div
                              className="p-2.5 rounded-3 h-100"
                              style={{
                                backgroundColor: "rgba(163, 255, 111, 0.05)",
                                border: "1px solid rgba(163, 255, 111, 0.25)",
                              }}
                            >
                              <span className="small fw-semibold d-block mb-1" style={{ color: "#A3FF6F", fontSize: "0.72rem" }}>
                                PROPOSED OPTIMIZATION:
                              </span>
                              <div className="small font-monospace fw-semibold" style={{ color: "#A3FF6F", fontSize: "0.8rem" }}>
                                &quot;{imp.suggestedValue}&quot;
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div
            className="modal-footer py-2.5 px-4 d-flex justify-content-between align-items-center"
            style={{ borderTop: "1px solid #303947" }}
          >
            <span className="small" style={{ color: "#BFC7D2", fontSize: "0.76rem" }}>
              All applied suggestions create immediate history points and can be undone with Ctrl+Z.
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-4 text-white"
              style={{ borderColor: "#303947" }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
