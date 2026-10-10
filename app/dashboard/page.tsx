"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { projectService } from "@/lib/projects/projectService";
import { WebsiteDocument } from "@/types/project";
import {
  FolderGit2,
  Plus,
  Search,
  Copy,
  Trash2,
  Heart,
  Grid,
  List,
  Layers,
  Clock,
  HardDrive,
  Download,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<WebsiteDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"updated" | "name">("updated");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals & Actions
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const list = projectService.getProjects();
    setProjects(list);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Duplicate Action
  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup = projectService.duplicateProject(id);
    if (dup) {
      loadProjects();
      showToast(`Duplicated "${dup.name}" successfully!`);
    }
  };

  // Favorite Action
  const handleToggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    projectService.toggleFavorite(id);
    loadProjects();
  };

  // Delete Action
  const confirmDelete = () => {
    if (!deleteTargetId) return;
    projectService.deleteProject(deleteTargetId);
    setDeleteTargetId(null);
    loadProjects();
    showToast("Project deleted from workspace.");
  };

  // Filtered & Sorted Projects
  const filteredProjects = projects
    .filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  return (
    <div className="d-flex flex-column min-vh-100 position-relative" style={{ backgroundColor: "#0B0D12", color: "#F1F5F9" }}>
      <Navbar />

      <main className="flex-grow-1 py-4 py-md-5 position-relative">
        {/* Subtle ambient background glow */}
        <div className="sb-glow-blob-emerald top-0 start-0 opacity-25" />
        <div className="sb-glow-blob-violet bottom-0 end-0 opacity-20" />

        <div className="container position-relative" style={{ zIndex: 2 }}>
          {/* Top Storage Advisory Banner */}
          <div
            className="p-3 mb-4 rounded-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 border"
            style={{
              borderColor: "#303947",
              backgroundColor: "#151A24",
            }}
          >
            <div className="d-flex align-items-center gap-2 small" style={{ color: "#D1D5DB" }}>
              <HardDrive size={18} className="sb-text-emerald flex-shrink-0" />
              <span>
                <strong className="text-white">Workspace Storage Active:</strong> Projects and stock photo metadata are saved locally with instant restore &amp; standalone ZIP packaging.
              </span>
            </div>
            <span
              className="badge rounded-pill border px-3 py-1.5 fw-semibold"
              style={{
                backgroundColor: "rgba(163, 255, 111, 0.15)",
                borderColor: "rgba(163, 255, 111, 0.35)",
                color: "#A3FF6F",
              }}
            >
              {projects.length} Saved Projects
            </span>
          </div>

          <div className="row g-4">
            {/* Sidebar Column */}
            <div className="col-12 col-lg-3">
              <div
                className="p-4 mb-4 rounded-3 border"
                style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
              >
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-white">
                  <Layers size={18} className="sb-text-emerald" />
                  Workspace Hub
                </h6>
                <div className="d-flex flex-column gap-2 mb-4">
                  <button
                    type="button"
                    className="sb-btn-primary btn-sm text-start justify-content-start py-2 px-3 rounded-3"
                  >
                    All Projects ({projects.length})
                  </button>
                  <Link
                    href="/templates"
                    className="btn btn-sm text-start py-2 px-3 rounded-3 border text-white transition-all"
                    style={{ backgroundColor: "#202938", borderColor: "#303947" }}
                  >
                    Template Gallery
                  </Link>
                  <Link
                    href="/create"
                    className="btn btn-sm text-start py-2 px-3 rounded-3 border text-white transition-all"
                    style={{ backgroundColor: "#202938", borderColor: "#303947" }}
                  >
                    Creation Studio
                  </Link>
                  <Link
                    href="/admin"
                    className="btn btn-sm text-start fw-semibold py-2 px-3 rounded-3 mt-1 d-flex align-items-center justify-content-between border"
                    style={{ borderColor: "rgba(245, 158, 11, 0.35)", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" }}
                  >
                    <span>Admin Control Plane</span>
                    <span className="badge bg-warning text-dark">Dev</span>
                  </Link>
                </div>

                <div className="pt-3 border-top" style={{ borderColor: "#303947" }}>
                  <small className="fw-bold text-white d-block mb-2" style={{ letterSpacing: "0.05em" }}>WORKSPACE STATS</small>
                  <div className="d-flex justify-content-between small py-1" style={{ color: "#D1D5DB" }}>
                    <span>Favorites</span>
                    <span className="fw-semibold text-white">{projects.filter((p) => p.isFavorite).length}</span>
                  </div>
                  <div className="d-flex justify-content-between small py-1" style={{ color: "#D1D5DB" }}>
                    <span>W1 &amp; W2 Flagships</span>
                    <span className="fw-semibold text-white">2 Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Column */}
            <div className="col-12 col-lg-9">
              {/* Header & Primary CTA */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div>
                  <h2 className="display-6 fw-bold mb-1 text-white">Your Website Projects</h2>
                  <p className="small mb-0" style={{ color: "#D1D5DB" }}>
                    Open any draft in the visual editor, search stock photos, duplicate, or export standalone packages.
                  </p>
                </div>
                <Link href="/create" className="sb-btn-primary btn-sm py-2 px-3.5 btn-magnetic" id="btn-dashboard-new-website">
                  <Plus size={16} />
                  Create New Website
                </Link>
              </div>

              {/* Filters Bar */}
              <div
                className="p-3 mb-4 rounded-3 border shadow-sm"
                style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
              >
                <div className="row g-3 align-items-center justify-content-between">
                  <div className="col-12 col-md-5">
                    <div className="input-group">
                      <span
                        className="input-group-text border-end-0"
                        style={{ backgroundColor: "#10141C", borderColor: "#303947", color: "#BFC7D2" }}
                      >
                        <Search size={15} />
                      </span>
                      <input
                        type="text"
                        className="form-control text-white border-start-0"
                        style={{ backgroundColor: "#10141C", borderColor: "#303947" }}
                        placeholder="Search your projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id="dashboard-search-input"
                      />
                      {searchQuery && (
                        <button
                          className="btn border-start-0"
                          style={{ backgroundColor: "#10141C", borderColor: "#303947", color: "#BFC7D2" }}
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-7 d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
                    <select
                      className="form-select form-select-sm text-white"
                      style={{
                        width: "auto",
                        backgroundColor: "#10141C",
                        borderColor: "#303947",
                      }}
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-dark text-white">
                          Category: {cat}
                        </option>
                      ))}
                    </select>

                    <select
                      className="form-select form-select-sm text-white"
                      style={{
                        width: "auto",
                        backgroundColor: "#10141C",
                        borderColor: "#303947",
                      }}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "updated" | "name")}
                    >
                      <option value="updated" className="bg-dark text-white">Recently Updated</option>
                      <option value="name" className="bg-dark text-white">Name (A-Z)</option>
                    </select>

                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className={`btn ${viewMode === "grid" ? "btn-success text-dark fw-bold" : "btn-outline-secondary text-white border"}`}
                        style={
                          viewMode === "grid"
                            ? { backgroundColor: "#A3FF6F", borderColor: "#A3FF6F", color: "#0B0D12" }
                            : { backgroundColor: "#10141C", borderColor: "#303947" }
                        }
                        onClick={() => setViewMode("grid")}
                        title="Grid View"
                      >
                        <Grid size={15} />
                      </button>
                      <button
                        type="button"
                        className={`btn ${viewMode === "list" ? "btn-success text-dark fw-bold" : "btn-outline-secondary text-white border"}`}
                        style={
                          viewMode === "list"
                            ? { backgroundColor: "#A3FF6F", borderColor: "#A3FF6F", color: "#0B0D12" }
                            : { backgroundColor: "#10141C", borderColor: "#303947" }
                        }
                        onClick={() => setViewMode("list")}
                        title="List View"
                      >
                        <List size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search / Filter feedback */}
                {(searchQuery || categoryFilter !== "All") && (
                  <div className="d-flex align-items-center justify-content-between pt-2 mt-2 border-top small" style={{ borderColor: "#303947", color: "#BFC7D2" }}>
                    <span>Showing {filteredProjects.length} of {projects.length} projects</span>
                    <button
                      className="btn btn-link btn-sm p-0 sb-text-emerald text-decoration-none"
                      onClick={() => {
                        setSearchQuery("");
                        setCategoryFilter("All");
                      }}
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>

              {/* Projects Grid or List */}
              {filteredProjects.length === 0 ? (
                <div
                  className="p-5 text-center rounded-3 border shadow-sm"
                  style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
                >
                  <FolderGit2 size={42} className="mb-3" style={{ color: "#BFC7D2" }} />
                  <h5 className="fw-bold text-white mb-2">No projects match your filter</h5>
                  <p className="small mb-4" style={{ color: "#D1D5DB" }}>
                    Clear your search query or start a fresh website from our creation studio.
                  </p>
                  <Link href="/create" className="sb-btn-primary btn-sm py-2 px-3 btn-magnetic">
                    Start a New Website
                  </Link>
                </div>
              ) : viewMode === "grid" ? (
                <div className="row g-3">
                  {filteredProjects.map((p) => {
                    const isW1 = p.templateSource === "w1" || p.id.includes("w1");
                    const isW2 = p.templateSource === "w2" || p.id.includes("w2");
                    return (
                      <div key={p.id} className="col-12 col-md-6 col-xl-4">
                        <div
                          className="sb-card card-3d-tilt card-spotlight h-100 d-flex flex-column overflow-hidden cursor-pointer"
                          onClick={() => router.push(`/editor/${p.id}`)}
                          style={{
                            cursor: "pointer",
                            borderColor: "#303947",
                            background: "#151A24",
                          }}
                        >
                          {/* Card Preview Frame */}
                          <div
                            className="p-3 border-bottom d-flex align-items-center justify-content-between position-relative card-img-zoom"
                            style={{
                              backgroundColor: isW1 ? "#0A1D30" : isW2 ? "#1E120A" : "#10141C",
                              borderColor: "#303947",
                              minHeight: "105px",
                            }}
                          >
                            <div>
                              {isW1 ? (
                                <span className="badge rounded-pill bg-success text-white shadow-sm mb-1 fw-bold">
                                  COCO POUR (W1)
                                </span>
                              ) : isW2 ? (
                                <span className="badge rounded-pill bg-warning text-dark shadow-sm mb-1 fw-bold">
                                  BRUVA (W2)
                                </span>
                              ) : (
                                <span
                                  className="badge rounded-pill mb-1 fw-semibold"
                                  style={{
                                    backgroundColor: "rgba(163, 255, 111, 0.15)",
                                    color: "#A3FF6F",
                                    border: "1px solid rgba(163, 255, 111, 0.35)",
                                  }}
                                >
                                  {p.category}
                                </span>
                              )}
                              <div className="fw-semibold small text-white">
                                {p.sections.length} Sections Active
                              </div>
                            </div>

                            <button
                              type="button"
                              className="btn btn-sm rounded-circle p-2 border"
                              style={{
                                backgroundColor: "#151A24",
                                borderColor: "#303947",
                              }}
                              onClick={(e) => handleToggleFav(p.id, e)}
                              aria-label="Toggle favorite"
                              title={p.isFavorite ? "Remove favorite" : "Add to favorites"}
                            >
                              <Heart size={14} className={p.isFavorite ? "text-danger fill-danger" : "text-white"} />
                            </button>
                          </div>

                          {/* Card Body */}
                          <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                            <div>
                              <h6 className="fw-bold mb-1 text-white text-truncate" title={p.name}>
                                {p.name}
                              </h6>
                              <p className="small mb-3" style={{ fontSize: "0.85rem", color: "#D1D5DB", minHeight: "38px", lineHeight: "1.5" }}>
                                {p.description.slice(0, 80)}...
                              </p>
                            </div>

                            <div>
                              <div
                                className="d-flex justify-content-between align-items-center small pt-2 border-top mb-3"
                                style={{ borderColor: "#303947", color: "#BFC7D2" }}
                              >
                                <span className="d-flex align-items-center gap-1.5" style={{ fontSize: "0.78rem" }}>
                                  <Clock size={12} />
                                  {new Date(p.updatedAt).toLocaleDateString()}
                                </span>
                                <div className="d-flex gap-1.5">
                                  <span
                                    className="badge border"
                                    style={{
                                      backgroundColor: "rgba(163, 255, 111, 0.12)",
                                      borderColor: "rgba(163, 255, 111, 0.3)",
                                      color: "#A3FF6F",
                                    }}
                                  >
                                    :{p.localPort || 3000}
                                  </span>
                                  <span
                                    className="badge border"
                                    style={{
                                      backgroundColor: "#202938",
                                      borderColor: "#303947",
                                      color: "#D1D5DB",
                                    }}
                                  >
                                    {p.style}
                                  </span>
                                </div>
                              </div>

                              <div className="d-flex align-items-center justify-content-between gap-1.5">
                                <Link
                                  href={`/editor/${p.id}`}
                                  className="sb-btn-primary btn-sm flex-grow-1 text-center py-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Open Editor
                                </Link>

                                <button
                                  type="button"
                                  className="btn btn-sm p-2 text-white border"
                                  style={{ backgroundColor: "#202938", borderColor: "#303947" }}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    showToast(`Generating ZIP for "${p.name}"...`);
                                    const res = await projectService.downloadProjectZip(p);
                                    if (res.success) {
                                      showToast(`Downloaded "${p.name}" ZIP package!`);
                                    } else {
                                      showToast(res.error || "ZIP download failed");
                                    }
                                  }}
                                  title="Download standalone ZIP archive"
                                >
                                  <Download size={14} />
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm p-2 text-white border"
                                  style={{ backgroundColor: "#202938", borderColor: "#303947" }}
                                  onClick={(e) => handleDuplicate(p.id, e)}
                                  title="Duplicate project"
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm p-2 text-danger border"
                                  style={{ backgroundColor: "#202938", borderColor: "#303947" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTargetId(p.id);
                                  }}
                                  title="Delete project"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW */
                <div className="d-flex flex-column gap-2">
                  {filteredProjects.map((p) => (
                    <div
                      key={p.id}
                      className="sb-card card-spotlight p-3 rounded-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 cursor-pointer border"
                      onClick={() => router.push(`/editor/${p.id}`)}
                      style={{
                        cursor: "pointer",
                        borderColor: "#303947",
                        background: "#151A24",
                      }}
                    >
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="fw-bold mb-0 text-white">{p.name}</h6>
                          <span
                            className="badge rounded-pill small fw-semibold"
                            style={{
                              backgroundColor: "rgba(163, 255, 111, 0.15)",
                              color: "#A3FF6F",
                              border: "1px solid rgba(163, 255, 111, 0.35)",
                            }}
                          >
                            {p.category}
                          </span>
                        </div>
                        <p className="small mb-0" style={{ color: "#D1D5DB" }}>{p.description}</p>
                      </div>

                      <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        <small className="me-2" style={{ color: "#BFC7D2" }}>
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </small>
                        <Link
                          href={`/editor/${p.id}`}
                          className="sb-btn-primary btn-sm py-1.5 px-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open Editor
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm p-2 text-danger border"
                          style={{ backgroundColor: "#202938", borderColor: "#303947" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTargetId(p.id);
                          }}
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Website Draft?"
        message="This action removes the project draft from your workspace storage. You can regenerate or duplicate anytime."
        confirmLabel="Delete Draft"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="sg-toast-container">
          <div
            className="sg-toast d-flex align-items-center gap-2 text-white"
            style={{
              backgroundColor: "#151A24",
              border: "1px solid #303947",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.65)",
            }}
          >
            <span className="sb-text-emerald">&bull;</span>
            <span style={{ color: "#F1F5F9" }}>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
