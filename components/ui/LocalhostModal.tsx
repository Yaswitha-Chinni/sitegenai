"use client";

import React, { useState, useEffect } from "react";
import { WebsiteDocument } from "@/types/project";
import {
  Server,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  AlertCircle,
  CheckCircle2,
  X,
  Radio,
} from "lucide-react";

interface LocalhostModalProps {
  project: WebsiteDocument;
  isOpen: boolean;
  onClose: () => void;
}

export default function LocalhostModal({ project, isOpen, onClose }: LocalhostModalProps) {
  const [status, setStatus] = useState<"stopped" | "starting" | "running" | "error">("stopped");
  const [port, setPort] = useState<number>(project.localPort || 3001);
  const [url, setUrl] = useState<string>("");
  const [framework, setFramework] = useState<string>("");
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; level: string }>>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkCurrentStatus();
    }
  }, [isOpen, project.id]);

  const checkCurrentStatus = async () => {
    try {
      const res = await fetch(`/api/projects/localhost-run?projectId=${project.id}`);
      const data = await res.json();
      if (data.success && data.server) {
        setStatus(data.server.status || "stopped");
        if (data.server.port) setPort(data.server.port);
        if (data.server.url) setUrl(data.server.url);
        if (data.server.framework) setFramework(data.server.framework);
        if (data.server.logs) setLogs(data.server.logs);
      }
    } catch {
      // Ignored
    }
  };

  const handleStartServer = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setStatus("starting");

    try {
      const res = await fetch("/api/projects/localhost-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to start localhost server.");
      }

      setStatus("running");
      setPort(data.server.port);
      setUrl(data.server.url);
      setFramework(data.server.framework);
      setLogs(data.server.logs || []);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to launch server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopServer = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/projects/localhost-run?projectId=${project.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setStatus("stopped");
        setUrl("");
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            message: "Localhost server stopped cleanly by user.",
            level: "warn",
          },
        ]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to stop server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestartServer = async () => {
    await handleStopServer();
    setTimeout(() => {
      handleStartServer();
    }, 400);
  };

  const handleCopyUrl = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{
        backgroundColor: "rgba(11, 13, 18, 0.88)",
        backdropFilter: "blur(8px)",
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border rounded-4 shadow-2xl overflow-hidden text-white"
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
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="p-1.5 rounded-3 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "#A3FF6F", color: "#0B0D12" }}
              >
                <Server size={18} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0 fs-6">Run Website on Localhost</h5>
                <small style={{ color: "#BFC7D2", fontSize: "0.78rem" }}>
                  Managed local development server with real port binding and live logging
                </small>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary text-white rounded-circle"
              style={{ width: 32, height: 32, padding: 0, borderColor: "#303947" }}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="modal-body p-4">
            {/* Status & Control Banner */}
            <div
              className="p-3.5 rounded-4 mb-4"
              style={{
                backgroundColor: "#10141C",
                border: "1px solid #303947",
              }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor:
                        status === "running"
                          ? "rgba(163, 255, 111, 0.15)"
                          : status === "starting"
                          ? "rgba(54, 217, 245, 0.15)"
                          : status === "error"
                          ? "rgba(239, 68, 68, 0.15)"
                          : "rgba(255, 255, 255, 0.05)",
                      color:
                        status === "running"
                          ? "#A3FF6F"
                          : status === "starting"
                          ? "#36D9F5"
                          : status === "error"
                          ? "#FCA5A5"
                          : "#BFC7D2",
                    }}
                  >
                    <Radio size={24} className={status === "starting" ? "spin" : ""} />
                  </div>

                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span
                        className="badge rounded-pill fw-bold"
                        style={{
                          backgroundColor:
                            status === "running"
                              ? "rgba(163, 255, 111, 0.2)"
                              : status === "starting"
                              ? "rgba(54, 217, 245, 0.2)"
                              : status === "error"
                              ? "rgba(239, 68, 68, 0.2)"
                              : "#202938",
                          color:
                            status === "running"
                              ? "#A3FF6F"
                              : status === "starting"
                              ? "#36D9F5"
                              : status === "error"
                              ? "#FCA5A5"
                              : "#BFC7D2",
                          border: "1px solid currentColor",
                        }}
                      >
                        {status === "running"
                          ? "● SERVER RUNNING"
                          : status === "starting"
                          ? "◌ STARTING SERVER..."
                          : status === "error"
                          ? "✕ SERVER ERROR"
                          : "○ SERVER STOPPED"}
                      </span>
                      {framework && (
                        <span className="small font-monospace" style={{ color: "#BFC7D2", fontSize: "0.76rem" }}>
                          {framework}
                        </span>
                      )}
                    </div>

                    <h4 className="fw-bold text-white mb-0">
                      {status === "running" ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none"
                          style={{ color: "#A3FF6F" }}
                        >
                          {url} <ExternalLink size={16} className="ms-1" />
                        </a>
                      ) : (
                        `Target Port: :${port}`
                      )}
                    </h4>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="d-flex align-items-center gap-2">
                  {status === "running" ? (
                    <>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm rounded-pill px-3.5 py-1.5 fw-bold d-flex align-items-center gap-1.5 text-decoration-none"
                        style={{
                          backgroundColor: "#A3FF6F",
                          color: "#0B0D12",
                        }}
                      >
                        <ExternalLink size={15} />
                        Open Website
                      </a>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3 text-white"
                        style={{ borderColor: "#303947" }}
                        onClick={handleCopyUrl}
                        title="Copy URL"
                      >
                        {copiedUrl ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        <span className="ms-1">{copiedUrl ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                        onClick={handleStopServer}
                        disabled={isProcessing}
                        title="Stop Server Process"
                      >
                        <Square size={14} className="me-1" />
                        Stop
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill p-1.5 text-white"
                        style={{ borderColor: "#303947" }}
                        onClick={handleRestartServer}
                        disabled={isProcessing}
                        title="Restart Server"
                      >
                        <RefreshCw size={14} className={isProcessing ? "spin" : ""} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2"
                      style={{
                        backgroundColor: "#A3FF6F",
                        color: "#0B0D12",
                        boxShadow: "0 0 16px rgba(163, 255, 111, 0.25)",
                      }}
                      onClick={handleStartServer}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
                      {isProcessing ? "Starting Localhost..." : "Start Localhost Server"}
                    </button>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div
                  className="alert py-2.5 px-3 rounded-3 small d-flex align-items-center gap-2 mt-3 mb-0"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#FCA5A5",
                  }}
                >
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Live Terminal Logs */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small fw-semibold d-flex align-items-center gap-1.5 text-white">
                  <Terminal size={15} style={{ color: "#36D9F5" }} />
                  Live Server Telemetry &amp; Runtime Logs
                </span>
                <span className="small font-monospace" style={{ color: "#BFC7D2", fontSize: "0.72rem" }}>
                  {logs.length} log lines
                </span>
              </div>

              <div
                className="p-3 rounded-3 font-monospace small"
                style={{
                  backgroundColor: "#0B0D12",
                  border: "1px solid #303947",
                  maxHeight: "190px",
                  overflowY: "auto",
                  fontSize: "0.78rem",
                }}
              >
                {logs.length === 0 ? (
                  <div className="p-3 text-center" style={{ color: "#8E9CAE" }}>
                    Server is stopped. Click &quot;Start Localhost Server&quot; to begin streaming requests.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="d-flex gap-2 mb-1">
                      <span style={{ color: "#8E9CAE" }}>[{log.timestamp}]</span>
                      <span
                        style={{
                          color:
                            log.level === "success"
                              ? "#A3FF6F"
                              : log.level === "warn"
                              ? "#F59E0B"
                              : log.level === "error"
                              ? "#FCA5A5"
                              : "#D1D5DB",
                        }}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Offline Localhost Fallback Instructions */}
            <div
              className="p-3 rounded-3"
              style={{
                backgroundColor: "#10141C",
                border: "1px solid #303947",
              }}
            >
              <span className="small fw-semibold d-block mb-1 text-white">
                Offline Terminal Commands (Run Directly on Your Machine)
              </span>
              <p className="small mb-2" style={{ color: "#BFC7D2", fontSize: "0.78rem" }}>
                You can also run this website without the web app using your preferred local CLI:
              </p>
              <div className="d-flex flex-column gap-1.5">
                <div
                  className="p-2 rounded font-monospace small d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: "#0B0D12", border: "1px solid #303947" }}
                >
                  <span style={{ color: "#A3FF6F" }}>npx -y serve -p {port} .</span>
                  <span className="badge" style={{ backgroundColor: "#202938", color: "#BFC7D2" }}>Node.js</span>
                </div>
                <div
                  className="p-2 rounded font-monospace small d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: "#0B0D12", border: "1px solid #303947" }}
                >
                  <span style={{ color: "#A3FF6F" }}>python -m http.server {port}</span>
                  <span className="badge" style={{ backgroundColor: "#202938", color: "#BFC7D2" }}>Python 3</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-footer py-2.5 px-4 d-flex justify-content-between align-items-center"
            style={{ borderTop: "1px solid #303947" }}
          >
            <span className="small" style={{ color: "#BFC7D2", fontSize: "0.76rem" }}>
              Runs on your local loopback interface (127.0.0.1) without cloud dependencies.
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-4 text-white"
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
