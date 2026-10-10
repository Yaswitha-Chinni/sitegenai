"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ViewportSwitcher, { ViewportMode } from "@/components/ui/ViewportSwitcher";
import { TEMPLATES_REGISTRY, TEMPLATE_CATEGORIES } from "@/lib/templates/registry";
import { projectService } from "@/lib/projects/projectService";
import { WebsiteTemplate, TemplateCategory } from "@/types/template";
import {
  Search,
  SlidersHorizontal,
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
  CheckCircle2,
  Filter,
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
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="flex-grow-1 py-4 py-md-5">
        <div className="container">
          {/* ======================================================================
              7.4 HEADER AREA
              ====================================================================== */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h1 className="display-6 fw-extrabold mb-0">Explore Website Templates</h1>
                <span className="badge bg-primary-subtle text-primary fw-bold" id="total-template-count">
                  {TEMPLATES_REGISTRY.length} Available
                </span>
              </div>
              <p className="text-secondary small mb-0">
                Choose a professionally architected starting point and make it yours in the visual editor.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Link href="/create" className="btn btn-sg-outline btn-sg-sm">
                <PlusCircle size={15} />
                Create From Scratch
              </Link>
            </div>
          </div>

          {/* ======================================================================
              7.4 CATEGORY NAVIGATION (PILLS)
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
                    className={`btn btn-sm text-nowrap rounded-pill px-3 py-2 d-flex align-items-center gap-2 ${
                      isActive ? "btn-primary shadow-sm" : "btn-white bg-white border text-secondary"
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                    id={`cat-pill-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`badge rounded-pill ${
                        isActive ? "bg-white text-primary" : "bg-light text-secondary border"
                      }`}
                      style={{ fontSize: "0.72rem" }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================================
              7.4 SORTING, SEARCH & VIEW CONTROLS
              ====================================================================== */}
          <div className="sg-card p-3 bg-white mb-4 shadow-sm">
            <div className="row g-3 align-items-center justify-content-between">
              {/* Search Bar */}
              <div className="col-12 col-md-5 col-lg-4">
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control sg-form-control border-start-0 ps-0"
                    placeholder="Search by name, category, or style..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="template-search-input"
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-light border border-start-0"
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
                <div className="d-flex align-items-center gap-1">
                  <span className="small text-muted d-none d-lg-inline">Sort:</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "auto" }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "name" | "category")}
                    id="sort-select"
                  >
                    <option value="name">Sort by Name (A-Z)</option>
                    <option value="category">Sort by Category</option>
                  </select>
                </div>

                {/* Featured filter toggle */}
                <button
                  type="button"
                  className={`btn btn-sm ${
                    featuredOnly ? "btn-primary" : "btn-light border text-secondary"
                  } d-flex align-items-center gap-1`}
                  onClick={() => setFeaturedOnly(!featuredOnly)}
                  id="filter-featured-btn"
                >
                  <Sparkles size={14} />
                  <span>Featured</span>
                </button>

                {/* Favorites filter toggle */}
                <button
                  type="button"
                  className={`btn btn-sm ${
                    favoritesOnly ? "btn-danger text-white" : "btn-light border text-secondary"
                  } d-flex align-items-center gap-1`}
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  id="filter-favorites-btn"
                >
                  <Heart size={14} className={favoritesOnly ? "fill-white" : ""} />
                  <span>Favorites ({favoriteIds.length})</span>
                </button>

                {/* Grid / List View Switcher */}
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn ${viewMode === "grid" ? "btn-secondary text-white" : "btn-light border text-secondary"}`}
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                    aria-label="Grid view"
                  >
                    <Grid size={15} />
                  </button>
                  <button
                    type="button"
                    className={`btn ${viewMode === "list" ? "btn-secondary text-white" : "btn-light border text-secondary"}`}
                    onClick={() => setViewMode("list")}
                    title="List View"
                    aria-label="List view"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================
              7.4 TEMPLATE CARDS & EMPTY STATE
              ====================================================================== */}
          {filteredTemplates.length === 0 ? (
            <div className="sg-card p-5 text-center bg-white shadow-sm my-4">
              <div className="d-inline-flex p-3 rounded-circle bg-light text-muted mb-3">
                <Search size={32} />
              </div>
              <h4 className="fw-bold mb-2">No templates found matching your criteria</h4>
              <p className="text-secondary small mb-4 mx-auto" style={{ maxWidth: 460 }}>
                Try adjusting your search keywords, clearing active category filters, or turning off the favorites filter.
              </p>
              <button onClick={handleClearFilters} className="btn btn-sg-primary btn-sg-sm" id="btn-clear-filters">
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
                    <div className="sg-card sg-card-hover h-100 bg-white d-flex flex-column">
                      {/* Thumbnail frame */}
                      <div className="position-relative bg-light border-bottom overflow-hidden" style={{ height: "220px" }}>
                        {tmpl.id === "w1" ? (
                          <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-center" style={{ backgroundColor: "#071B32" }}>
                            <img
                              src="/templates/w1/coco-pour-logo.png"
                              alt="COCO POUR Logo"
                              className="img-fluid mb-2"
                              style={{ maxHeight: "80px", objectFit: "contain" }}
                            />
                            <div className="text-white small fw-bold">COCO POUR Brand Website</div>
                            <small className="text-white-50">4 HD Videos &bull; Barista Moments &bull; GSAP</small>
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
                            <span className="badge bg-success text-white shadow-sm">
                              Template W1
                            </span>
                          )}
                          {tmpl.featured && (
                            <span className="badge bg-primary text-white shadow-sm">
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Favorite button */}
                        <button
                          type="button"
                          className="btn btn-sm btn-light position-absolute top-0 end-0 m-3 rounded-circle p-2 shadow-sm border"
                          onClick={(e) => toggleFavorite(tmpl.id, e)}
                          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart size={15} className={isFav ? "text-danger fill-danger" : "text-secondary"} />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 d-flex flex-column flex-grow-1 justify-content-between">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            {tmpl.categories.map((c) => (
                              <span key={c} className="sg-badge sg-badge-primary">
                                {c}
                              </span>
                            ))}
                            <span className="small text-muted ms-auto">{tmpl.style}</span>
                          </div>

                          <h5 className="fw-bold mb-2">{tmpl.name}</h5>
                          <p className="small text-secondary mb-3" style={{ lineHeight: 1.55 }}>
                            {tmpl.description}
                          </p>
                        </div>

                        <div className="pt-3 border-top d-flex align-items-center justify-content-between gap-2">
                          <button
                            type="button"
                            className="btn btn-sg-outline btn-sg-sm flex-grow-1"
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
                            className="btn btn-sg-primary btn-sg-sm flex-grow-1"
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
                  <div key={tmpl.id} className="sg-card p-3 p-md-4 bg-white shadow-sm">
                    <div className="row align-items-center g-3">
                      <div className="col-12 col-md-3 col-lg-2">
                        <div className="rounded-3 overflow-hidden bg-light border" style={{ height: "120px" }}>
                          {tmpl.id === "w1" ? (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center p-2" style={{ backgroundColor: "#071B32" }}>
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
                            <span key={c} className="sg-badge sg-badge-primary">
                              {c}
                            </span>
                          ))}
                          <span className="small text-muted ms-2">{tmpl.style}</span>
                        </div>
                        <h5 className="fw-bold mb-1">{tmpl.name}</h5>
                        <p className="small text-secondary mb-0">{tmpl.description}</p>
                      </div>

                      <div className="col-12 col-md-3 col-lg-3 d-flex flex-column align-items-end justify-content-center gap-2">
                        <div className="d-flex align-items-center gap-2 w-100">
                          <button
                            type="button"
                            className="btn btn-sg-outline btn-sg-sm flex-grow-1"
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
                            className="btn btn-sg-primary btn-sg-sm flex-grow-1"
                            onClick={() => handleUseTemplate(tmpl)}
                          >
                            Use Template
                          </button>
                          <button
                            type="button"
                            className="btn btn-light btn-sm border p-2"
                            onClick={(e) => toggleFavorite(tmpl.id, e)}
                            aria-label="Toggle favorite"
                          >
                            <Heart size={15} className={isFav ? "text-danger fill-danger" : "text-secondary"} />
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
              7.6 FUNCTIONAL TEMPLATE PREVIEW MODAL
              ====================================================================== */}
          {previewTemplate && (
            <div
              className="modal fade show d-block"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", zIndex: 1060 }}
            >
              <div className="modal-dialog modal-fullscreen p-2 p-md-4">
                <div className="modal-content rounded-4 shadow-xl border-0 overflow-hidden d-flex flex-column h-100">
                  {/* Modal Header */}
                  <div className="modal-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h5 className="modal-title fw-bold mb-0">{previewTemplate.name}</h5>
                          {previewTemplate.categories.map((c) => (
                            <span key={c} className="badge bg-primary-subtle text-primary small">
                              {c}
                            </span>
                          ))}
                        </div>
                        <small className="text-secondary">{previewTemplate.tagline}</small>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <ViewportSwitcher
                        currentMode={previewViewport}
                        onChange={setPreviewViewport}
                      />

                      <button
                        type="button"
                        className="btn btn-sg-primary btn-sg-sm"
                        onClick={() => handleUseTemplate(previewTemplate)}
                        id="modal-btn-use-template"
                      >
                        Use This Template
                        <ArrowRight size={15} />
                      </button>

                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close modal preview"
                        onClick={() => setPreviewTemplate(null)}
                      />
                    </div>
                  </div>

                  {/* Modal Body with Viewport emulation */}
                  <div className="modal-body bg-light p-3 p-md-4 overflow-y-auto d-flex justify-content-center">
                    <div className={`viewport-frame-wrapper viewport-${previewViewport}`}>
                      <div className="preview-browser-frame shadow-lg bg-white h-100">
                        <div className="browser-header-bar">
                          <div className="browser-dots">
                            <span className="browser-dot red"></span>
                            <span className="browser-dot yellow"></span>
                            <span className="browser-dot green"></span>
                          </div>
                          <div className="browser-url-pill">
                            <span>https://preview.sitegenai.app/{previewTemplate.id}</span>
                          </div>
                          <span className="badge bg-light text-secondary border small">
                            {previewViewport.toUpperCase()}
                          </span>
                        </div>

                        <div className="bg-white" style={{ minHeight: "650px" }}>
                          {previewTemplate.id === "w1" ? (
                            <iframe
                              src="/templates/w1/index.html"
                              title="COCO POUR Template Live Interactive Preview"
                              className="w-100 border-0"
                              style={{ minHeight: "750px", height: "100%", display: "block" }}
                            />
                          ) : (
                            <div className="p-5 text-center">
                              <span className="sg-badge sg-badge-primary mb-3">Built-in Layout Preview</span>
                              <h2 className="fw-bold mb-2">{previewTemplate.name}</h2>
                              <p className="text-secondary max-w-700 mx-auto mb-4">{previewTemplate.description}</p>
                              <img
                                src={previewTemplate.thumbnail}
                                alt={previewTemplate.name}
                                className="img-fluid rounded-4 shadow border mb-4"
                                style={{ maxHeight: "400px", objectFit: "cover" }}
                              />
                              <div className="d-flex justify-content-center gap-3">
                                <button
                                  className="btn btn-sg-primary"
                                  onClick={() => handleUseTemplate(previewTemplate)}
                                >
                                  Instantiate Template into Visual Editor
                                </button>
                              </div>
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
    <Suspense fallback={<div className="p-5 text-center">Loading template gallery...</div>}>
      <TemplateGalleryContent />
    </Suspense>
  );
}
