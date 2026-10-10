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
  MoreVertical,
  Copy,
  Trash2,
  Edit2,
  ExternalLink,
  Heart,
  Grid,
  List,
  LayoutTemplate,
  Sliders,
  Sparkles,
  Clock,
  HardDrive,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  Download,
  Server,
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
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");
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
    showToast("Project deleted from local drafts.");
  };

  // Rename Action
  const handleStartRename = (project: WebsiteDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingProjectId(project.id);
    setRenamingName(project.name);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingProjectId && renamingName.trim()) {
      projectService.renameProject(renamingProjectId, renamingName);
      setRenamingProjectId(null);
      loadProjects();
      showToast("Project renamed.");
    }
  };

  // Filtered & Sorted Projects
  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="flex-grow-1 py-4 py-md-5">
        <div className="container">
          {/* Top Storage Advisory Banner */}
          <div className="p-3 mb-4 rounded-3 bg-white border shadow-sm d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2 small text-secondary">
              <HardDrive size={18} className="text-primary flex-shrink-0" />
              <span>
                <strong>Browser-Side Persistence:</strong> Drafts are stored in your local browser storage. No cloud account or external database credentials required for Phase 1.
              </span>
            </div>
            <span className="badge bg-light text-secondary border small">
              {projects.length} Saved Projects
            </span>
          </div>

          <div className="row g-4">
            {/* Sidebar Column */}
            <div className="col-12 col-lg-3">
              <div className="sg-card p-4 bg-white shadow-sm mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Layers size={18} className="text-primary" />
                  Workspace Hub
                </h6>
                <div className="d-flex flex-column gap-1 mb-4">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary text-start fw-semibold py-2 px-3 rounded-2"
                  >
                    All Projects ({projects.length})
                  </button>
                  <Link
                    href="/templates"
                    className="btn btn-sm btn-light text-start text-secondary border-0 py-2 px-3 rounded-2"
                  >
                    Template Gallery
                  </Link>
                  <Link
                    href="/create"
                    className="btn btn-sm btn-light text-start text-secondary border-0 py-2 px-3 rounded-2"
                  >
                    Creation Studio
                  </Link>
                  <Link
                    href="/admin"
                    className="btn btn-sm btn-outline-primary text-start fw-semibold py-2 px-3 rounded-2 mt-2 d-flex align-items-center justify-content-between border"
                  >
                    <span>Admin Control Plane</span>
                    <span className="badge bg-primary text-white">Dev</span>
                  </Link>
                </div>

                <div className="pt-3 border-top">
                  <small className="fw-bold text-muted d-block mb-2">QUICK METRICS</small>
                  <div className="d-flex justify-content-between small text-secondary py-1">
                    <span>Favorites</span>
                    <span className="fw-semibold">{projects.filter((p) => p.isFavorite).length}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-secondary py-1">
                    <span>W1 Templates</span>
                    <span className="fw-semibold">{projects.filter((p) => p.templateSource === "w1").length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Column */}
            <div className="col-12 col-lg-9">
              {/* Header & Primary CTA */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div>
                  <h2 className="display-6 fw-bold mb-1">Your Website Projects</h2>
                  <p className="text-secondary small mb-0">
                    Open any draft in the visual editor, rename, duplicate, or inspect live layouts.
                  </p>
                </div>
                <Link href="/create" className="btn btn-sg-primary btn-sg-sm" id="btn-dashboard-new-website">
                  <Plus size={16} />
                  Create New Website
                </Link>
              </div>

              {/* Filters Bar */}
              <div className="sg-card p-3 bg-white mb-4 shadow-sm">
                <div className="row g-3 align-items-center justify-content-between">
                  <div className="col-12 col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted border-end-0">
                        <Search size={15} />
                      </span>
                      <input
                        type="text"
                        className="form-control sg-form-control border-start-0 ps-0"
                        placeholder="Search your projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id="dashboard-search-input"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-7 d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "auto" }}
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          Category: {cat}
                        </option>
                      ))}
                    </select>

                    <select
                      className="form-select form-select-sm"
                      style={{ width: "auto" }}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "updated" | "name")}
                    >
                      <option value="updated">Recently Updated</option>
                      <option value="name">Name (A-Z)</option>
                    </select>

                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className={`btn ${viewMode === "grid" ? "btn-secondary text-white" : "btn-light border text-secondary"}`}
                        onClick={() => setViewMode("grid")}
                        title="Grid View"
                      >
                        <Grid size={15} />
                      </button>
                      <button
                        type="button"
                        className={`btn ${viewMode === "list" ? "btn-secondary text-white" : "btn-light border text-secondary"}`}
                        onClick={() => setViewMode("list")}
                        title="List View"
                      >
                        <List size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects Grid or List */}
              {filteredProjects.length === 0 ? (
                <div className="sg-card p-5 bg-white text-center shadow-sm">
                  <FolderGit2 size={36} className="text-muted mb-3" />
                  <h5 className="fw-bold mb-2">No projects match your filter</h5>
                  <p className="text-secondary small mb-4">
                    Clear your search query or start a fresh website from our creation studio.
                  </p>
                  <Link href="/create" className="btn btn-sg-primary btn-sg-sm">
                    Start a New Website
                  </Link>
                </div>
              ) : viewMode === "grid" ? (
                <div className="row g-3">
                  {filteredProjects.map((p) => {
                    const isW1 = p.templateSource === "w1" || p.id.includes("w1");
                    return (
                      <div key={p.id} className="col-12 col-md-6 col-xl-4">
                        <div
                          className="sg-card sg-card-hover h-100 bg-white d-flex flex-column cursor-pointer"
                          onClick={() => router.push(`/editor/${p.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {/* Card Preview Frame */}
                          <div
                            className="p-3 border-bottom d-flex align-items-center justify-content-between position-relative"
                            style={{
                              backgroundColor: isW1 ? "#071B32" : "#F8FAFD",
                              minHeight: "100px",
                            }}
                          >
                            <div>
                              {isW1 ? (
                                <span className="badge bg-success text-white shadow-sm mb-1">
                                  COCO POUR (W1)
                                </span>
                              ) : (
                                <span className="badge bg-primary-subtle text-primary mb-1">
                                  {p.category}
                                </span>
                              )}
                              <div className={`fw-bold small ${isW1 ? "text-white" : "text-dark"}`}>
                                {p.sections.length} Sections Active
                              </div>
                            </div>

                            <button
                              type="button"
                              className="btn btn-sm btn-light rounded-circle p-2 shadow-sm border"
                              onClick={(e) => handleToggleFav(p.id, e)}
                              aria-label="Toggle favorite"
                            >
                              <Heart size={14} className={p.isFavorite ? "text-danger fill-danger" : "text-secondary"} />
                            </button>
                          </div>

                          {/* Card Body */}
                          <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                            <div>
                              <h6 className="fw-bold mb-1 text-truncate" title={p.name}>
                                {p.name}
                              </h6>
                              <p className="small text-secondary mb-3" style={{ fontSize: "0.82rem", minHeight: "36px" }}>
                                {p.description.slice(0, 75)}...
                              </p>
                            </div>

                            <div>
                              <div className="d-flex justify-content-between align-items-center small text-muted pt-2 border-top mb-3">
                                <span className="d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
                                  <Clock size={12} />
                                  {new Date(p.updatedAt).toLocaleDateString()}
                                </span>
                                <div className="d-flex gap-1">
                                  <span className="badge bg-primary-subtle text-primary border" title="Configured local server port">
                                    :{p.localPort || 3000}
                                  </span>
                                  <span className="badge bg-light text-secondary border">
                                    {p.style}
                                  </span>
                                </div>
                              </div>

                              <div className="d-flex align-items-center justify-content-between gap-1">
                                <Link
                                  href={`/editor/${p.id}`}
                                  className="btn btn-sg-primary btn-sg-sm flex-grow-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Open Editor
                                </Link>

                                <button
                                  type="button"
                                  className="btn btn-light btn-sm border p-2 text-primary"
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
                                  className="btn btn-light btn-sm border p-2"
                                  onClick={(e) => handleDuplicate(p.id, e)}
                                  title="Duplicate project"
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-light btn-sm border p-2 text-danger"
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
                      className="sg-card p-3 bg-white shadow-sm d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 cursor-pointer"
                      onClick={() => router.push(`/editor/${p.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="fw-bold mb-0">{p.name}</h6>
                          <span className="badge bg-primary-subtle text-primary small">
                            {p.category}
                          </span>
                          {p.templateSource === "w1" && (
                            <span className="badge bg-success-subtle text-success small">
                              w1
                            </span>
                          )}
                        </div>
                        <p className="small text-secondary mb-0">{p.description}</p>
                      </div>

                      <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        <small className="text-muted me-2">
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </small>
                        <Link
                          href={`/editor/${p.id}`}
                          className="btn btn-sg-primary btn-sg-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open Editor
                        </Link>
                        <button
                          type="button"
                          className="btn btn-light btn-sm border p-2"
                          onClick={(e) => handleDuplicate(p.id, e)}
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-light btn-sm border p-2 text-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTargetId(p.id);
                          }}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Draft Project?"
        message="This will permanently delete this project draft from your local browser storage. This action cannot be undone."
        confirmLabel="Delete Draft"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="sg-toast-container">
          <div className="sg-toast">
            <CheckCircle2 size={16} className="text-success" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
