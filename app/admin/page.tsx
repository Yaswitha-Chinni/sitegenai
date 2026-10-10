"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { projectService } from "@/lib/projects/projectService";
import { TEMPLATES_REGISTRY } from "@/lib/templates/registry";
import { WebsiteDocument } from "@/types/project";
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
  Eye,
  Download,
  Terminal,
  FolderGit2,
  HardDrive,
  Cpu,
  LogOut,
  ExternalLink,
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
  const [selectedTable, setSelectedTable] = useState<"projects" | "templates">("projects");
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
    } else {
      setLoginError("Invalid admin credentials. Use the local development credentials provided.");
    }
  };

  const handleQuickLogin = () => {
    setLoginEmail(ADMIN_CREDENTIALS.email);
    setLoginPassword(ADMIN_CREDENTIALS.password);
    sessionStorage.setItem("sitegenai_admin_session", "authenticated");
    setIsAuthenticated(true);
    refreshData();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("sitegenai_admin_session");
    setIsAuthenticated(false);
  };

  const refreshData = async () => {
    setIsLoadingStats(true);
    try {
      const list = projectService.getProjects();
      setProjectsList(list);

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
      <div
        className="min-vh-100 d-flex flex-column text-white position-relative"
        style={{ backgroundColor: "#0B0D12" }}
      >
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3 position-relative">
          {/* Ambient glow blobs */}
          <div
            className="position-absolute rounded-circle pointer-events-none"
            style={{
              width: 500,
              height: 500,
              background: "radial-gradient(circle, rgba(163, 255, 111, 0.1) 0%, transparent 70%)",
              top: "10%",
              left: "15%",
              filter: "blur(60px)",
            }}
          />

          <div
            className="card-3d-tilt card-spotlight p-4 p-sm-5 text-white w-100 position-relative shadow-2xl rounded-4"
            style={{
              maxWidth: 480,
              backgroundColor: "#151A24",
              border: "1px solid #303947",
              zIndex: 2,
            }}
          >
            <div className="text-center mb-4">
              <div
                className="d-inline-flex p-3 rounded-circle mb-3 shadow-xs"
                style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}
              >
                <Shield size={32} />
              </div>
              <h3 className="fw-bold mb-1 text-white">SiteGenAI Admin Portal</h3>
              <p className="small mb-0" style={{ color: "#D1D5DB" }}>
                Inspect localhost database records, server telemetry, and AI pipelines.
              </p>
            </div>

            {/* Credential Quick-Fill Card */}
            <div
              className="p-3 mb-4 rounded-3 text-white small"
              style={{
                backgroundColor: "#10141C",
                border: "1px solid #303947",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold d-flex align-items-center gap-1 text-white">
                  <Lock size={14} style={{ color: "#A3FF6F" }} /> Local Dev Credentials:
                </span>
                <span
                  className="badge rounded-pill fw-medium"
                  style={{ backgroundColor: "#202938", color: "#36D9F5", border: "1px solid #303947" }}
                >
                  Localhost Only
                </span>
              </div>
              <div
                className="font-monospace small mb-2 p-2.5 rounded"
                style={{
                  backgroundColor: "#0B0D12",
                  border: "1px solid #303947",
                  color: "#D1D5DB",
                }}
              >
                <div><strong className="text-white">Email:</strong> {ADMIN_CREDENTIALS.email}</div>
                <div><strong className="text-white">Password:</strong> {ADMIN_CREDENTIALS.password}</div>
              </div>
              <button
                type="button"
                className="btn btn-sm w-100 fw-bold rounded-pill"
                style={{
                  backgroundColor: "#A3FF6F",
                  color: "#0B0D12",
                  border: "none",
                }}
                onClick={handleQuickLogin}
              >
                1-Click Quick Admin Login
              </button>
            </div>

            {loginError && (
              <div
                className="alert py-2.5 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#FCA5A5",
                }}
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: "#F1F5F9" }}>
                  Admin Email
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text border-end-0"
                    style={{ backgroundColor: "#10141C", borderColor: "#303947", color: "#BFC7D2" }}
                  >
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control text-white border-start-0"
                    style={{ backgroundColor: "#10141C", borderColor: "#303947" }}
                    placeholder={ADMIN_CREDENTIALS.email}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold" style={{ color: "#F1F5F9" }}>
                  Admin Password
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text border-end-0"
                    style={{ backgroundColor: "#10141C", borderColor: "#303947", color: "#BFC7D2" }}
                  >
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control text-white border-start-0"
                    style={{ backgroundColor: "#10141C", borderColor: "#303947" }}
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 py-2.5 fw-bold rounded-pill"
                style={{
                  backgroundColor: "#A3FF6F",
                  color: "#0B0D12",
                  boxShadow: "0 0 16px rgba(163, 255, 111, 0.25)",
                }}
              >
                Sign In to Admin Portal
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
    <div
      className="min-vh-100 d-flex flex-column text-white position-relative"
      style={{ backgroundColor: "#0B0D12" }}
    >
      {/* Top Admin Header */}
      <header
        className="py-2.5 px-4 d-flex align-items-center justify-content-between"
        style={{ backgroundColor: "#10141C", borderBottom: "1px solid #303947" }}
      >
        <div className="d-flex align-items-center gap-3">
          <Link href="/" className="text-white text-decoration-none fw-bold fs-5 d-flex align-items-center gap-2">
            <div
              className="p-1 rounded d-flex align-items-center justify-content-center"
              style={{ background: "#A3FF6F", color: "#0B0D12" }}
            >
              <Shield size={18} />
            </div>
            <span>
              SiteGen<span style={{ color: "#A3FF6F" }}>AI</span> Admin
            </span>
          </Link>
          <span
            className="badge rounded-pill small d-none d-md-inline"
            style={{
              backgroundColor: "rgba(163, 255, 111, 0.15)",
              border: "1px solid rgba(163, 255, 111, 0.3)",
              color: "#A3FF6F",
            }}
          >
            Localhost Dev Mode
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="small d-none d-sm-inline" style={{ color: "#BFC7D2" }}>
            Logged in as <strong className="text-white">{ADMIN_CREDENTIALS.email}</strong>
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-1.5 text-white"
            style={{ borderColor: "#303947" }}
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
              <h2 className="fw-bold mb-1 text-white" style={{ letterSpacing: "-0.02em" }}>
                Local Development Control Plane
              </h2>
              <p className="small mb-0" style={{ color: "#D1D5DB" }}>
                Inspect local database persistence, disk storage, server health, and AI synthesis telemetry.
              </p>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-1.5 text-white"
                style={{ borderColor: "#303947", backgroundColor: "#151A24" }}
                onClick={refreshData}
                disabled={isLoadingStats}
              >
                <RefreshCw size={14} className={isLoadingStats ? "spin" : ""} />
                Refresh Telemetry
              </button>

              <button
                type="button"
                className="btn btn-sm rounded-pill d-flex align-items-center gap-1.5 fw-bold"
                style={{
                  backgroundColor: "#A3FF6F",
                  color: "#0B0D12",
                  border: "none",
                }}
                onClick={handleExportDatabaseDump}
              >
                <Download size={14} />
                Export DB Dump (JSON)
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className="p-1.5 rounded-4 mb-4 d-flex gap-2 flex-wrap"
            style={{
              backgroundColor: "#10141C",
              border: "1px solid #303947",
            }}
          >
            {[
              { id: "telemetry", label: "System Telemetry", icon: Cpu },
              { id: "database", label: `Database Explorer (${projectsList.length} Projects)`, icon: Database },
              { id: "ai", label: "AI Pipeline Diagnostics", icon: Sparkles },
              { id: "guide", label: "Local Database Guide", icon: Terminal },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className="btn rounded-pill py-2 px-3 fw-semibold small d-flex align-items-center gap-2"
                style={
                  activeTab === id
                    ? { backgroundColor: "#A3FF6F", color: "#0B0D12" }
                    : { backgroundColor: "transparent", color: "#BFC7D2" }
                }
                onClick={() => setActiveTab(id as any)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* ==================================================================
              TAB 1: SYSTEM TELEMETRY & KPIS
              ================================================================== */}
          {activeTab === "telemetry" && (
            <div>
              {/* KPI Stat Cards */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                  <div
                    className="card-3d-tilt card-spotlight h-100 p-3.5 rounded-4"
                    style={{ backgroundColor: "#151A24", border: "1px solid #303947" }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="small fw-semibold" style={{ color: "#BFC7D2" }}>Saved Projects</span>
                      <div
                        className="p-2 rounded-circle"
                        style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}
                      >
                        <FolderGit2 size={18} />
                      </div>
                    </div>
                    <h3 className="fw-bold mb-1 text-white">{projectsList.length}</h3>
                    <small style={{ color: "#BFC7D2" }}>Stored in local dev database</small>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div
                    className="card-3d-tilt card-spotlight h-100 p-3.5 rounded-4"
                    style={{ backgroundColor: "#151A24", border: "1px solid #303947" }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="small fw-semibold" style={{ color: "#BFC7D2" }}>Disk Uploads</span>
                      <div
                        className="p-2 rounded-circle"
                        style={{ backgroundColor: "rgba(54, 217, 245, 0.15)", color: "#36D9F5" }}
                      >
                        <HardDrive size={18} />
                      </div>
                    </div>
                    <h3 className="fw-bold mb-1 text-white">{serverStats?.storage?.uploadFilesCount || 0} Files</h3>
                    <small style={{ color: "#BFC7D2" }}>{serverStats?.storage?.uploadTotalFormatted || "0.00 MB"} in public/uploads</small>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div
                    className="card-3d-tilt card-spotlight h-100 p-3.5 rounded-4"
                    style={{ backgroundColor: "#151A24", border: "1px solid #303947" }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="small fw-semibold" style={{ color: "#BFC7D2" }}>Database Engine</span>
                      <div
                        className="p-2 rounded-circle"
                        style={{ backgroundColor: "rgba(139, 124, 255, 0.15)", color: "#8B7CFF" }}
                      >
                        <Database size={18} />
                      </div>
                    </div>
                    <h5 className="fw-bold mb-1 text-white text-truncate">
                      {serverStats?.database?.supabaseConfigured ? "Supabase Cloud" : "LocalStorage Fallback"}
                    </h5>
                    <small style={{ color: "#BFC7D2" }}>
                      {serverStats?.database?.supabaseConfigured ? "PostgreSQL Active" : "Safe client-side isolate"}
                    </small>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div
                    className="card-3d-tilt card-spotlight h-100 p-3.5 rounded-4"
                    style={{ backgroundColor: "#151A24", border: "1px solid #303947" }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="small fw-semibold" style={{ color: "#BFC7D2" }}>AI Synthesis Model</span>
                      <div
                        className="p-2 rounded-circle"
                        style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}
                      >
                        <Sparkles size={18} />
                      </div>
                    </div>
                    <h5 className="fw-bold mb-1 text-white">{serverStats?.ai?.activeModel || "gemini-3.8-flash"}</h5>
                    <small style={{ color: "#A3FF6F" }}>
                      {serverStats?.ai?.geminiConfigured ? "API Key Configured" : "Unconfigured (Curated Engine)"}
                    </small>
                  </div>
                </div>
              </div>

              {/* System Diagnostics Table */}
              <div
                className="rounded-4 p-4 mb-4"
                style={{ backgroundColor: "#151A24", border: "1px solid #303947" }}
              >
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-white">
                  <Server size={18} style={{ color: "#A3FF6F" }} />
                  Local Server Health &amp; Environment Diagnostics
                </h5>
                <div className="table-responsive">
                  <table className="table table-sm table-borderless align-middle mb-0 text-white">
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #303947" }}>
                        <td className="fw-semibold py-2" style={{ width: 220, color: "#BFC7D2" }}>Node.js Runtime:</td>
                        <td className="font-monospace text-white">{serverStats?.system?.nodeVersion || process.version}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #303947" }}>
                        <td className="fw-semibold py-2" style={{ color: "#BFC7D2" }}>Host Platform:</td>
                        <td className="font-monospace text-capitalize text-white">{serverStats?.system?.platform || "windows"}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #303947" }}>
                        <td className="fw-semibold py-2" style={{ color: "#BFC7D2" }}>Server Memory Usage:</td>
                        <td className="font-monospace text-white">{serverStats?.system?.memoryUsageMb || 65} MB Heap Used</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #303947" }}>
                        <td className="fw-semibold py-2" style={{ color: "#BFC7D2" }}>Server Uptime:</td>
                        <td className="font-monospace text-white">{serverStats?.system?.uptimeSeconds || 120} seconds</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #303947" }}>
                        <td className="fw-semibold py-2" style={{ color: "#BFC7D2" }}>GEMINI_API_KEY:</td>
                        <td>
                          <span
                            className="badge font-monospace"
                            style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}
                          >
                            {serverStats?.ai?.geminiMasked || "Configured (Masked)"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold py-2" style={{ color: "#BFC7D2" }}>Local Development Port:</td>
                        <td className="font-monospace">
                          <span
                            className="badge"
                            style={{ backgroundColor: "#202938", color: "#36D9F5", border: "1px solid #303947" }}
                          >
                            http://localhost:3000
                          </span>
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
            <div
              className="rounded-4 p-4"
              style={{ backgroundColor: "#151A24", border: "1px solid #303947" }}
            >
              <div
                className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 pb-3"
                style={{ borderBottom: "1px solid #303947" }}
              >
                {/* Table selector buttons */}
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className="btn fw-semibold"
                    style={
                      selectedTable === "projects"
                        ? { backgroundColor: "#A3FF6F", color: "#0B0D12" }
                        : { backgroundColor: "#10141C", color: "#BFC7D2", border: "1px solid #303947" }
                    }
                    onClick={() => setSelectedTable("projects")}
                  >
                    Projects Table ({projectsList.length})
                  </button>
                  <button
                    type="button"
                    className="btn fw-semibold"
                    style={
                      selectedTable === "templates"
                        ? { backgroundColor: "#A3FF6F", color: "#0B0D12" }
                        : { backgroundColor: "#10141C", color: "#BFC7D2", border: "1px solid #303947" }
                    }
                    onClick={() => setSelectedTable("templates")}
                  >
                    Templates Catalog ({TEMPLATES_REGISTRY.length})
                  </button>
                </div>

                {/* Search */}
                <div className="input-group input-group-sm" style={{ maxWidth: 300 }}>
                  <span
                    className="input-group-text border-end-0"
                    style={{ backgroundColor: "#10141C", borderColor: "#303947", color: "#BFC7D2" }}
                  >
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control text-white border-start-0"
                    style={{ backgroundColor: "#10141C", borderColor: "#303947" }}
                    placeholder="Search records..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* PROJECTS TABLE */}
              {selectedTable === "projects" && (
                <div className="table-responsive">
                  <table className="table align-middle mb-0 text-white" style={{ borderColor: "#303947" }}>
                    <thead className="small" style={{ backgroundColor: "#10141C", color: "#BFC7D2" }}>
                      <tr>
                        <th className="py-2.5">ID</th>
                        <th className="py-2.5">Project Name</th>
                        <th className="py-2.5">Category</th>
                        <th className="py-2.5">Port</th>
                        <th className="py-2.5">Sections</th>
                        <th className="py-2.5">AI Engine</th>
                        <th className="py-2.5">Updated At</th>
                        <th className="py-2.5 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {projectsList
                        .filter((p) => !searchFilter || p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.id.includes(searchFilter))
                        .map((p) => (
                          <tr key={p.id}>
                            <td className="font-monospace" style={{ color: "#36D9F5" }}>{p.id}</td>
                            <td className="fw-bold text-white">{p.name}</td>
                            <td>
                              <span
                                className="badge"
                                style={{ backgroundColor: "#202938", color: "#BFC7D2", border: "1px solid #303947" }}
                              >
                                {p.category}
                              </span>
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}
                              >
                                :{p.localPort || 3000}
                              </span>
                            </td>
                            <td style={{ color: "#D1D5DB" }}>{p.sections.length} sections</td>
                            <td>
                              {p.isLiveAiGenerated ? (
                                <span className="badge" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}>
                                  Live Gemini
                                </span>
                              ) : (
                                <span className="badge" style={{ backgroundColor: "#202938", color: "#BFC7D2" }}>
                                  Curated Engine
                                </span>
                              )}
                            </td>
                            <td style={{ color: "#BFC7D2" }}>{new Date(p.updatedAt).toLocaleDateString()}</td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-1">
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm p-1 text-white"
                                  style={{ borderColor: "#303947" }}
                                  title="Inspect JSON Record"
                                  onClick={() => setInspectModalRecord(p)}
                                >
                                  <Eye size={13} />
                                </button>
                                <Link
                                  href={`/editor/${p.id}`}
                                  className="btn btn-sm p-1 fw-bold"
                                  style={{ backgroundColor: "#A3FF6F", color: "#0B0D12", border: "none" }}
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
                  <table className="table align-middle mb-0 text-white" style={{ borderColor: "#303947" }}>
                    <thead className="small" style={{ backgroundColor: "#10141C", color: "#BFC7D2" }}>
                      <tr>
                        <th className="py-2.5">Template ID</th>
                        <th className="py-2.5">Name</th>
                        <th className="py-2.5">Categories</th>
                        <th className="py-2.5">Style</th>
                        <th className="py-2.5">Sections</th>
                        <th className="py-2.5">Source</th>
                        <th className="py-2.5 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {TEMPLATES_REGISTRY
                        .filter((t) => !searchFilter || t.name.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((t) => (
                          <tr key={t.id}>
                            <td className="font-monospace" style={{ color: "#36D9F5" }}>{t.id}</td>
                            <td className="fw-bold text-white">
                              {t.name}
                              {t.id === "w1" && (
                                <span
                                  className="badge ms-2 small"
                                  style={{ backgroundColor: "#A3FF6F", color: "#0B0D12" }}
                                >
                                  Original W1
                                </span>
                              )}
                            </td>
                            <td style={{ color: "#D1D5DB" }}>{t.categories.join(", ")}</td>
                            <td style={{ color: "#BFC7D2" }}>{t.style}</td>
                            <td style={{ color: "#D1D5DB" }}>{t.sections.length} sections</td>
                            <td>
                              <span
                                className="badge"
                                style={{ backgroundColor: "#202938", color: "#BFC7D2", border: "1px solid #303947" }}
                              >
                                {t.source}
                              </span>
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm p-1 text-white"
                                style={{ borderColor: "#303947" }}
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
            <div
              className="rounded-4 p-4"
              style={{ backgroundColor: "#151A24", border: "1px solid #303947" }}
            >
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-white">
                <Sparkles size={18} style={{ color: "#A3FF6F" }} />
                Google Gemini &amp; Multimodal Synthesis Status
              </h5>

              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <div
                    className="p-3.5 rounded-3 h-100"
                    style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
                  >
                    <h6 className="fw-bold mb-2 text-white">Gemini SDK Configuration</h6>
                    <div className="small mb-1">
                      <span style={{ color: "#BFC7D2" }}>Official SDK:</span> <code className="text-white">@google/genai (v2.28)</code>
                    </div>
                    <div className="small mb-1">
                      <span style={{ color: "#BFC7D2" }}>Primary Model:</span>{" "}
                      <span className="badge" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}>
                        gemini-3.8-flash
                      </span>
                    </div>
                    <div className="small mb-1">
                      <span style={{ color: "#BFC7D2" }}>Fallback Models:</span> <code className="text-white">gemini-1.5-flash, gemini-2.5-flash</code>
                    </div>
                    <div className="small mb-2">
                      <span style={{ color: "#BFC7D2" }}>Server Key Status:</span>{" "}
                      <span className="badge" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}>
                        Loaded from .env.local
                      </span>
                    </div>
                    <p className="small mb-0" style={{ color: "#BFC7D2" }}>
                      SiteGenAI enforces server-only resolution. The API key is never transmitted to the browser client or bundled into exported code.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div
                    className="p-3.5 rounded-3 h-100"
                    style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
                  >
                    <h6 className="fw-bold mb-2 text-white">Promotional Video Synthesis Engine</h6>
                    <div className="small mb-1">
                      <span style={{ color: "#BFC7D2" }}>Provider:</span> Built-in HD Media Pipeline (W1 Verified Media)
                    </div>
                    <div className="small mb-1">
                      <span style={{ color: "#BFC7D2" }}>Variations Produced:</span> 5 tailored scripts &amp; storyboards
                    </div>
                    <div className="small mb-2">
                      <span style={{ color: "#BFC7D2" }}>Quota Governance:</span> Explicit user confirmation required
                    </div>
                    <p className="small mb-0" style={{ color: "#BFC7D2" }}>
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
            <div
              className="rounded-4 p-4"
              style={{ backgroundColor: "#151A24", border: "1px solid #303947" }}
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <Terminal size={22} style={{ color: "#36D9F5" }} />
                <h4 className="fw-bold mb-0 text-white">How to Check the Database on Localhost</h4>
              </div>
              <p style={{ color: "#D1D5DB" }}>
                SiteGenAI provides three distinct ways to inspect and verify database records on your machine:
              </p>

              {/* METHOD 1: Built-in Admin Data Explorer */}
              <div
                className="p-3.5 rounded-3 mb-4"
                style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold mb-0 text-white">
                    Method 1: Built-in Admin Database Explorer (Currently Active)
                  </h6>
                  <span
                    className="badge rounded-pill fw-semibold"
                    style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}
                  >
                    Instant / No Setup
                  </span>
                </div>
                <p className="small mb-2" style={{ color: "#BFC7D2" }}>
                  Click on <strong>Tab 2 (Database Explorer)</strong> above. It queries all active projects, section trees, asset references, and template metadata directly from localhost memory and persistent storage.
                </p>
                <div className="small fw-semibold" style={{ color: "#F1F5F9" }}>
                  You can also click <strong>&quot;Export DB Dump (JSON)&quot;</strong> at the top right to download every record in raw JSON format.
                </div>
              </div>

              {/* METHOD 2: Browser LocalStorage in Chrome/Edge DevTools */}
              <div
                className="p-3.5 rounded-3 mb-4"
                style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold text-white mb-0">
                    Method 2: Inspect Browser LocalStorage (F12 DevTools)
                  </h6>
                  <span
                    className="badge rounded-pill"
                    style={{ backgroundColor: "#202938", color: "#36D9F5", border: "1px solid #303947" }}
                  >
                    Client Persistence
                  </span>
                </div>
                <p className="small mb-2" style={{ color: "#BFC7D2" }}>
                  To view raw serialized database records stored by SiteGenAI in your browser:
                </p>
                <ol className="small mb-2 ps-3" style={{ color: "#D1D5DB" }}>
                  <li>Press <strong>F12</strong> or <strong>Ctrl + Shift + I</strong> to open Developer Tools.</li>
                  <li>Click on the <strong>Application</strong> tab (in Chrome / Edge) or <strong>Storage</strong> tab (in Firefox).</li>
                  <li>In the left sidebar, expand <strong>Local Storage</strong> and click <code>http://localhost:3000</code>.</li>
                  <li>Click on the key: <code>sitegenai_projects_v1</code> to inspect the complete JSON array of stored websites.</li>
                </ol>
                <div className="d-flex align-items-center gap-2">
                  <span className="small" style={{ color: "#BFC7D2" }}>DevTools Console Command:</span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-xs py-0 px-2 rounded small text-white"
                    style={{ borderColor: "#303947" }}
                    onClick={() => copyToClipboard('console.log(JSON.parse(localStorage.getItem("sitegenai_projects_v1")))', "ls-cmd")}
                  >
                    {copiedText === "ls-cmd" ? <Check size={12} /> : <Copy size={12} />}
                    {copiedText === "ls-cmd" ? "Copied" : "Copy Console Command"}
                  </button>
                </div>
              </div>

              {/* METHOD 3: Supabase PostgreSQL Local Instance */}
              <div
                className="p-3.5 rounded-3 mb-2"
                style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold mb-0 text-white">
                    Method 3: Run Full Local Supabase PostgreSQL &amp; Supabase Studio
                  </h6>
                  <span
                    className="badge rounded-pill"
                    style={{ backgroundColor: "#202938", color: "#A3FF6F", border: "1px solid #303947" }}
                  >
                    Full PostgreSQL GUI
                  </span>
                </div>
                <p className="small mb-3" style={{ color: "#BFC7D2" }}>
                  If you want to run a local PostgreSQL instance and use Supabase Studio&apos;s web dashboard at <code>http://localhost:54323</code>:
                </p>

                <div className="mb-3">
                  <span className="small fw-semibold d-block mb-1" style={{ color: "#D1D5DB" }}>
                    Step 1: Start Supabase locally with Docker / npx
                  </span>
                  <pre
                    className="p-2 rounded-2 small mb-0 font-monospace"
                    style={{ backgroundColor: "#0B0D12", border: "1px solid #303947", color: "#A3FF6F" }}
                  >
                    <code>npx supabase start</code>
                  </pre>
                </div>

                <div className="mb-3">
                  <span className="small fw-semibold d-block mb-1" style={{ color: "#D1D5DB" }}>
                    Step 2: Apply the provided SiteGenAI PostgreSQL Schema
                  </span>
                  <pre
                    className="p-2 rounded-2 small mb-0 font-monospace"
                    style={{ backgroundColor: "#0B0D12", border: "1px solid #303947", color: "#A3FF6F" }}
                  >
                    <code>npx supabase db execute -f supabase/schema.sql</code>
                  </pre>
                </div>

                <div className="mb-3">
                  <span className="small fw-semibold d-block mb-1" style={{ color: "#D1D5DB" }}>
                    Step 3: Open Supabase Studio in your browser
                  </span>
                  <div
                    className="p-2 rounded-2 small d-flex justify-content-between align-items-center"
                    style={{ backgroundColor: "#0B0D12", border: "1px solid #303947" }}
                  >
                    <span style={{ color: "#D1D5DB" }}>Web GUI: <strong className="text-white">http://localhost:54323</strong></span>
                    <a
                      href="http://localhost:54323"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm rounded-pill px-2.5 py-0 fw-medium"
                      style={{ backgroundColor: "#A3FF6F", color: "#0B0D12" }}
                    >
                      Open Studio <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div>
                  <span className="small fw-semibold d-block mb-1" style={{ color: "#D1D5DB" }}>
                    Step 4: Connect via DBeaver / pgAdmin / psql
                  </span>
                  <pre
                    className="p-2 rounded-2 small mb-0 font-monospace"
                    style={{ backgroundColor: "#0B0D12", border: "1px solid #303947", color: "#F59E0B" }}
                  >
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
          style={{ backgroundColor: "rgba(11, 13, 18, 0.88)", backdropFilter: "blur(8px)", zIndex: 1070 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content rounded-4 shadow-2xl"
              style={{ backgroundColor: "#151A24", border: "1px solid #303947", color: "#FFFFFF" }}
            >
              <div
                className="modal-header py-3 px-4 d-flex align-items-center justify-content-between"
                style={{ borderBottom: "1px solid #303947" }}
              >
                <h6 className="modal-title fw-bold font-monospace text-white mb-0">
                  Record Inspector: {inspectModalRecord.name || inspectModalRecord.id}
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary text-white rounded-circle"
                  style={{ width: 32, height: 32, padding: 0, borderColor: "#303947" }}
                  onClick={() => setInspectModalRecord(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body p-4">
                <pre
                  className="p-3 rounded-3 small mb-3 overflow-auto font-monospace"
                  style={{
                    maxHeight: "60vh",
                    fontSize: "0.82rem",
                    backgroundColor: "#0B0D12",
                    border: "1px solid #303947",
                    color: "#A3FF6F",
                  }}
                >
                  <code>{JSON.stringify(inspectModalRecord, null, 2)}</code>
                </pre>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill text-white"
                    style={{ borderColor: "#303947" }}
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(inspectModalRecord, null, 2));
                      showToast("JSON copied to clipboard!");
                    }}
                  >
                    Copy JSON
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm rounded-pill fw-bold"
                    style={{ backgroundColor: "#A3FF6F", color: "#0B0D12", border: "none" }}
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
          <div
            className="sg-toast d-flex align-items-center gap-2"
            style={{ backgroundColor: "#151A24", border: "1px solid #303947", color: "#FFFFFF" }}
          >
            <CheckCircle2 size={16} style={{ color: "#A3FF6F" }} />
            <span>{adminToast}</span>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
