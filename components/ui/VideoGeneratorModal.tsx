"use client";

import React, { useState } from "react";
import { PromotionalVideo } from "@/types/video";
import {
  Video,
  Sparkles,
  Play,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Sliders,
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
      style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 rounded-4 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="modal-header border-bottom py-3 px-4">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <Film className="text-primary" size={20} />
              AI Promotional Video Synthesis Studio
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {variations.length === 0 ? (
              /* Pre-generation consent and warning phase */
              <div className="p-3">
                <div className="alert alert-warning d-flex align-items-start gap-3 rounded-4 p-3 mb-4">
                  <AlertTriangle size={24} className="text-warning-emphasis flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Resource & Quota Transparency Notice</h6>
                    <p className="small mb-2 text-dark">
                      AI video diffusion and rendering is a compute-intensive operation. Cloud video generation consumes significant GPU quotas (~10-25 credits per variation).
                    </p>
                    <p className="small mb-0 text-secondary">
                      SiteGenAI synthesizes <strong>5 targeted promotional variations</strong> tailored for your brand: Hero Value Prop (16:9), Origin Story (16:9), Social Barista Reel (9:16), Product Specs Rotation (16:9), and Ambient Loop (1:1).
                    </p>
                  </div>
                </div>

                <div className="card p-3 border rounded-3 mb-4 bg-light">
                  <h6 className="fw-bold mb-2">Target Brand Parameters</h6>
                  <div className="row g-2 small">
                    <div className="col-sm-6">
                      <span className="text-secondary">Brand Name:</span> <strong>{brandName || "COCO POUR"}</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-secondary">Tagline:</span> <strong>{tagline || "Made for every pour"}</strong>
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
                  />
                  <label className="form-check-label fw-semibold small" htmlFor="consentCheck">
                    I explicitly request and authorize generating promotional video variations for this project.
                  </label>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                    {errorMsg}
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
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
                <div className="alert alert-info py-2 px-3 small d-flex align-items-center justify-content-between rounded-3 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <Info size={16} />
                    <span>{providerNotice}</span>
                  </div>
                  <span className="badge bg-primary">5 Variations Ready</span>
                </div>

                <div className="row g-4">
                  {/* Left Column: Video List */}
                  <div className="col-12 col-lg-5">
                    <h6 className="fw-bold mb-2">Promotional Variations</h6>
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: "55vh", overflowY: "auto" }}>
                      {variations.map((v) => (
                        <div
                          key={v.id}
                          className={`p-3 rounded-3 border cursor-pointer transition-all ${
                            activeVideo?.id === v.id
                              ? "border-primary bg-primary-subtle shadow-sm"
                              : "border-light-subtle bg-white hover-bg-light"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setActiveVideo(v)}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className="fw-bold small">{v.title}</span>
                            <span className="badge bg-secondary-subtle text-secondary small" style={{ fontSize: "0.68rem" }}>
                              {v.aspectRatio} &bull; {v.durationSeconds}s
                            </span>
                          </div>
                          <p className="text-secondary small mb-2 line-clamp-2" style={{ fontSize: "0.8rem" }}>
                            {v.concept}
                          </p>
                          <span className="badge bg-success-subtle text-success small" style={{ fontSize: "0.7rem" }}>
                            <CheckCircle2 size={11} className="me-1" /> Ready
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Active Video Player & Script */}
                  <div className="col-12 col-lg-7">
                    {activeVideo && (
                      <div className="card border p-3 rounded-4 bg-white h-100">
                        <h6 className="fw-bold mb-2">{activeVideo.title}</h6>
                        <div
                          className="rounded-3 overflow-hidden bg-black mb-3 text-center d-flex align-items-center justify-content-center"
                          style={{ minHeight: 240, maxHeight: 360 }}
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
                            <div className="text-secondary p-4">Video preview unavailable</div>
                          )}
                        </div>

                        {/* Script & Storyboard */}
                        {activeVideo.script && (
                          <div className="mb-3">
                            <span className="small fw-semibold text-secondary d-block mb-1">Storyboard & Script:</span>
                            <pre
                              className="p-2 bg-light rounded-2 text-dark small mb-0"
                              style={{ whiteSpace: "pre-wrap", fontSize: "0.76rem" }}
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
                              className="btn btn-outline-primary btn-sm rounded-pill px-3"
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

          <div className="modal-footer border-top py-2 px-4">
            <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-4" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
