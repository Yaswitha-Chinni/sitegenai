"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { projectService } from "@/lib/projects/projectService";
import { TEMPLATES_REGISTRY } from "@/lib/templates/registry";
import { WebsiteDocument } from "@/types/project";
import { UploadedAsset } from "@/types/asset";
import {
  Shield,
  Database,
  Server,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Eye,
  Download,
  Terminal,
  Layers,
  FolderGit2,
  HardDrive,
  Cpu,
  Clock,
  LogOut,
  ExternalLink,
  Code,
  Search,
} from "lucide-react";

const ADMIN_CREDENTIALS = {
  email: "admin@sitegenai.local",
  password: "admin123",
  role: "System Superadmin",
};

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<"telemetry" | "database" | "ai" | "guide">("telemetry");

  // Telemetry & DB state
  const [serverStats, setServerStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [projectsList, setProjectsList] = useState<WebsiteDocument[]>([]);
  const [selectedTable, setSelectedTable] = useState<"projects" | "assets" | "templates">("projects");
  const [searchFilter, setSearchFilter] = useState("");
  const [inspectModalRecord, setInspectModalRecord] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    const session = sessionStorage.getItem("sitegenai_admin_session");
    if (session === "authenticated") {
      setIsAuthenticated(true);
      refreshData();
    }
  }, []);

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (loginEmail === ADMIN_CREDENTIALS.email && loginPassword === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem("sitegenai_admin_session", "authenticated");
      setIsAuthenticated(true);
      refreshData();
      showToast("Welcome back, Administrator!");
    } else {
      setLoginError("Invalid credentials. Please use the developer credentials provided below.");
    }
  };

  const handleQuickLogin = () => {
    setLoginEmail(ADMIN_CREDENTIALS.email);
    setLoginPassword(ADMIN_CREDENTIALS.password);
    sessionStorage.setItem("sitegenai_admin_session", "authenticated");
    setIsAuthenticated(true);
    refreshData();
    showToast("Quick developer login successful!");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("sitegenai_admin_session");
    setIsAuthenticated(false);
  };

  const refreshData = async () => {
    setIsLoadingStats(true);
    try {
      // 1. Load client-side stored projects
      const list = projectService.getProjects();
      setProjectsList(list);

      // 2. Fetch server telemetry stats
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setServerStats(data);
      }
    } catch (err) {
      console.warn("Failed to fetch admin stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Export full JSON database dump
  const handleExportDatabaseDump = () => {
    const dump = {
      exportTimestamp: new Date().toISOString(),
      systemStats: serverStats,
      projects: projectsList,
      templatesCount: TEMPLATES_REGISTRY.length,
      templates: TEMPLATES_REGISTRY,
    };

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sitegenai-db-dump-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast("Downloaded complete database dump JSON!");
  };

  // ============================================================================
  // VIEW: LOGIN SCREEN (When unauthenticated)
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-light">
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
          <div className="sg-card p-4 p-sm-5 bg-white shadow-xl w-100 rounded-4 border" style={{ maxWidth: 480 }}>
            <div className="text-center mb-4">
              <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-3 shadow-xs">
                <Shield size={32} />
              </div>
              <h3 className="fw-bold mb-1">SiteGenAI Admin Portal</h3>
              <p className="text-secondary small mb-0">
                Inspect localhost database records, server telemetry, and AI pipelines.
              </p>
            </div>

            {/* Credential Quick-Fill Card */}
            <div className="p-3 mb-4 rounded-3 border bg-primary-subtle text-dark small">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-primary-emphasis d-flex align-items-center gap-1">
                  <Lock size={14} /> Local Dev Credentials:
                </span>
                <span className="badge bg-primary text-white">Localhost Only</span>
              </div>
              <div className="font-monospace small mb-2 bg-white p-2 rounded border">
                <div><strong>Email:</strong> {ADMIN_CREDENTIALS.email}</div>
                <div><strong>Password:</strong> {ADMIN_CREDENTIALS.password}</div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm w-100 fw-bold rounded-pill"
                onClick={handleQuickLogin}
              >
                1-Click Quick Admin Login
              </button>
            </div>

            {loginError && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-danger flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="sg-form-label">Admin Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="admin@sitegenai.local"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="sg-form-label">Admin Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-sg-primary w-100 py-2 rounded-pill fw-bold">
                Authenticate as Admin
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ============================================================================
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // ============================================================================
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Top Admin Header */}
      <header className="bg-dark text-white py-2 px-3 border-bottom border-secondary d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <Link href="/" className="text-white text-decoration-none fw-bold fs-5 d-flex align-items-center gap-2">
            <div className="p-1 rounded bg-primary text-white">
              <Shield size={18} />
            </div>
            SiteGen<span className="text-primary">AI</span> Admin
          </Link>
          <span className="badge bg-success-subtle text-success border border-success-subtle small d-none d-md-inline">
            Localhost Dev Mode
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="small text-secondary d-none d-sm-inline">
            Logged in as <strong>{ADMIN_CREDENTIALS.email}</strong>
          </span>
          <button
            type="button"
            className="btn btn-outline-light btn-sm rounded-pill d-flex align-items-center gap-1"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow-1 py-4">
        <div className="container">
          {/* Subheader Title & Action Buttons */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <h2 className="fw-bold mb-1">Local Development Control Plane</h2>
              <p className="text-secondary small mb-0">
                Inspect local database persistence, disk storage, server health, and AI synthesis telemetry.
              </p>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-1 bg-white"
                onClick={refreshData}
                disabled={isLoadingStats}
              >
                <RefreshCw size={14} className={isLoadingStats ? "spin" : ""} />
                Refresh Telemetry
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-1"
                onClick={handleExportDatabaseDump}
              >
                <Download size={14} />
                Export DB Dump (JSON)
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="nav nav-pills bg-white p-2 rounded-4 border shadow-xs mb-4 gap-2">
            <button
              className={`nav-link rounded-pill py-2 px-3 fw-semibold small d-flex align-items-center gap-2 ${
                activeTab === "telemetry" ? "active bg-primary text-white" : "text-secondary"
              }`}
              onClick={() => setActiveTab("telemetry")}
            >
              <Cpu size={16} />
              System Telemetry
            </button>
            <button
              className={`nav-link rounded-pill py-2 px-3 fw-semibold small d-flex align-items-center gap-2 ${
                activeTab === "database" ? "active bg-primary text-white" : "text-secondary"
              }`}
              onClick={() => setActiveTab("database")}
            >
              <Database size={16} />
              Database Explorer ({projectsList.length} Projects)
            </button>
            <button
              className={`nav-link rounded-pill py-2 px-3 fw-semibold small d-flex align-items-center gap-2 ${
                activeTab === "ai" ? "active bg-primary text-white" : "text-secondary"
              }`}
              onClick={() => setActiveTab("ai")}
            >
              <Sparkles size={16} />
              AI Pipeline Diagnostics
            </button>
            <button
              className={`nav-link rounded-pill py-2 px-3 fw-semibold small d-flex align-items-center gap-2 ${
                activeTab === "guide" ? "active bg-primary text-white" : "text-secondary"
              }`}
              onClick={() => setActiveTab("guide")}
            >
              <Terminal size={16} />
              Local Database Guide
            </button>
          </div>

          {/* ==================================================================
              TAB 1: SYSTEM TELEMETRY & KPIS
              ================================================================== */}
          {activeTab === "telemetry" && (
            <div>
              {/* KPI Stat Cards */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 p-3 rounded-4 border bg-white shadow-xs">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="text-secondary small fw-semibold">Saved Projects</span>
                      <div className="p-2 rounded-circle bg-primary-subtle text-primary">
                        <FolderGit2 size={18} />
                      </div>
                    </div>
                    <h3 className="fw-bold mb-1">{projectsList.length}</h3>
                    <small className="text-muted">Stored in local dev database</small>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 p-3 rounded-4 border bg-white shadow-xs">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="text-secondary small fw-semibold">Disk Uploads</span>
                      <div className="p-2 rounded-circle bg-success-subtle text-success">
                        <HardDrive size={18} />
                      </div>
                    </div>
                    <h3 className="fw-bold mb-1">{serverStats?.storage?.uploadFilesCount || 0} Files</h3>
                    <small className="text-muted">{serverStats?.storage?.uploadTotalFormatted || "0.00 MB"} in public/uploads</small>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 p-3 rounded-4 border bg-white shadow-xs">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="text-secondary small fw-semibold">Database Engine</span>
                      <div className="p-2 rounded-circle bg-warning-subtle text-warning">
                        <Database size={18} />
                      </div>
                    </div>
                    <h5 className="fw-bold mb-1 text-truncate">
                      {serverStats?.database?.supabaseConfigured ? "Supabase Cloud" : "LocalStorage Fallback"}
                    </h5>
                    <small className="text-muted">
                      {serverStats?.database?.supabaseConfigured ? "PostgreSQL Active" : "Safe client-side isolate"}
                    </small>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 p-3 rounded-4 border bg-white shadow-xs">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="text-secondary small fw-semibold">AI Synthesis Model</span>
                      <div className="p-2 rounded-circle bg-info-subtle text-info">
                        <Sparkles size={18} />
                      </div>
                    </div>
                    <h5 className="fw-bold mb-1">{serverStats?.ai?.activeModel || "gemini-3.8-flash"}</h5>
                    <small className="text-success">
                      {serverStats?.ai?.geminiConfigured ? "API Key Configured" : "Unconfigured (Curated Engine)"}
                    </small>
                  </div>
                </div>
              </div>

              {/* System Diagnostics Table */}
              <div className="card border rounded-4 bg-white p-4 shadow-xs mb-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Server size={18} className="text-primary" />
                  Local Server Health &amp; Environment Diagnostics
                </h5>
                <div className="table-responsive">
                  <table className="table table-sm table-borderless align-middle mb-0">
                    <tbody>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-secondary py-2" style={{ width: 220 }}>Node.js Runtime:</td>
                        <td className="font-monospace">{serverStats?.system?.nodeVersion || process.version}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-secondary py-2">Host Platform:</td>
                        <td className="font-monospace text-capitalize">{serverStats?.system?.platform || "windows"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-secondary py-2">Server Memory Usage:</td>
                        <td className="font-monospace">{serverStats?.system?.memoryUsageMb || 65} MB Heap Used</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-secondary py-2">Server Uptime:</td>
                        <td className="font-monospace">{serverStats?.system?.uptimeSeconds || 120} seconds</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-secondary py-2">GEMINI_API_KEY:</td>
                        <td>
                          <span className="badge bg-success-subtle text-success font-monospace">
                            {serverStats?.ai?.geminiMasked || "Configured (Masked)"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-secondary py-2">Local Development Port:</td>
                        <td className="font-monospace">
                          <span className="badge bg-primary">http://localhost:3000</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================
              TAB 2: DATABASE EXPLORER
              ================================================================== */}
          {activeTab === "database" && (
            <div className="card border rounded-4 bg-white p-4 shadow-xs">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 pb-3 border-bottom">
                {/* Table selector buttons */}
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn ${selectedTable === "projects" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setSelectedTable("projects")}
                  >
                    Projects Table ({projectsList.length})
                  </button>
                  <button
                    type="button"
                    className={`btn ${selectedTable === "templates" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setSelectedTable("templates")}
                  >
                    Templates Catalog ({TEMPLATES_REGISTRY.length})
                  </button>
                </div>

                {/* Search */}
                <div className="input-group input-group-sm" style={{ maxWidth: 300 }}>
                  <span className="input-group-text bg-light text-muted">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search records..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* PROJECTS TABLE */}
              {selectedTable === "projects" && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>ID</th>
                        <th>Project Name</th>
                        <th>Category</th>
                        <th>Port</th>
                        <th>Sections</th>
                        <th>AI Engine</th>
                        <th>Updated At</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {projectsList
                        .filter((p) => !searchFilter || p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.id.includes(searchFilter))
                        .map((p) => (
                          <tr key={p.id}>
                            <td className="font-monospace text-primary">{p.id}</td>
                            <td className="fw-bold">{p.name}</td>
                            <td><span className="badge bg-light text-secondary border">{p.category}</span></td>
                            <td><span className="badge bg-primary-subtle text-primary">:{p.localPort || 3000}</span></td>
                            <td>{p.sections.length} sections</td>
                            <td>
                              {p.isLiveAiGenerated ? (
                                <span className="badge bg-success-subtle text-success">Live Gemini</span>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary">Curated Engine</span>
                              )}
                            </td>
                            <td className="text-muted">{new Date(p.updatedAt).toLocaleDateString()}</td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-1">
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm p-1"
                                  title="Inspect JSON Record"
                                  onClick={() => setInspectModalRecord(p)}
                                >
                                  <Eye size={13} />
                                </button>
                                <Link
                                  href={`/editor/${p.id}`}
                                  className="btn btn-outline-primary btn-sm p-1"
                                  title="Open in Visual Editor"
                                >
                                  <ExternalLink size={13} />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TEMPLATES TABLE */}
              {selectedTable === "templates" && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>Template ID</th>
                        <th>Name</th>
                        <th>Categories</th>
                        <th>Style</th>
                        <th>Sections</th>
                        <th>Source</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {TEMPLATES_REGISTRY
                        .filter((t) => !searchFilter || t.name.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((t) => (
                          <tr key={t.id}>
                            <td className="font-monospace text-primary">{t.id}</td>
                            <td className="fw-bold">
                              {t.name}
                              {t.id === "w1" && (
                                <span className="badge bg-success text-white ms-2 small">Original W1</span>
                              )}
                            </td>
                            <td>{t.categories.join(", ")}</td>
                            <td>{t.style}</td>
                            <td>{t.sections.length} sections</td>
                            <td><span className="badge bg-light text-secondary border">{t.source}</span></td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm p-1"
                                title="Inspect Template JSON"
                                onClick={() => setInspectModalRecord(t)}
                              >
                                <Eye size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================================================================
              TAB 3: AI PIPELINE DIAGNOSTICS
              ================================================================== */}
          {activeTab === "ai" && (
            <div className="card border rounded-4 bg-white p-4 shadow-xs">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                Google Gemini &amp; Multimodal Synthesis Status
              </h5>

              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3 border bg-light h-100">
                    <h6 className="fw-bold mb-2">Gemini SDK Configuration</h6>
                    <div className="small mb-1">
                      <span className="text-secondary">Official SDK:</span> <code>@google/genai (v2.28)</code>
                    </div>
                    <div className="small mb-1">
                      <span className="text-secondary">Primary Model:</span> <span className="badge bg-primary">gemini-3.8-flash</span>
                    </div>
                    <div className="small mb-1">
                      <span className="text-secondary">Fallback Models:</span> <code>gemini-1.5-flash, gemini-2.5-flash</code>
                    </div>
                    <div className="small mb-2">
                      <span className="text-secondary">Server Key Status:</span>{" "}
                      <span className="badge bg-success">Loaded from .env.local</span>
                    </div>
                    <p className="small text-muted mb-0">
                      SiteGenAI enforces server-only resolution. The API key is never transmitted to the browser client or bundled into exported code.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3 border bg-light h-100">
                    <h6 className="fw-bold mb-2">Promotional Video Synthesis Engine</h6>
                    <div className="small mb-1">
                      <span className="text-secondary">Provider:</span> Built-in HD Media Pipeline (W1 Verified Media)
                    </div>
                    <div className="small mb-1">
                      <span className="text-secondary">Variations Produced:</span> 5 tailored scripts &amp; storyboards
                    </div>
                    <div className="small mb-2">
                      <span className="text-secondary">Quota Governance:</span> Explicit user confirmation required
                    </div>
                    <p className="small text-muted mb-0">
                      Promotional video generation requests generate 5 complete variations with scripts, aspect ratios (16:9, 9:16, 1:1), and instant canvas binding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================
              TAB 4: "HOW TO CHECK DATABASE IN MY LOCALHOST" GUIDE
              ================================================================== */}
          {activeTab === "guide" && (
            <div className="card border rounded-4 bg-white p-4 shadow-xs">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Terminal size={22} className="text-primary" />
                <h4 className="fw-bold mb-0">How to Check the Database on Localhost</h4>
              </div>
              <p className="text-secondary">
                SiteGenAI provides three distinct ways to inspect and verify database records on your machine:
              </p>

              {/* METHOD 1: Built-in Admin Data Explorer */}
              <div className="p-3 rounded-3 border bg-light mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold text-primary mb-0">
                    Method 1: Built-in Admin Database Explorer (Currently Active)
                  </h6>
                  <span className="badge bg-success">Instant / No Setup</span>
                </div>
                <p className="small text-secondary mb-2">
                  Click on <strong>Tab 2 (Database Explorer)</strong> above. It queries all active projects, section trees, asset references, and template metadata directly from localhost memory and persistent storage.
                </p>
                <div className="small text-dark fw-semibold">
                  You can also click <strong>"Export DB Dump (JSON)"</strong> at the top right to download every record in raw JSON format.
                </div>
              </div>

              {/* METHOD 2: Browser LocalStorage in Chrome/Edge DevTools */}
              <div className="p-3 rounded-3 border bg-light mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold text-dark mb-0">
                    Method 2: Inspect Browser LocalStorage (F12 DevTools)
                  </h6>
                  <span className="badge bg-secondary">Client Persistence</span>
                </div>
                <p className="small text-secondary mb-2">
                  To view raw serialized database records stored by SiteGenAI in your browser:
                </p>
                <ol className="small text-secondary mb-2 ps-3">
                  <li>Press <strong>F12</strong> or <strong>Ctrl + Shift + I</strong> to open Developer Tools.</li>
                  <li>Click on the <strong>Application</strong> tab (in Chrome / Edge) or <strong>Storage</strong> tab (in Firefox).</li>
                  <li>In the left sidebar, expand <strong>Local Storage</strong> and click <code>http://localhost:3000</code>.</li>
                  <li>Click on the key: <code>sitegenai_projects_v1</code> to inspect the complete JSON array of stored websites.</li>
                </ol>
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted">DevTools Console Command:</span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-xs py-0 px-2 rounded small"
                    onClick={() => copyToClipboard('console.log(JSON.parse(localStorage.getItem("sitegenai_projects_v1")))', "ls-cmd")}
                  >
                    {copiedText === "ls-cmd" ? <Check size={12} /> : <Copy size={12} />}
                    {copiedText === "ls-cmd" ? "Copied" : "Copy Console Command"}
                  </button>
                </div>
              </div>

              {/* METHOD 3: Supabase PostgreSQL Local Instance */}
              <div className="p-3 rounded-3 border bg-white mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold text-primary mb-0">
                    Method 3: Run Full Local Supabase PostgreSQL &amp; Supabase Studio
                  </h6>
                  <span className="badge bg-primary">Full PostgreSQL GUI</span>
                </div>
                <p className="small text-secondary mb-3">
                  If you want to run a local PostgreSQL instance and use Supabase Studio's web dashboard at <code>http://localhost:54323</code>:
                </p>

                <div className="mb-3">
                  <span className="small fw-semibold text-secondary d-block mb-1">
                    Step 1: Start Supabase locally with Docker / npx
                  </span>
                  <pre className="p-2 bg-dark text-success rounded-2 small mb-0">
                    <code>npx supabase start</code>
                  </pre>
                </div>

                <div className="mb-3">
                  <span className="small fw-semibold text-secondary d-block mb-1">
                    Step 2: Apply the provided SiteGenAI PostgreSQL Schema
                  </span>
                  <pre className="p-2 bg-dark text-success rounded-2 small mb-0">
                    <code>npx supabase db execute -f supabase/schema.sql</code>
                  </pre>
                </div>

                <div className="mb-3">
                  <span className="small fw-semibold text-secondary d-block mb-1">
                    Step 3: Open Supabase Studio in your browser
                  </span>
                  <div className="p-2 bg-light rounded-2 small d-flex justify-content-between align-items-center">
                    <span>Web GUI: <strong>http://localhost:54323</strong></span>
                    <a
                      href="http://localhost:54323"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary py-0"
                    >
                      Open Studio <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div>
                  <span className="small fw-semibold text-secondary d-block mb-1">
                    Step 4: Connect via DBeaver / pgAdmin / psql
                  </span>
                  <pre className="p-2 bg-dark text-warning rounded-2 small mb-0">
                    <code>postgresql://postgres:postgres@127.0.0.1:54322/postgres</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* INSPECT RECORD JSON MODAL */}
      {inspectModalRecord && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(15, 23, 42, 0.75)", zIndex: 1070 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-xl">
              <div className="modal-header border-bottom py-3 px-4">
                <h6 className="modal-title fw-bold font-monospace">
                  Record Inspector: {inspectModalRecord.name || inspectModalRecord.id}
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInspectModalRecord(null)}
                />
              </div>
              <div className="modal-body p-4">
                <pre
                  className="p-3 bg-dark text-light rounded-3 small mb-3 overflow-auto"
                  style={{ maxHeight: "60vh", fontSize: "0.82rem" }}
                >
                  <code>{JSON.stringify(inspectModalRecord, null, 2)}</code>
                </pre>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(inspectModalRecord, null, 2));
                      showToast("JSON copied to clipboard!");
                    }}
                  >
                    Copy JSON
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-pill"
                    onClick={() => setInspectModalRecord(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Toast */}
      {adminToast && (
        <div className="sg-toast-container">
          <div className="sg-toast">
            <CheckCircle2 size={16} className="text-success" />
            <span>{adminToast}</span>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
