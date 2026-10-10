"use client";

import React, { useState } from "react";
import { PromotionalVideo } from "@/types/video";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Film,
  Info,
} from "lucide-react";

interface VideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  tagline: string;
  projectId?: string;
  onSelectHeroVideo?: (videoUrl: string) => void;
}

export default function VideoGeneratorModal({
  isOpen,
  onClose,
  brandName,
  tagline,
  projectId,
  onSelectHeroVideo,
}: VideoGeneratorModalProps) {
  const [explicitConsent, setExplicitConsent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [costWarning, setCostWarning] = useState<string | null>(null);
  const [providerNotice, setProviderNotice] = useState<string | null>(null);
  const [variations, setVariations] = useState<PromotionalVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<PromotionalVideo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    if (!explicitConsent) {
      setErrorMsg("Please acknowledge and confirm generation request to proceed.");
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/video-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          brandName,
          tagline,
          userExplicitConsent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate video variations");
      }

      setVariations(data.variations || []);
      setCostWarning(data.costWarning);
      setProviderNotice(data.providerNotice);
      if (data.variations && data.variations.length > 0) {
        setActiveVideo(data.variations[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate videos.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(11, 13, 18, 0.88)",
        backdropFilter: "blur(8px)",
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content border rounded-4 shadow-2xl overflow-hidden"
          style={{
            backgroundColor: "#151A24",
            borderColor: "#303947",
            color: "#FFFFFF",
          }}
        >
          {/* Header */}
          <div
            className="modal-header py-3 px-4 d-flex align-items-center justify-content-between"
            style={{ borderBottom: "1px solid #303947" }}
          >
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2 text-white fs-6 mb-0">
              <Film size={20} style={{ color: "#A3FF6F" }} />
              AI Promotional Video Synthesis Studio
            </h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary text-white rounded-circle"
              style={{ width: 32, height: 32, padding: 0 }}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="modal-body p-4">
            {variations.length === 0 ? (
              /* Pre-generation consent and warning phase */
              <div className="p-3">
                <div
                  className="d-flex align-items-start gap-3 rounded-4 p-3.5 mb-4"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <AlertTriangle size={24} style={{ color: "#F59E0B" }} className="flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: "#FFFFFF" }}>
                      Resource &amp; Quota Transparency Notice
                    </h6>
                    <p className="small mb-2" style={{ color: "#F1F5F9" }}>
                      AI video diffusion and rendering is a compute-intensive operation. Cloud video generation consumes significant GPU quotas (~10-25 credits per variation).
                    </p>
                    <p className="small mb-0" style={{ color: "#BFC7D2" }}>
                      SiteGenAI synthesizes <strong>5 targeted promotional variations</strong> tailored for your brand: Hero Value Prop (16:9), Origin Story (16:9), Social Barista Reel (9:16), Product Specs Rotation (16:9), and Ambient Loop (1:1).
                    </p>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-3 mb-4"
                  style={{
                    backgroundColor: "#10141C",
                    border: "1px solid #303947",
                  }}
                >
                  <h6 className="fw-bold mb-2 text-white">Target Brand Parameters</h6>
                  <div className="row g-2 small">
                    <div className="col-sm-6">
                      <span style={{ color: "#BFC7D2" }}>Brand Name:</span>{" "}
                      <strong className="text-white">{brandName || "COCO POUR"}</strong>
                    </div>
                    <div className="col-sm-6">
                      <span style={{ color: "#BFC7D2" }}>Tagline:</span>{" "}
                      <strong className="text-white">{tagline || "Made for every pour"}</strong>
                    </div>
                  </div>
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="consentCheck"
                    checked={explicitConsent}
                    onChange={(e) => {
                      setExplicitConsent(e.target.checked);
                      setErrorMsg(null);
                    }}
                    style={{ accentColor: "#A3FF6F" }}
                  />
                  <label className="form-check-label fw-semibold small" htmlFor="consentCheck" style={{ color: "#F1F5F9" }}>
                    I explicitly request and authorize generating promotional video variations for this project.
                  </label>
                </div>

                {errorMsg && (
                  <div
                    className="alert py-2 px-3 small rounded-3 mb-3"
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#FCA5A5",
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4 text-white"
                    style={{ borderColor: "#303947" }}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn rounded-pill px-4 d-flex align-items-center gap-2 fw-bold"
                    style={{
                      backgroundColor: "#A3FF6F",
                      color: "#0B0D12",
                      border: "none",
                      boxShadow: "0 0 16px rgba(163, 255, 111, 0.25)",
                    }}
                    disabled={!explicitConsent || isGenerating}
                    onClick={handleStartGeneration}
                  >
                    {isGenerating ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
                    {isGenerating ? "Synthesizing Variations..." : "Generate 5 Video Variations"}
                  </button>
                </div>
              </div>
            ) : (
              /* Variations Preview & Selection Phase */
              <div>
                {/* Status notices */}
                <div
                  className="py-2.5 px-3.5 small d-flex align-items-center justify-content-between rounded-3 mb-3"
                  style={{
                    backgroundColor: "rgba(54, 217, 245, 0.12)",
                    border: "1px solid rgba(54, 217, 245, 0.3)",
                    color: "#36D9F5",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Info size={16} />
                    <span>{providerNotice}</span>
                  </div>
                  <span
                    className="badge rounded-pill fw-bold"
                    style={{ backgroundColor: "#36D9F5", color: "#0B0D12" }}
                  >
                    5 Variations Ready
                  </span>
                </div>

                <div className="row g-4">
                  {/* Left Column: Video List */}
                  <div className="col-12 col-lg-5">
                    <h6 className="fw-bold mb-2 text-white">Promotional Variations</h6>
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: "55vh", overflowY: "auto" }}>
                      {variations.map((v) => (
                        <div
                          key={v.id}
                          className="p-3 rounded-3 transition-all"
                          style={{
                            cursor: "pointer",
                            backgroundColor: activeVideo?.id === v.id ? "rgba(163, 255, 111, 0.08)" : "#10141C",
                            border: `1px solid ${activeVideo?.id === v.id ? "#A3FF6F" : "#303947"}`,
                          }}
                          onClick={() => setActiveVideo(v)}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className="fw-bold small text-white">{v.title}</span>
                            <span
                              className="badge small"
                              style={{
                                backgroundColor: "#202938",
                                color: "#BFC7D2",
                                fontSize: "0.68rem",
                              }}
                            >
                              {v.aspectRatio} &bull; {v.durationSeconds}s
                            </span>
                          </div>
                          <p className="small mb-2 line-clamp-2" style={{ color: "#BFC7D2", fontSize: "0.8rem" }}>
                            {v.concept}
                          </p>
                          <span
                            className="badge small"
                            style={{
                              backgroundColor: "rgba(163, 255, 111, 0.15)",
                              color: "#A3FF6F",
                              fontSize: "0.7rem",
                            }}
                          >
                            <CheckCircle2 size={11} className="me-1" /> Ready
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Active Video Player & Script */}
                  <div className="col-12 col-lg-7">
                    {activeVideo && (
                      <div
                        className="p-3.5 rounded-4 h-100"
                        style={{
                          backgroundColor: "#10141C",
                          border: "1px solid #303947",
                        }}
                      >
                        <h6 className="fw-bold mb-2 text-white">{activeVideo.title}</h6>
                        <div
                          className="rounded-3 overflow-hidden bg-black mb-3 text-center d-flex align-items-center justify-content-center"
                          style={{ minHeight: 240, maxHeight: 360, border: "1px solid #303947" }}
                        >
                          {activeVideo.videoUrl ? (
                            <video
                              src={activeVideo.videoUrl}
                              controls
                              autoPlay
                              loop
                              muted
                              className="w-100 h-100 object-fit-contain"
                            />
                          ) : (
                            <div className="p-4" style={{ color: "#BFC7D2" }}>Video preview unavailable</div>
                          )}
                        </div>

                        {/* Script & Storyboard */}
                        {activeVideo.script && (
                          <div className="mb-3">
                            <span className="small fw-semibold d-block mb-1" style={{ color: "#BFC7D2" }}>
                              Storyboard &amp; Script:
                            </span>
                            <pre
                              className="p-2.5 rounded-2 small mb-0 font-monospace"
                              style={{
                                whiteSpace: "pre-wrap",
                                fontSize: "0.76rem",
                                backgroundColor: "#0B0D12",
                                border: "1px solid #303947",
                                color: "#D1D5DB",
                              }}
                            >
                              {activeVideo.script}
                            </pre>
                          </div>
                        )}

                        {/* Action: Use in Website */}
                        {onSelectHeroVideo && activeVideo.videoUrl && (
                          <div className="d-flex justify-content-end gap-2 mt-auto">
                            <button
                              type="button"
                              className="btn btn-sm rounded-pill px-3 fw-bold"
                              style={{
                                backgroundColor: "#A3FF6F",
                                color: "#0B0D12",
                                border: "none",
                              }}
                              onClick={() => {
                                onSelectHeroVideo(activeVideo.videoUrl!);
                                onClose();
                              }}
                            >
                              Apply as Hero Section Video
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="modal-footer py-2.5 px-4"
            style={{ borderTop: "1px solid #303947" }}
          >
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-4 text-white"
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
