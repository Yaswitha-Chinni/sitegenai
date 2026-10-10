"use client";

import React, { useState, useRef } from "react";
import { UploadedAsset, AssetType, AssetAnalysis } from "@/types/asset";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCheck,
  Maximize2,
} from "lucide-react";

interface AssetUploaderProps {
  projectId?: string;
  assets: UploadedAsset[];
  onAssetsChange: (assets: UploadedAsset[]) => void;
  allowedTypes?: AssetType[];
}

export default function AssetUploader({
  projectId,
  assets,
  onAssetsChange,
  allowedTypes = ["logo", "product", "brand", "video"],
}: AssetUploaderProps) {
  const [selectedType, setSelectedType] = useState<AssetType>("brand");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingAssetId, setProcessingAssetId] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; isVideo: boolean; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", selectedType);
      if (projectId) formData.append("projectId", projectId);

      // Simulate step progress
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 200);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload asset");
      }

      onAssetsChange([...assets, data.asset]);
      setSuccessMessage(`"${file.name}" uploaded and verified successfully.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed. Please check the file size and type.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveAsset = (id: string) => {
    onAssetsChange(assets.filter((a) => a.id !== id));
  };

  const handleAnalyzeAsset = async (asset: UploadedAsset) => {
    setProcessingAssetId(asset.id);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/image-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetUrl: asset.url, assetName: asset.name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      const updated = assets.map((a) => (a.id === asset.id ? { ...a, analysis: data.analysis } : a));
      onAssetsChange(updated);
      setSuccessMessage(`AI analysis complete for "${asset.name}".`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze image asset.");
    } finally {
      setProcessingAssetId(null);
    }
  };

  const handleEnhanceAsset = async (asset: UploadedAsset) => {
    setProcessingAssetId(asset.id);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/image-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: asset.id,
          assetUrl: asset.url,
          assetName: asset.name,
          assetType: asset.type,
          enhancementMode: asset.type === "logo" ? "vectorize" : "upscale",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Enhancement workflow could not be completed.");
      }

      const updated = assets.map((a) =>
        a.id === asset.id
          ? {
              ...a,
              enhancedUrl: data.enhancedUrl,
              enhancementStatus: "completed" as const,
            }
          : a
      );
      onAssetsChange(updated);
      setSuccessMessage(data.message || `Enhanced copy generated for "${asset.name}". Original is preserved.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setProcessingAssetId(null);
    }
  };

  return (
    <div className="asset-uploader-widget">
      {/* Upload Type Selector Tabs */}
      <div className="d-flex gap-2 mb-3">
        {allowedTypes.map((t) => (
          <button
            key={t}
            type="button"
            className={`btn btn-sm rounded-pill text-capitalize ${
              selectedType === t ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => setSelectedType(t)}
          >
            {t === "video" ? <Video size={14} className="me-1" /> : <ImageIcon size={14} className="me-1" />}
            {t}
          </button>
        ))}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        className="upload-dropzone p-4 text-center border-2 border-dashed rounded-4 bg-light mb-3 position-relative"
        style={{
          borderColor: "var(--sg-border, #DCE6F5)",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          accept={
            selectedType === "video"
              ? "video/mp4,video/webm"
              : "image/png,image/jpeg,image/webp,image/svg+xml"
          }
          onChange={handleFileSelect}
        />
        <div className="d-inline-flex p-3 rounded-circle bg-white shadow-sm mb-2 text-primary">
          <Upload size={24} />
        </div>
        <h6 className="fw-bold mb-1">
          Click to upload {selectedType === "video" ? "promotional video" : `${selectedType} asset`}
        </h6>
        <p className="small text-secondary mb-0">
          {selectedType === "video"
            ? "MP4 or WebM (up to 60MB)"
            : "PNG, JPG, SVG, WebP (up to 15MB)"}
        </p>

        {isUploading && (
          <div className="mt-3">
            <div className="progress rounded-pill" style={{ height: 6 }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="small text-primary mt-1 d-block fw-semibold">
              Uploading & verifying ({uploadProgress}%)...
            </span>
          </div>
        )}
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Assets Grid List */}
      {assets.length > 0 && (
        <div className="row g-2">
          {assets.map((asset) => {
            const isVideo = asset.type === "video" || asset.mimeType.startsWith("video/");
            const isProcessing = processingAssetId === asset.id;

            return (
              <div key={asset.id} className="col-12 col-md-6">
                <div className="card h-100 border p-2 rounded-3 shadow-xs bg-white">
                  <div className="d-flex align-items-center gap-2">
                    {/* Media Thumbnail */}
                    <div
                      className="rounded overflow-hidden bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 56, height: 56 }}
                    >
                      {isVideo ? (
                        <video src={asset.url} className="w-100 h-100 object-fit-cover" muted />
                      ) : (
                        <img
                          src={asset.enhancedUrl || asset.url}
                          alt={asset.name}
                          className="w-100 h-100 object-fit-contain"
                        />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-semibold small text-truncate" title={asset.name}>
                        {asset.name}
                      </div>
                      <div className="d-flex align-items-center gap-1 mt-1">
                        <span className="badge bg-secondary-subtle text-secondary small text-capitalize" style={{ fontSize: "0.7rem" }}>
                          {asset.type}
                        </span>
                        {asset.enhancedUrl && (
                          <span className="badge bg-success-subtle text-success small" style={{ fontSize: "0.7rem" }}>
                            AI Enhanced
                          </span>
                        )}
                        <span className="text-muted small" style={{ fontSize: "0.7rem" }}>
                          {(asset.size / (1024 * 1024)).toFixed(1)}MB
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex flex-column gap-1 flex-shrink-0">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary p-1"
                        title="Preview"
                        onClick={() =>
                          setPreviewModalUrl({
                            url: asset.enhancedUrl || asset.url,
                            isVideo,
                            title: asset.name,
                          })
                        }
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger p-1"
                        title="Remove"
                        onClick={() => handleRemoveAsset(asset.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* AI Actions Row */}
                  {!isVideo && (
                    <div className="mt-2 pt-2 border-top d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-xs btn-outline-primary small py-0 px-2 rounded-pill d-flex align-items-center gap-1"
                        style={{ fontSize: "0.72rem" }}
                        disabled={isProcessing}
                        onClick={() => handleAnalyzeAsset(asset)}
                      >
                        {isProcessing ? <RefreshCw size={11} className="spin" /> : <Sparkles size={11} />}
                        Analyze Placement
                      </button>

                      <button
                        type="button"
                        className="btn btn-xs btn-outline-success small py-0 px-2 rounded-pill d-flex align-items-center gap-1"
                        style={{ fontSize: "0.72rem" }}
                        disabled={isProcessing}
                        onClick={() => handleEnhanceAsset(asset)}
                      >
                        <Sparkles size={11} />
                        AI Enhance
                      </button>
                    </div>
                  )}

                  {/* Analysis Result Display */}
                  {asset.analysis && (
                    <div className="mt-2 p-2 bg-light rounded small" style={{ fontSize: "0.74rem" }}>
                      <span className="fw-semibold text-primary">Placement:</span> {asset.analysis.suggestedRole}
                      {asset.analysis.dominantColors && (
                        <div className="d-flex gap-1 mt-1">
                          {asset.analysis.dominantColors.map((c, i) => (
                            <span
                              key={i}
                              className="rounded-circle border"
                              style={{ width: 12, height: 12, backgroundColor: c }}
                              title={c}
                            ></span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewModalUrl && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header">
                <h6 className="modal-title fw-bold text-truncate">{previewModalUrl.title}</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPreviewModalUrl(null)}
                ></button>
              </div>
              <div className="modal-body p-0 text-center bg-dark">
                {previewModalUrl.isVideo ? (
                  <video src={previewModalUrl.url} controls autoPlay className="w-100" style={{ maxHeight: "70vh" }} />
                ) : (
                  <img
                    src={previewModalUrl.url}
                    alt={previewModalUrl.title}
                    className="img-fluid"
                    style={{ maxHeight: "70vh" }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
