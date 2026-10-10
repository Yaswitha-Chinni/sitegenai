"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ViewportSwitcher, { ViewportMode } from "@/components/ui/ViewportSwitcher";
import { TEMPLATES_REGISTRY, TEMPLATE_CATEGORIES, createDefaultSectionsFromTemplate } from "@/lib/templates/registry";
import SectionRenderer from "@/components/preview/SectionRenderer";
import { projectService } from "@/lib/projects/projectService";
import { WebsiteTemplate, TemplateCategory } from "@/types/template";
import {
  Search,
  Grid,
  List,
  Heart,
  Eye,
  ArrowRight,
  Sparkles,
  X,
  PlusCircle,
  ExternalLink,
  Layers,
} from "lucide-react";

function TemplateGalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("cat") || "All Templates";

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "category">("name");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["w1"]);

  // Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<WebsiteTemplate | null>(null);
  const [previewViewport, setPreviewViewport] = useState<ViewportMode>("desktop");

  // Load favorites from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sitegenai_template_favs");
      if (stored) {
        setFavoriteIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favoriteIds.includes(id)) {
      updated = favoriteIds.filter((favId) => favId !== id);
    } else {
      updated = [...favoriteIds, id];
    }
    setFavoriteIds(updated);
    try {
      localStorage.setItem("sitegenai_template_favs", JSON.stringify(updated));
    } catch {}
  };

  // Filter & Sort Logic
  const filteredTemplates = TEMPLATES_REGISTRY.filter((tmpl) => {
    // Category check
    const matchesCategory =
      selectedCategory === "All Templates" || tmpl.categories.includes(selectedCategory as TemplateCategory);

    // Search check
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tmpl.name.toLowerCase().includes(q) ||
      tmpl.description.toLowerCase().includes(q) ||
      tmpl.style.toLowerCase().includes(q) ||
      tmpl.categories.some((c) => c.toLowerCase().includes(q));

    // Featured check
    const matchesFeatured = !featuredOnly || tmpl.featured;

    // Favorite check
    const matchesFavorite = !favoritesOnly || favoriteIds.includes(tmpl.id);

    return matchesCategory && matchesSearch && matchesFeatured && matchesFavorite;
  }).sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else {
      return a.categories[0].localeCompare(b.categories[0]);
    }
  });

  // Action: Use Template
  const handleUseTemplate = (template: WebsiteTemplate) => {
    const newProject = projectService.createFromTemplate(template.id);
    router.push(`/editor/${newProject.id}`);
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSelectedCategory("All Templates");
    setSearchQuery("");
    setFeaturedOnly(false);
    setFavoritesOnly(false);
    setSortBy("name");
  };

  return (
    <div className="d-flex flex-column min-vh-100 position-relative" style={{ backgroundColor: "#0B0D12", color: "#F1F5F9" }}>
      <Navbar />

      <main className="flex-grow-1 py-4 py-md-5 position-relative">
        {/* Subtle ambient background glow */}
        <div className="sb-glow-blob-emerald top-0 start-0 opacity-25" />
        <div className="sb-glow-blob-violet bottom-0 end-0 opacity-20" />

        <div className="container position-relative" style={{ zIndex: 2 }}>
          {/* ======================================================================
              HEADER AREA
              ====================================================================== */}
          <div
            className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom"
            style={{ borderColor: "#303947" }}
          >
            <div>
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <h1 className="display-6 fw-extrabold mb-0 text-white">
                  Explore Website <span className="sb-text-emerald">Templates</span>
                </h1>
                <span
                  className="badge rounded-pill px-3 py-1.5 fw-bold"
                  style={{
                    backgroundColor: "rgba(163, 255, 111, 0.15)",
                    border: "1px solid rgba(163, 255, 111, 0.35)",
                    color: "#A3FF6F",
                  }}
                  id="total-template-count"
                >
                  {TEMPLATES_REGISTRY.length} Available
                </span>
              </div>
              <p className="small mb-0" style={{ color: "#D1D5DB" }}>
                Choose a professionally architected starting point and make it yours in the visual editor.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Link href="/create" className="sb-btn-primary btn-sm py-2 px-3.5 btn-magnetic">
                <PlusCircle size={15} />
                Create From Scratch
              </Link>
            </div>
          </div>

          {/* ======================================================================
              CATEGORY NAVIGATION (PILLS)
              ====================================================================== */}
          <div className="mb-4">
            <div className="d-flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
              {TEMPLATE_CATEGORIES.map((cat) => {
                const count =
                  cat === "All Templates"
                    ? TEMPLATES_REGISTRY.length
                    : TEMPLATES_REGISTRY.filter((t) => t.categories.includes(cat as TemplateCategory)).length;
                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    className={`sb-filter-pill d-flex align-items-center gap-2 ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                    id={`cat-pill-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <span>{cat}</span>
                    <span
                      className="badge rounded-pill fw-semibold"
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: isActive ? "rgba(163, 255, 111, 0.25)" : "#202938",
                        color: isActive ? "#A3FF6F" : "#D1D5DB",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================================
              SORTING, SEARCH & VIEW CONTROLS
              ====================================================================== */}
          <div className="p-3 mb-4 rounded-3 border shadow-sm" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
            <div className="row g-3 align-items-center justify-content-between">
              {/* Search Bar */}
              <div className="col-12 col-md-5 col-lg-4">
                <div
                  className="d-flex align-items-center px-3 py-1.5 rounded-pill"
                  style={{
                    backgroundColor: "#10141C",
                    border: "1px solid #303947",
                  }}
                >
                  <Search size={16} className="me-2 flex-shrink-0" style={{ color: "#BFC7D2" }} />
                  <input
                    type="text"
                    className="form-control bg-transparent border-0 text-white p-0 shadow-none small"
                    placeholder="Search by name, category, or style..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="template-search-input"
                    style={{ outline: "none" }}
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-link p-0 ms-1"
                      style={{ color: "#BFC7D2" }}
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search query"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters & Sort Controls */}
              <div className="col-12 col-md-7 col-lg-8 d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
                {/* Sort dropdown */}
                <div className="d-flex align-items-center gap-2">
                  <span className="small d-none d-lg-inline" style={{ color: "#BFC7D2" }}>Sort:</span>
                  <select
                    className="form-select form-select-sm text-white rounded-pill px-3 py-1.5"
                    style={{
                      width: "auto",
                      backgroundColor: "#10141C",
                      borderColor: "#303947",
                      color: "#FFFFFF",
                    }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "name" | "category")}
                    id="sort-select"
                  >
                    <option value="name" className="bg-dark text-white">Sort by Name (A-Z)</option>
                    <option value="category" className="bg-dark text-white">Sort by Category</option>
                  </select>
                </div>

                {/* Featured filter toggle */}
                <button
                  type="button"
                  className={`sb-filter-pill d-flex align-items-center gap-1.5 py-1.5 px-3 small ${
                    featuredOnly ? "active" : ""
                  }`}
                  onClick={() => setFeaturedOnly(!featuredOnly)}
                  id="filter-featured-btn"
                >
                  <Sparkles size={14} />
                  <span>Featured</span>
                </button>

                {/* Favorites filter toggle */}
                <button
                  type="button"
                  className={`sb-filter-pill d-flex align-items-center gap-1.5 py-1.5 px-3 small ${
                    favoritesOnly ? "active" : ""
                  }`}
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  id="filter-favorites-btn"
                >
                  <Heart size={14} className={favoritesOnly ? "fill-danger text-danger" : ""} />
                  <span>Favorites ({favoriteIds.length})</span>
                </button>

                {/* Grid / List View Switcher */}
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                    aria-label="Grid view"
                    style={{
                      borderRadius: "8px 0 0 8px",
                      backgroundColor: viewMode === "grid" ? "#A3FF6F" : "#10141C",
                      color: viewMode === "grid" ? "#0B0D12" : "#FFFFFF",
                      borderColor: "#303947",
                      fontWeight: 600,
                    }}
                  >
                    <Grid size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setViewMode("list")}
                    title="List View"
                    aria-label="List view"
                    style={{
                      borderRadius: "0 8px 8px 0",
                      backgroundColor: viewMode === "list" ? "#A3FF6F" : "#10141C",
                      color: viewMode === "list" ? "#0B0D12" : "#FFFFFF",
                      borderColor: "#303947",
                      fontWeight: 600,
                    }}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================
              TEMPLATE CARDS & EMPTY STATE
              ====================================================================== */}
          {filteredTemplates.length === 0 ? (
            <div className="p-5 text-center rounded-3 border shadow-sm my-4" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
              <div
                className="d-inline-flex p-3 rounded-circle mb-3"
                style={{ backgroundColor: "rgba(163, 255, 111, 0.12)", color: "#A3FF6F" }}
              >
                <Search size={32} />
              </div>
              <h4 className="fw-bold text-white mb-2">No templates found matching your criteria</h4>
              <p className="small mb-4 mx-auto" style={{ maxWidth: 460, color: "#D1D5DB" }}>
                Try adjusting your search keywords, clearing active category filters, or turning off the favorites filter.
              </p>
              <button onClick={handleClearFilters} className="sb-btn-primary btn-sm py-2 px-4 btn-magnetic" id="btn-clear-filters">
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="row g-4">
              {filteredTemplates.map((tmpl) => {
                const isFav = favoriteIds.includes(tmpl.id);
                return (
                  <div key={tmpl.id} className="col-12 col-sm-6 col-lg-4 col-xl-4">
                    <div
                      className="sb-card card-3d-tilt card-spotlight h-100 d-flex flex-column overflow-hidden rounded-3 border"
                      style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
                    >
                      {/* Thumbnail frame with hover zoom */}
                      <div
                        className="position-relative overflow-hidden border-bottom card-img-zoom"
                        style={{ height: "220px", borderColor: "#303947", backgroundColor: "#10141C" }}
                      >
                        {tmpl.id === "w1" ? (
                          <div
                            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-center"
                            style={{ backgroundColor: "#0A1D30" }}
                          >
                            <img
                              src="/templates/w1/coco-pour-logo.png"
                              alt="COCO POUR Logo"
                              className="img-fluid mb-2"
                              style={{ maxHeight: "75px", objectFit: "contain" }}
                            />
                            <div className="text-white small fw-bold">COCO POUR Brand Website</div>
                            <small style={{ color: "#BFC7D2" }}>4 HD Videos &bull; Barista Moments &bull; GSAP</small>
                          </div>
                        ) : (
                          <img
                            src={tmpl.thumbnail}
                            alt={tmpl.name}
                            className="w-100 h-100 object-fit-cover"
                          />
                        )}

                        {/* Badges on preview */}
                        <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1">
                          {tmpl.id === "w1" && (
                            <span className="badge bg-success text-white shadow-sm fw-bold">
                              Template W1
                            </span>
                          )}
                          {tmpl.featured && (
                            <span
                              className="badge shadow-sm fw-bold"
                              style={{ backgroundColor: "#A3FF6F", color: "#0B0D12" }}
                            >
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Favorite button */}
                        <button
                          type="button"
                          className="btn btn-sm position-absolute top-0 end-0 m-3 rounded-circle p-2 shadow-sm"
                          style={{
                            backgroundColor: "rgba(16, 20, 28, 0.85)",
                            backdropFilter: "blur(6px)",
                            border: "1px solid #303947",
                          }}
                          onClick={(e) => toggleFavorite(tmpl.id, e)}
                          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                          title={isFav ? "Remove favorite" : "Save to favorites"}
                        >
                          <Heart size={15} className={isFav ? "text-danger fill-danger" : "text-white"} />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 d-flex flex-column flex-grow-1 justify-content-between">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            {tmpl.categories.map((c) => (
                              <span
                                key={c}
                                className="badge rounded-pill small fw-semibold"
                                style={{
                                  backgroundColor: "rgba(163, 255, 111, 0.15)",
                                  border: "1px solid rgba(163, 255, 111, 0.35)",
                                  color: "#A3FF6F",
                                }}
                              >
                                {c}
                              </span>
                            ))}
                            <span className="small ms-auto fw-semibold" style={{ color: "#BFC7D2" }}>{tmpl.style}</span>
                          </div>

                          <h5 className="fw-bold text-white mb-2">{tmpl.name}</h5>
                          <p className="small mb-3" style={{ lineHeight: 1.6, color: "#D1D5DB" }}>
                            {tmpl.description}
                          </p>
                        </div>

                        <div
                          className="pt-3 border-top d-flex align-items-center justify-content-between gap-2"
                          style={{ borderColor: "#303947" }}
                        >
                          <button
                            type="button"
                            className="sb-btn-outline btn-sm flex-grow-1 py-1.5"
                            onClick={() => {
                              setPreviewTemplate(tmpl);
                              setPreviewViewport("desktop");
                            }}
                            id={`btn-preview-${tmpl.id}`}
                          >
                            <Eye size={15} />
                            Preview
                          </button>
                          <button
                            type="button"
                            className="sb-btn-primary btn-sm flex-grow-1 py-1.5"
                            onClick={() => handleUseTemplate(tmpl)}
                            id={`btn-use-template-${tmpl.id}`}
                          >
                            Use Template
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="d-flex flex-column gap-3">
              {filteredTemplates.map((tmpl) => {
                const isFav = favoriteIds.includes(tmpl.id);
                return (
                  <div
                    key={tmpl.id}
                    className="sb-card card-spotlight p-3 p-md-4 rounded-3 border shadow-sm"
                    style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
                  >
                    <div className="row align-items-center g-3">
                      <div className="col-12 col-md-3 col-lg-2">
                        <div
                          className="rounded-3 overflow-hidden border card-img-zoom"
                          style={{ height: "120px", borderColor: "#303947", backgroundColor: "#10141C" }}
                        >
                          {tmpl.id === "w1" ? (
                            <div
                              className="w-100 h-100 d-flex align-items-center justify-content-center p-2"
                              style={{ backgroundColor: "#0A1D30" }}
                            >
                              <img
                                src="/templates/w1/coco-pour-logo.png"
                                alt="COCO POUR Logo"
                                style={{ maxHeight: "50px", objectFit: "contain" }}
                              />
                            </div>
                          ) : (
                            <img src={tmpl.thumbnail} alt={tmpl.name} className="w-100 h-100 object-fit-cover" />
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-lg-7">
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          {tmpl.categories.map((c) => (
                            <span
                              key={c}
                              className="badge rounded-pill small fw-semibold"
                              style={{
                                backgroundColor: "rgba(163, 255, 111, 0.15)",
                                border: "1px solid rgba(163, 255, 111, 0.35)",
                                color: "#A3FF6F",
                              }}
                            >
                              {c}
                            </span>
                          ))}
                          <span className="small ms-2 fw-semibold" style={{ color: "#BFC7D2" }}>{tmpl.style}</span>
                        </div>
                        <h5 className="fw-bold text-white mb-1">{tmpl.name}</h5>
                        <p className="small mb-0" style={{ color: "#D1D5DB" }}>{tmpl.description}</p>
                      </div>

                      <div className="col-12 col-md-3 col-lg-3 d-flex flex-column align-items-end justify-content-center gap-2">
                        <div className="d-flex align-items-center gap-2 w-100">
                          <button
                            type="button"
                            className="sb-btn-outline btn-sm flex-grow-1 py-1.5"
                            onClick={() => {
                              setPreviewTemplate(tmpl);
                              setPreviewViewport("desktop");
                            }}
                          >
                            <Eye size={15} />
                            Preview
                          </button>
                          <button
                            type="button"
                            className="sb-btn-primary btn-sm flex-grow-1 py-1.5"
                            onClick={() => handleUseTemplate(tmpl)}
                          >
                            Use Template
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm rounded-circle p-2 border"
                            style={{
                              backgroundColor: "#202938",
                              borderColor: "#303947",
                            }}
                            onClick={(e) => toggleFavorite(tmpl.id, e)}
                            aria-label="Toggle favorite"
                          >
                            <Heart size={15} className={isFav ? "text-danger fill-danger" : "text-white"} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================================================================
              FUNCTIONAL TEMPLATE PREVIEW MODAL
              ====================================================================== */}
          {previewTemplate && (
            <div
              className="modal fade show d-block"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              style={{ backgroundColor: "rgba(11, 13, 18, 0.92)", backdropFilter: "blur(10px)", zIndex: 1060 }}
            >
              <div className="modal-dialog modal-fullscreen p-2 p-md-4">
                <div
                  className="modal-content rounded-4 shadow-2xl overflow-hidden d-flex flex-column h-100 border"
                  style={{
                    backgroundColor: "#151A24",
                    borderColor: "#303947",
                  }}
                >
                  {/* Modal Header */}
                  <div
                    className="modal-header py-3 px-4 d-flex justify-content-between align-items-center border-bottom"
                    style={{
                      backgroundColor: "#10141C",
                      borderColor: "#303947",
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h5 className="modal-title fw-bold text-white mb-0">{previewTemplate.name}</h5>
                          {previewTemplate.categories.map((c) => (
                            <span
                              key={c}
                              className="badge rounded-pill small fw-semibold"
                              style={{
                                backgroundColor: "rgba(163, 255, 111, 0.15)",
                                border: "1px solid rgba(163, 255, 111, 0.35)",
                                color: "#A3FF6F",
                              }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                        <small style={{ color: "#D1D5DB" }}>{previewTemplate.tagline}</small>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <ViewportSwitcher
                        currentMode={previewViewport}
                        onChange={setPreviewViewport}
                      />

                      {(previewTemplate.id === "w1" || previewTemplate.id === "w2") && (
                        <a
                          href={previewTemplate.id === "w1" ? "/templates/w1/index.html" : "/templates/w2/index.html"}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3 text-white d-none d-md-flex align-items-center gap-1.5 text-decoration-none"
                          style={{ borderColor: "#303947" }}
                        >
                          <ExternalLink size={14} />
                          <span>Open in New Tab</span>
                        </a>
                      )}

                      <button
                        type="button"
                        className="sb-btn-primary btn-sm py-1.5 px-3 btn-magnetic"
                        onClick={() => handleUseTemplate(previewTemplate)}
                        id="modal-btn-use-template"
                      >
                        Use This Template
                        <ArrowRight size={15} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm text-white border p-1.5 rounded-circle"
                        style={{ backgroundColor: "#202938", borderColor: "#303947" }}
                        aria-label="Close modal preview"
                        onClick={() => setPreviewTemplate(null)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body with Viewport emulation */}
                  <div
                    className="modal-body p-0 p-md-3 overflow-y-auto d-flex justify-content-center"
                    style={{ backgroundColor: "#0B0D12" }}
                  >
                    <div
                      className={`viewport-frame-wrapper viewport-${previewViewport} w-100`}
                      style={{
                        maxWidth:
                          previewViewport === "mobile"
                            ? "390px"
                            : previewViewport === "tablet"
                            ? "768px"
                            : "100%",
                      }}
                    >
                      <div
                        className="preview-browser-frame shadow-2xl h-100 border"
                        style={{
                          backgroundColor: "#151A24",
                          borderColor: "#303947",
                        }}
                      >
                        <div
                          className="browser-header-bar border-bottom"
                          style={{
                            backgroundColor: "#10141C",
                            borderColor: "#303947",
                          }}
                        >
                          <div className="browser-dots">
                            <span className="browser-dot red"></span>
                            <span className="browser-dot yellow"></span>
                            <span className="browser-dot green"></span>
                          </div>
                          <div
                            className="browser-url-pill"
                            style={{
                              backgroundColor: "#0B0D12",
                              borderColor: "#303947",
                              color: "#A3FF6F",
                            }}
                          >
                            <span>https://preview.sitegenai.app/{previewTemplate.id}</span>
                          </div>
                          <span
                            className="badge border small fw-semibold"
                            style={{
                              backgroundColor: "#202938",
                              borderColor: "#303947",
                              color: "#BFC7D2",
                            }}
                          >
                            {previewViewport.toUpperCase()}
                          </span>
                        </div>

                        <div
                          className="overflow-y-auto w-100"
                          style={{
                            minHeight: "80vh",
                            backgroundColor:
                              previewTemplate.id === "w1"
                                ? "#FFFFFF"
                                : previewTemplate.id === "w2"
                                ? "#080504"
                                : previewTemplate.colors.background || "#FFFFFF",
                          }}
                        >
                          {previewTemplate.id === "w1" ? (
                            <iframe
                              src="/templates/w1/index.html"
                              title="COCO POUR Template Live Interactive Preview"
                              className="w-100 border-0"
                              style={{ minHeight: "85vh", height: "100%", display: "block" }}
                            />
                          ) : previewTemplate.id === "w2" ? (
                            <iframe
                              src="/templates/w2/index.html"
                              title="BRUVA Coffee Template Live Interactive Preview"
                              className="w-100 border-0"
                              style={{ minHeight: "85vh", height: "100%", display: "block" }}
                            />
                          ) : (
                            <div className="w-100 website-template-scope">
                              <SectionRenderer
                                sections={createDefaultSectionsFromTemplate(previewTemplate.id)}
                                theme={{
                                  primaryColor: previewTemplate.colors.primary,
                                  secondaryColor: previewTemplate.colors.secondary,
                                  backgroundColor: previewTemplate.colors.background,
                                  fontFamily: "Outfit, sans-serif",
                                }}
                                isEditableCanvas={false}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TemplateGalleryPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center text-white min-vh-100" style={{ backgroundColor: "#0B0D12" }}>Loading template gallery...</div>}>
      <TemplateGalleryContent />
    </Suspense>
  );
}
