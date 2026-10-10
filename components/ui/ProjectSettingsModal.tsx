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
  ExternalLink,
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
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div className="modal-header border-bottom py-3 px-4">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <Settings size={20} className="text-primary" />
              Project Settings & Local Server Port
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Project Basic Info */}
            <div className="mb-4">
              <label className="sg-form-label fw-bold">Project Name</label>
              <input
                type="text"
                className="form-control"
                value={project.name}
                disabled
              />
            </div>

            {/* Local Port Selector & Validator */}
            <div className="p-3 rounded-3 border bg-light mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Server size={18} className="text-primary" />
                <h6 className="fw-bold mb-0">Local Development Port Configuration</h6>
              </div>
              <p className="small text-secondary mb-3">
                Specify the preferred local port for running this standalone website on your machine.
                SiteGenAI verifies socket availability so you don't encounter port collisions.
              </p>

              <div className="row g-2 align-items-center mb-3">
                <div className="col-12 col-sm-4">
                  <div className="input-group">
                    <span className="input-group-text bg-white text-secondary">Port</span>
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
                    />
                  </div>
                </div>

                <div className="col-12 col-sm-8 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    onClick={handleCheckPort}
                    disabled={checkingPort}
                  >
                    {checkingPort ? <RefreshCw size={15} className="spin" /> : <Server size={15} />}
                    Validate Port Availability
                  </button>
                </div>
              </div>

              {/* Port Status feedback */}
              {portStatus && (
                <div
                  className={`alert py-2 px-3 small d-flex align-items-center gap-2 mb-0 rounded-3 ${
                    portStatus.available ? "alert-success" : "alert-warning"
                  }`}
                >
                  {portStatus.available ? (
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-warning flex-shrink-0" />
                  )}
                  <span>{portStatus.message}</span>
                </div>
              )}
            </div>

            {/* Real Local Execution Instructions */}
            <div className="p-3 rounded-3 border bg-white mb-2">
              <div className="d-flex align-items-center gap-2 mb-2 text-dark">
                <Terminal size={18} className="text-primary" />
                <h6 className="fw-bold mb-0">Exact Local Run Commands</h6>
              </div>
              <p className="small text-secondary mb-3">
                After downloading the exported ZIP archive, open a terminal in the extracted folder and run:
              </p>

              {/* Command 1: npx serve */}
              <div className="mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold text-secondary">Option 1: Node.js (npx serve)</span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-primary d-flex align-items-center gap-1"
                    onClick={() => copyToClipboard(powershellCommand, "npx")}
                  >
                    {copiedCmd === "npx" ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCmd === "npx" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-2 bg-dark text-success rounded-2 small mb-0">
                  <code>{powershellCommand}</code>
                </pre>
              </div>

              {/* Command 2: Python HTTP Server */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold text-secondary">Option 2: Python 3 HTTP Server</span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-primary d-flex align-items-center gap-1"
                    onClick={() => copyToClipboard(pythonCommand, "py")}
                  >
                    {copiedCmd === "py" ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCmd === "py" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-2 bg-dark text-success rounded-2 small mb-0">
                  <code>{pythonCommand}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top py-3 px-4">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4"
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
