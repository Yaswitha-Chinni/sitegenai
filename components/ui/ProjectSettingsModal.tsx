"use client";

import React, { useState } from "react";
import { WebsiteDocument } from "@/types/project";
import {
  Settings,
  Server,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  RefreshCw,
  X,
} from "lucide-react";

interface ProjectSettingsModalProps {
  project: WebsiteDocument;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (updated: WebsiteDocument) => void;
}

export default function ProjectSettingsModal({
  project,
  isOpen,
  onClose,
  onUpdateProject,
}: ProjectSettingsModalProps) {
  const [port, setPort] = useState<number>(project.localPort || 3000);
  const [checkingPort, setCheckingPort] = useState(false);
  const [portStatus, setPortStatus] = useState<{ available?: boolean; message?: string } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckPort = async () => {
    setCheckingPort(true);
    setPortStatus(null);
    try {
      const res = await fetch(`/api/projects/check-port?port=${port}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPortStatus({ available: false, message: data.error || "Port is unavailable" });
      } else {
        setPortStatus({ available: data.available, message: data.message });
      }
    } catch (err: any) {
      setPortStatus({ available: false, message: "Could not test port status on server." });
    } finally {
      setCheckingPort(false);
    }
  };

  const handleSaveSettings = () => {
    const updated: WebsiteDocument = {
      ...project,
      localPort: port,
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updated);
    onClose();
  };

  const powershellCommand = `npx -y serve -p ${port} .`;
  const pythonCommand = `python -m http.server ${port}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(11, 13, 18, 0.88)",
        backdropFilter: "blur(8px)",
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border rounded-4 shadow-2xl overflow-hidden"
          style={{
            backgroundColor: "#151A24",
            borderColor: "#303947",
            color: "#FFFFFF",
          }}
        >
          {/* Header */}
          <div
            className="modal-header py-3 px-4 d-flex align-items-center justify-content-between"
            style={{ borderBottom: "1px solid #303947" }}
          >
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2 text-white fs-6 mb-0">
              <Settings size={18} style={{ color: "#A3FF6F" }} />
              Project Settings &amp; Local Server Port
            </h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary text-white rounded-circle"
              style={{ width: 32, height: 32, padding: 0 }}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="modal-body p-4">
            {/* Project Basic Info */}
            <div className="mb-4">
              <label className="form-label small fw-semibold" style={{ color: "#F1F5F9" }}>
                Project Name
              </label>
              <input
                type="text"
                className="form-control"
                value={project.name}
                disabled
                style={{
                  backgroundColor: "#10141C",
                  borderColor: "#303947",
                  color: "#D1D5DB",
                }}
              />
            </div>

            {/* Local Port Selector & Validator */}
            <div
              className="p-3.5 rounded-3 mb-4"
              style={{
                backgroundColor: "#10141C",
                border: "1px solid #303947",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <Server size={18} style={{ color: "#A3FF6F" }} />
                <h6 className="fw-bold mb-0 text-white">Local Development Port Configuration</h6>
              </div>
              <p className="small mb-3" style={{ color: "#BFC7D2" }}>
                Specify the preferred local port for running this standalone website on your machine.
                SiteGenAI verifies socket availability so you don&apos;t encounter port collisions.
              </p>

              <div className="row g-2 align-items-center mb-3">
                <div className="col-12 col-sm-4">
                  <div className="input-group">
                    <span
                      className="input-group-text"
                      style={{
                        backgroundColor: "#202938",
                        borderColor: "#303947",
                        color: "#BFC7D2",
                      }}
                    >
                      Port
                    </span>
                    <input
                      type="number"
                      min={1024}
                      max={65535}
                      className="form-control fw-bold"
                      value={port}
                      onChange={(e) => {
                        setPort(parseInt(e.target.value) || 3000);
                        setPortStatus(null);
                      }}
                      style={{
                        backgroundColor: "#151A24",
                        borderColor: "#303947",
                        color: "#FFFFFF",
                      }}
                    />
                  </div>
                </div>

                <div className="col-12 col-sm-8 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2 text-white"
                    onClick={handleCheckPort}
                    disabled={checkingPort}
                    style={{
                      borderColor: "#303947",
                      backgroundColor: "#202938",
                    }}
                  >
                    {checkingPort ? <RefreshCw size={15} className="spin" /> : <Server size={15} />}
                    Validate Port Availability
                  </button>
                </div>
              </div>

              {/* Port Status feedback */}
              {portStatus && (
                <div
                  className="alert py-2 px-3 small d-flex align-items-center gap-2 mb-0 rounded-3"
                  style={{
                    backgroundColor: portStatus.available ? "rgba(163, 255, 111, 0.15)" : "rgba(245, 158, 11, 0.15)",
                    border: `1px solid ${portStatus.available ? "rgba(163, 255, 111, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                    color: portStatus.available ? "#A3FF6F" : "#F59E0B",
                  }}
                >
                  {portStatus.available ? (
                    <CheckCircle2 size={16} className="flex-shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="flex-shrink-0" />
                  )}
                  <span>{portStatus.message}</span>
                </div>
              )}
            </div>

            {/* Real Local Execution Instructions */}
            <div
              className="p-3.5 rounded-3 mb-2"
              style={{
                backgroundColor: "#10141C",
                border: "1px solid #303947",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2 text-white">
                <Terminal size={18} style={{ color: "#36D9F5" }} />
                <h6 className="fw-bold mb-0">Exact Local Run Commands</h6>
              </div>
              <p className="small mb-3" style={{ color: "#BFC7D2" }}>
                After downloading the exported ZIP archive, open a terminal in the extracted folder and run:
              </p>

              {/* Command 1: npx serve */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold" style={{ color: "#D1D5DB" }}>
                    Option 1: Node.js (npx serve)
                  </span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 d-flex align-items-center gap-1 text-decoration-none"
                    style={{ color: "#A3FF6F" }}
                    onClick={() => copyToClipboard(powershellCommand, "npx")}
                  >
                    {copiedCmd === "npx" ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCmd === "npx" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre
                  className="p-2.5 rounded-2 small mb-0 font-monospace"
                  style={{
                    backgroundColor: "#0B0D12",
                    border: "1px solid #303947",
                    color: "#A3FF6F",
                  }}
                >
                  <code>{powershellCommand}</code>
                </pre>
              </div>

              {/* Command 2: Python HTTP Server */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold" style={{ color: "#D1D5DB" }}>
                    Option 2: Python 3 HTTP Server
                  </span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 d-flex align-items-center gap-1 text-decoration-none"
                    style={{ color: "#A3FF6F" }}
                    onClick={() => copyToClipboard(pythonCommand, "py")}
                  >
                    {copiedCmd === "py" ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCmd === "py" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre
                  className="p-2.5 rounded-2 small mb-0 font-monospace"
                  style={{
                    backgroundColor: "#0B0D12",
                    border: "1px solid #303947",
                    color: "#A3FF6F",
                  }}
                >
                  <code>{pythonCommand}</code>
                </pre>
              </div>
            </div>
          </div>

          <div
            className="modal-footer py-3 px-4 d-flex justify-content-end gap-2"
            style={{ borderTop: "1px solid #303947" }}
          >
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-4 text-white"
              style={{ borderColor: "#303947" }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm rounded-pill px-4 fw-bold"
              style={{
                backgroundColor: "#A3FF6F",
                color: "#0B0D12",
                border: "none",
              }}
              onClick={handleSaveSettings}
            >
              Save Port Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
