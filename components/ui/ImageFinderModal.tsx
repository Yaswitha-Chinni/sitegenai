"use client";

import React, { useState, useEffect } from "react";
import { ImageMetadata } from "@/types/project";
import {
  Search,
  X,
  Upload,
  Image as ImageIcon,
  Camera,
  RefreshCw,
} from "lucide-react";

interface ImageFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: ImageMetadata) => void;
  initialQuery?: string;
  defaultOrientation?: "landscape" | "portrait" | "square";
  title?: string;
}

export default function ImageFinderModal({
  isOpen,
  onClose,
  onSelectImage,
  initialQuery = "",
  defaultOrientation = "landscape",
  title = "Select Stock Photograph",
}: ImageFinderModalProps) {
  const [activeTab, setActiveTab] = useState<"search" | "upload">("search");
  const [query, setQuery] = useState(initialQuery);
  const [orientation, setOrientation] = useState<"landscape" | "portrait" | "square" | "all">("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImageMetadata[]>([]);
  const [provider, setProvider] = useState<string>("pexels");
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery || "modern aesthetic");
      fetchPhotos(initialQuery || "modern aesthetic", defaultOrientation);
    }
  }, [isOpen, initialQuery, defaultOrientation]);

  const fetchPhotos = async (searchQuery: string, orient: string = "all") => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const orientParam = orient !== "all" ? `&orientation=${orient}` : "";
      const res = await fetch(`/api/images/search?query=${encodeURIComponent(searchQuery)}${orientParam}&perPage=15`);
      const data = await res.json();
      if (data.success && data.photos) {
        setResults(data.photos);
        setProvider(data.provider);
      } else {
        setError(data.error || "Failed to find photos");
      }
    } catch (err: any) {
      setError(err?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPhotos(query, orientation);
  };

  const handleOrientationChange = (orient: "landscape" | "portrait" | "square" | "all") => {
    setOrientation(orient);
    fetchPhotos(query, orient);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const uploadedMeta: ImageMetadata = {
        id: `upload-${Date.now()}`,
        url: dataUrl,
        thumbnailUrl: dataUrl,
        source: "upload",
        photographer: "Custom Upload",
        alt: file.name.replace(/\.[^/.]+$/, ""),
        focalPoint: { x: 50, y: 50 },
      };
      setIsUploading(false);
      onSelectImage(uploadedMeta);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{
        backgroundColor: "rgba(11, 13, 18, 0.88)",
        backdropFilter: "blur(8px)",
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content rounded-4 border shadow-2xl text-white"
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
            <div className="d-flex align-items-center gap-2">
              <div
                className="p-1.5 rounded-3 d-flex align-items-center justify-content-center"
                style={{ background: "#A3FF6F", color: "#0B0D12" }}
              >
                <Camera size={18} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0 fs-6">{title}</h5>
                <small style={{ color: "#BFC7D2", fontSize: "0.76rem" }}>
                  Free-to-use photography from Pexels, Unsplash &amp; verified stock artists
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {/* Tabs */}
              <div
                className="btn-group p-0.5 rounded-pill"
                style={{
                  backgroundColor: "#10141C",
                  border: "1px solid #303947",
                }}
              >
                <button
                  type="button"
                  className="btn btn-sm rounded-pill px-3 py-1 fw-medium"
                  style={
                    activeTab === "search"
                      ? { backgroundColor: "#A3FF6F", color: "#0B0D12" }
                      : { color: "#BFC7D2" }
                  }
                  onClick={() => setActiveTab("search")}
                >
                  <Search size={13} className="me-1" />
                  Stock Search
                </button>
                <button
                  type="button"
                  className="btn btn-sm rounded-pill px-3 py-1 fw-medium"
                  style={
                    activeTab === "upload"
                      ? { backgroundColor: "#A3FF6F", color: "#0B0D12" }
                      : { color: "#BFC7D2" }
                  }
                  onClick={() => setActiveTab("upload")}
                >
                  <Upload size={13} className="me-1" />
                  Custom Upload
                </button>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary text-white rounded-circle ms-2"
                style={{ width: 32, height: 32, padding: 0, borderColor: "#303947" }}
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {activeTab === "search" ? (
              <>
                {/* Search Bar & Orientation Filters */}
                <div className="mb-4">
                  <form onSubmit={handleSearchSubmit} className="d-flex gap-2 mb-3">
                    <div className="input-group">
                      <span
                        className="input-group-text border-end-0"
                        style={{
                          backgroundColor: "#10141C",
                          borderColor: "#303947",
                          color: "#BFC7D2",
                        }}
                      >
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control text-white border-start-0"
                        style={{
                          backgroundColor: "#10141C",
                          borderColor: "#303947",
                          color: "#FFFFFF",
                        }}
                        placeholder="Search stock photographs (e.g., honey, latte art, architectural villa)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 d-flex align-items-center gap-2 fw-bold rounded-pill"
                      style={{
                        backgroundColor: "#A3FF6F",
                        color: "#0B0D12",
                        border: "none",
                      }}
                      disabled={loading}
                    >
                      {loading ? <RefreshCw size={14} className="spin" /> : <Search size={14} />}
                      Search
                    </button>
                  </form>

                  {/* Orientation Filters & Provider Badge */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-1">
                      <span className="small me-2" style={{ color: "#BFC7D2" }}>Orientation:</span>
                      {(["all", "landscape", "portrait", "square"] as const).map((orient) => (
                        <button
                          key={orient}
                          type="button"
                          className="btn btn-sm rounded-pill py-0.5 px-2.5 small fw-medium"
                          style={
                            orientation === orient
                              ? { backgroundColor: "#A3FF6F", color: "#0B0D12", border: "none" }
                              : { backgroundColor: "#10141C", color: "#BFC7D2", border: "1px solid #303947" }
                          }
                          onClick={() => handleOrientationChange(orient)}
                        >
                          {orient.charAt(0).toUpperCase() + orient.slice(1)}
                        </button>
                      ))}
                    </div>

                    <div className="d-flex align-items-center gap-2 small" style={{ color: "#BFC7D2" }}>
                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: "rgba(163, 255, 111, 0.15)",
                          border: "1px solid rgba(163, 255, 111, 0.3)",
                          color: "#A3FF6F",
                        }}
                      >
                        Provider: {provider.toUpperCase()}
                      </span>
                      <span>Free Commercial Use (Attribution Included)</span>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div
                    className="alert py-2 small mb-3 rounded-3"
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#FCA5A5",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: "#A3FF6F" }} role="status">
                      <span className="visually-hidden">Searching stock photos...</span>
                    </div>
                    <p className="small mt-2" style={{ color: "#BFC7D2" }}>Retrieving curated high-resolution photography...</p>
                  </div>
                )}

                {/* Results Grid */}
                {!loading && (
                  <div className="row g-3">
                    {results.map((photo) => (
                      <div key={photo.id} className="col-12 col-sm-6 col-md-4 col-lg-4">
                        <div
                          className="h-100 overflow-hidden position-relative group-hover cursor-pointer rounded-3"
                          style={{
                            background: "#10141C",
                            border: "1px solid #303947",
                          }}
                          onClick={() => {
                            onSelectImage(photo);
                            onClose();
                          }}
                        >
                          <div
                            className="position-relative overflow-hidden"
                            style={{ height: 180, backgroundColor: photo.avgColor || "#000" }}
                          >
                            <img
                              src={photo.thumbnailUrl || photo.url}
                              alt={photo.alt}
                              className="w-100 h-100 object-fit-cover"
                              loading="lazy"
                            />
                            <span
                              className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 text-white border border-secondary border-opacity-50 small"
                              style={{ fontSize: "0.68rem" }}
                            >
                              {photo.source.toUpperCase()}
                            </span>
                          </div>

                          <div className="p-2.5 d-flex flex-column justify-content-between">
                            <p
                              className="small mb-1 text-truncate"
                              title={photo.alt}
                              style={{ fontSize: "0.78rem", color: "#F1F5F9" }}
                            >
                              {photo.alt || "Stock photograph"}
                            </p>
                            <div className="d-flex align-items-center justify-content-between pt-1 border-top" style={{ borderColor: "#303947" }}>
                              <span
                                className="small text-truncate"
                                style={{ fontSize: "0.72rem", maxWidth: 140, color: "#BFC7D2" }}
                              >
                                By {photo.photographer || "Artist"}
                              </span>
                              <button
                                type="button"
                                className="btn btn-sm py-0.5 px-2.5 small fw-bold rounded-pill"
                                style={{
                                  fontSize: "0.72rem",
                                  backgroundColor: "#A3FF6F",
                                  color: "#0B0D12",
                                  border: "none",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectImage(photo);
                                  onClose();
                                }}
                              >
                                Select
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {results.length === 0 && !loading && (
                      <div className="col-12 text-center py-5">
                        <ImageIcon size={32} style={{ color: "#BFC7D2" }} className="mb-2" />
                        <h6 className="fw-bold text-white">No photos found</h6>
                        <p className="small" style={{ color: "#BFC7D2" }}>
                          Try searching for a different keyword like &quot;coffee&quot;, &quot;honey&quot;, &quot;tech&quot;, or &quot;modern&quot;.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Custom Upload Tab */
              <div className="text-center py-5">
                <div
                  className="p-5 border border-dashed rounded-4 mx-auto"
                  style={{
                    maxWidth: 500,
                    borderColor: "#303947",
                    backgroundColor: "#10141C",
                  }}
                >
                  <Upload size={36} className="mb-3" style={{ color: "#A3FF6F" }} />
                  <h5 className="fw-bold text-white mb-2">Upload Custom Image</h5>
                  <p className="small mb-4" style={{ color: "#BFC7D2" }}>
                    Select a JPEG, PNG, or WebP photograph from your local computer.
                  </p>
                  <label
                    className="py-2.5 px-4 cursor-pointer fw-bold rounded-pill d-inline-block"
                    style={{
                      backgroundColor: "#A3FF6F",
                      color: "#0B0D12",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? "Uploading..." : "Browse Image Files"}
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Licensing Notice */}
          <div
            className="modal-footer py-2.5 px-4 d-flex justify-content-between align-items-center"
            style={{ borderTop: "1px solid #303947" }}
          >
            <span className="small" style={{ fontSize: "0.75rem", color: "#BFC7D2" }}>
              Photos provided by Pexels / Unsplash creators. Free commercial use under respective API licenses.
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary text-white rounded-pill px-3"
              style={{ borderColor: "#303947" }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
