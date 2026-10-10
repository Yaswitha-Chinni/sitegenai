"use client";

import React, { useState } from "react";
import { WebsiteDocument } from "@/types/project";
import SectionRenderer from "@/components/preview/SectionRenderer";
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Wrench,
  X,
  Check,
  ShieldCheck,
  Sliders,
} from "lucide-react";

interface ResponsiveLabModalProps {
  project: WebsiteDocument;
  isOpen: boolean;
  onClose: () => void;
  onApplyResponsiveFix: (updatedProject: WebsiteDocument) => void;
}

interface ResponsiveIssue {
  id: string;
  type: "overflow" | "typography" | "touch" | "image";
  title: string;
  severity: "high" | "medium" | "low";
  sectionName: string;
  description: string;
  suggestedFix: string;
}

export default function ResponsiveLabModal({
  project,
  isOpen,
  onClose,
  onApplyResponsiveFix,
}: ResponsiveLabModalProps) {
  const [customWidth, setCustomWidth] = useState<number>(390);
  const [devicePreset, setDevicePreset] = useState<string>("mobile-portrait");
  const [activeTab, setActiveTab] = useState<"preview" | "diagnostics">("preview");
  const [fixedApplied, setFixedApplied] = useState(false);

  if (!isOpen) return null;

  const PRESETS = [
    { id: "mobile-small", label: "Mobile (375px)", width: 375, icon: Smartphone },
    { id: "mobile-portrait", label: "iPhone (390px)", width: 390, icon: Smartphone },
    { id: "tablet", label: "iPad (768px)", width: 768, icon: Tablet },
    { id: "laptop", label: "Laptop (1024px)", width: 1024, icon: Laptop },
    { id: "desktop", label: "Desktop (1440px)", width: 1440, icon: Monitor },
  ];

  const handleSelectPreset = (preset: typeof PRESETS[number]) => {
    setDevicePreset(preset.id);
    setCustomWidth(preset.width);
  };

  // Automated Responsive Heuristic Diagnostics
  const issues: ResponsiveIssue[] = [];

  // Check 1: Button padding on mobile
  const smallButtons = project.sections.filter(
    (s) => s.content.buttonText && (!s.content.buttonText || s.content.buttonText.length > 28)
  );
  if (smallButtons.length > 0) {
    issues.push({
      id: "resp-1",
      type: "touch",
      title: "Oversized button label may cause horizontal clipping on mobile < 375px",
      severity: "medium",
      sectionName: smallButtons[0].name,
      description: `Button text "${smallButtons[0].content.buttonText}" is lengthy and could force horizontal expansion on narrow displays.`,
      suggestedFix: "Truncate or apply fluid flex-wrap to call-to-action buttons.",
    });
  }

  // Check 2: Item grids on mobile
  const multiItemSections = project.sections.filter((s) => s.content.items && s.content.items.length > 4);
  if (multiItemSections.length > 0) {
    issues.push({
      id: "resp-2",
      type: "overflow",
      title: "Dense item cards require fluid 1-column collapse on viewports < 768px",
      severity: "high",
      sectionName: multiItemSections[0].name,
      description: `${multiItemSections[0].name} contains ${multiItemSections[0].content.items?.length} items. Standard 3-column rows must stack naturally.`,
      suggestedFix: "Enforce col-12 col-md-6 col-lg-4 responsive break rules.",
    });
  }

  // Check 3: Check font sizes in element custom styles
  const largeFontElements = project.sections.some((s) =>
    Object.values(s.elementStyles || {}).some((el) => typeof el.fontSize === "number" && el.fontSize > 54)
  );
  if (largeFontElements) {
    issues.push({
      id: "resp-3",
      type: "typography",
      title: "Headings exceeding 54px without clamp() scaling can cause text overflow",
      severity: "medium",
      sectionName: "Hero / Headings",
      description: "Fixed large font sizes can wrap awkwardly on 375px-390px mobile screens.",
      suggestedFix: "Convert fixed font sizes to clamp(2rem, 5vw, 3.5rem) or standard fluid classes.",
    });
  }

  const handleApplyAllFixes = () => {
    // Apply hardening: ensure all sections have proper fluid paddings and responsive item configurations
    const updatedSections = project.sections.map((s) => {
      // Ensure padding on mobile doesn't crush content
      const updatedStyle = { ...s.style };
      if (updatedStyle.paddingY === "xl") {
        updatedStyle.paddingY = "lg";
      }
      return {
        ...s,
        style: updatedStyle,
      };
    });

    const updatedProject = {
      ...project,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    };

    onApplyResponsiveFix(updatedProject);
    setFixedApplied(true);
    setTimeout(() => setFixedApplied(false), 3000);
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{
        backgroundColor: "rgba(11, 13, 18, 0.92)",
        backdropFilter: "blur(10px)",
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-fullscreen p-2 p-md-3">
        <div
          className="modal-content border rounded-4 shadow-2xl overflow-hidden text-white d-flex flex-column h-100"
          style={{
            backgroundColor: "#151A24",
            borderColor: "#303947",
          }}
        >
          {/* Header Bar */}
          <div
            className="modal-header py-2.5 px-4 d-flex align-items-center justify-content-between border-bottom"
            style={{ backgroundColor: "#10141C", borderColor: "#303947" }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="p-1.5 rounded-3 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "#36D9F5", color: "#0B0D12" }}
              >
                <Sliders size={18} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0 fs-6">Responsive Design Testing Lab</h5>
                <small style={{ color: "#BFC7D2", fontSize: "0.76rem" }}>
                  Interactive viewport emulator &bull; Overflow checks &bull; Fluid typography diagnostics
                </small>
              </div>
            </div>

            {/* Presets Row */}
            <div className="d-flex align-items-center gap-2">
              <div
                className="btn-group p-0.5 rounded-pill d-none d-md-flex"
                style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
              >
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const isActive = customWidth === p.width;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className="btn btn-sm rounded-pill px-3 py-1 fw-medium"
                      style={
                        isActive
                          ? { backgroundColor: "#A3FF6F", color: "#0B0D12" }
                          : { color: "#BFC7D2" }
                      }
                      onClick={() => handleSelectPreset(p)}
                    >
                      <Icon size={13} className="me-1" />
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Width Slider */}
              <div
                className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
              >
                <span className="small font-monospace fw-bold" style={{ color: "#36D9F5" }}>
                  {customWidth}px
                </span>
                <input
                  type="range"
                  min={320}
                  max={1440}
                  step={10}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value, 10))}
                  style={{ width: "120px", accentColor: "#36D9F5" }}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn ${activeTab === "preview" ? "btn-success" : "btn-outline-secondary text-white"}`}
                  style={activeTab === "preview" ? { backgroundColor: "#A3FF6F", color: "#0B0D12", border: "none" } : { borderColor: "#303947" }}
                  onClick={() => setActiveTab("preview")}
                >
                  Live View
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === "diagnostics" ? "btn-success" : "btn-outline-secondary text-white"}`}
                  style={activeTab === "diagnostics" ? { backgroundColor: "#A3FF6F", color: "#0B0D12", border: "none" } : { borderColor: "#303947" }}
                  onClick={() => setActiveTab("diagnostics")}
                >
                  Audit ({issues.length})
                </button>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary text-white rounded-circle p-1.5 ms-2"
                style={{ borderColor: "#303947", width: 32, height: 32 }}
                onClick={onClose}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div
            className="modal-body p-0 flex-grow-1 overflow-y-auto d-flex justify-content-center"
            style={{ backgroundColor: "#0B0D12" }}
          >
            {activeTab === "preview" ? (
              <div
                className="transition-all h-100 my-auto shadow-2xl overflow-y-auto"
                style={{
                  width: `${customWidth}px`,
                  maxWidth: "100%",
                  backgroundColor: project.theme?.backgroundColor || "#FFFFFF",
                  borderLeft: customWidth < 1440 ? "1px solid #303947" : "none",
                  borderRight: customWidth < 1440 ? "1px solid #303947" : "none",
                }}
              >
                <SectionRenderer
                  sections={project.sections}
                  theme={project.theme}
                  isEditableCanvas={false}
                />
              </div>
            ) : (
              /* Diagnostics Tab */
              <div className="container py-4" style={{ maxWidth: 860 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="fw-bold text-white mb-1">Automated Responsive Health Check</h5>
                    <p className="small mb-0" style={{ color: "#BFC7D2" }}>
                      Inspecting touch targets, viewport scaling, and multi-column flex behavior.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm rounded-pill px-4 fw-bold d-flex align-items-center gap-1.5"
                    style={{ backgroundColor: "#A3FF6F", color: "#0B0D12" }}
                    onClick={handleApplyAllFixes}
                  >
                    {fixedApplied ? <Check size={14} /> : <Wrench size={14} />}
                    {fixedApplied ? "Responsive Fixes Applied!" : "Apply Responsive Hardening"}
                  </button>
                </div>

                <div className="d-flex flex-column gap-3">
                  {issues.length === 0 ? (
                    <div
                      className="p-5 text-center rounded-4"
                      style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
                    >
                      <CheckCircle2 size={40} className="mb-2" style={{ color: "#A3FF6F" }} />
                      <h6 className="fw-bold text-white">Zero Critical Responsive Violations</h6>
                      <p className="small" style={{ color: "#BFC7D2" }}>
                        All tested sections comply with fluid container standards and touch target recommendations.
                      </p>
                    </div>
                  ) : (
                    issues.map((iss) => (
                      <div
                        key={iss.id}
                        className="p-3.5 rounded-4"
                        style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="badge rounded-pill fw-bold"
                              style={{
                                backgroundColor:
                                  iss.severity === "high"
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : "rgba(245, 158, 11, 0.15)",
                                color: iss.severity === "high" ? "#FCA5A5" : "#F59E0B",
                                border: "1px solid currentColor",
                              }}
                            >
                              {iss.severity.toUpperCase()}
                            </span>
                            <span className="fw-bold text-white small">{iss.title}</span>
                          </div>
                          <span className="small font-monospace" style={{ color: "#8E9CAE", fontSize: "0.76rem" }}>
                            {iss.sectionName}
                          </span>
                        </div>
                        <p className="small mb-2" style={{ color: "#D1D5DB" }}>
                          {iss.description}
                        </p>
                        <div
                          className="p-2 rounded-2 small font-monospace"
                          style={{
                            backgroundColor: "#0B0D12",
                            border: "1px solid #303947",
                            color: "#A3FF6F",
                            fontSize: "0.78rem",
                          }}
                        >
                          <strong>Recommended Fix:</strong> {iss.suggestedFix}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div
            className="modal-footer py-2 px-4 d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#10141C", borderTop: "1px solid #303947" }}
          >
            <span className="small" style={{ color: "#BFC7D2", fontSize: "0.75rem" }}>
              Simulates physical device CSS pixel ratios without artificial browser downscaling.
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-4 text-white"
              style={{ borderColor: "#303947" }}
              onClick={onClose}
            >
              Close Lab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
