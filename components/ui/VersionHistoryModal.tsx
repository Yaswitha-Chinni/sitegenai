"use client";

import React, { useState, useEffect } from "react";
import { WebsiteDocument } from "@/types/project";
import {
  History,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Eye,
  X,
  Clock,
  Sparkles,
} from "lucide-react";

export interface ProjectSnapshot {
  id: string;
  versionNumber: number;
  timestamp: string;
  creator: "User Manual Save" | "AI Improvement" | "Initial Blueprint" | "Auto-Save";
  summary: string;
  sectionsCount: number;
  projectData: WebsiteDocument;
}

interface VersionHistoryModalProps {
  project: WebsiteDocument;
  isOpen: boolean;
  onClose: () => void;
  onRestoreSnapshot: (restoredProject: WebsiteDocument) => void;
}

export default function VersionHistoryModal({
  project,
  isOpen,
  onClose,
  onRestoreSnapshot,
}: VersionHistoryModalProps) {
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [newSnapshotDesc, setNewSnapshotDesc] = useState("");
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);

  const storageKey = `sitegenai_snapshots_${project.id}`;

  useEffect(() => {
    if (isOpen) {
      loadSnapshots();
    }
  }, [isOpen, project.id]);

  const loadSnapshots = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setSnapshots(JSON.parse(raw));
      } else {
        // Create initial v1 snapshot if none exists
        const initial: ProjectSnapshot = {
          id: `snap-${Date.now()}`,
          versionNumber: 1,
          timestamp: project.createdAt || new Date().toISOString(),
          creator: "Initial Blueprint",
          summary: "Initial synthesized website baseline",
          sectionsCount: project.sections?.length || 0,
          projectData: project,
        };
        const initialList = [initial];
        localStorage.setItem(storageKey, JSON.stringify(initialList));
        setSnapshots(initialList);
      }
    } catch {
      // Ignored
    }
  };

  const handleCreateSnapshot = () => {
    if (!newSnapshotDesc.trim()) return;

    const nextVer = snapshots.length + 1;
    const newSnap: ProjectSnapshot = {
      id: `snap-${Date.now()}`,
      versionNumber: nextVer,
      timestamp: new Date().toISOString(),
      creator: "User Manual Save",
      summary: newSnapshotDesc.trim(),
      sectionsCount: project.sections?.length || 0,
      projectData: project,
    };

    const updated = [newSnap, ...snapshots];
    setSnapshots(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewSnapshotDesc("");
  };

  const handleRestore = (snap: ProjectSnapshot) => {
    // 1. Create automatic safety backup of current state before restoring
    const backupSnap: ProjectSnapshot = {
      id: `snap-backup-${Date.now()}`,
      versionNumber: snapshots.length + 1,
      timestamp: new Date().toISOString(),
      creator: "Auto-Save",
      summary: `Auto-backup before restoring v${snap.versionNumber}`,
      sectionsCount: project.sections?.length || 0,
      projectData: project,
    };

    const nextList = [backupSnap, ...snapshots];
    localStorage.setItem(storageKey, JSON.stringify(nextList));
    setSnapshots(nextList);

    // 2. Perform restoration
    onRestoreSnapshot(snap.projectData);
    setConfirmRestoreId(null);
    setRestoreNotice(`Successfully restored website to Snapshot v${snap.versionNumber}`);
    setTimeout(() => {
      setRestoreNotice(null);
      onClose();
    }, 1500);
  };

  const handleDeleteSnapshot = (id: string) => {
    const next = snapshots.filter((s) => s.id !== id);
    setSnapshots(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
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
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
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
                style={{ backgroundColor: "#8B7CFF", color: "#FFFFFF" }}
              >
                <History size={18} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0 fs-6">Version History &amp; Milestones</h5>
                <small style={{ color: "#BFC7D2", fontSize: "0.78rem" }}>
                  Persistent version snapshots with safe rollback and automatic backups
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
            {/* Create Snapshot Bar */}
            <div
              className="p-3.5 rounded-4 mb-4"
              style={{ backgroundColor: "#10141C", border: "1px solid #303947" }}
            >
              <label className="form-label small fw-semibold text-white mb-2">
                Create Version Snapshot of Current Draft
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control text-white"
                  style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
                  placeholder="e.g. Completed hero section copy and updated accent colors..."
                  value={newSnapshotDesc}
                  onChange={(e) => setNewSnapshotDesc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateSnapshot();
                  }}
                />
                <button
                  type="button"
                  className="btn fw-bold px-3 d-flex align-items-center gap-1.5"
                  style={{ backgroundColor: "#A3FF6F", color: "#0B0D12" }}
                  onClick={handleCreateSnapshot}
                  disabled={!newSnapshotDesc.trim()}
                >
                  <Plus size={16} /> Save Milestone
                </button>
              </div>
            </div>

            {restoreNotice && (
              <div
                className="alert py-2.5 px-3 rounded-3 small d-flex align-items-center gap-2 mb-3"
                style={{
                  backgroundColor: "rgba(163, 255, 111, 0.15)",
                  border: "1px solid rgba(163, 255, 111, 0.3)",
                  color: "#A3FF6F",
                }}
              >
                <CheckCircle2 size={16} />
                <span>{restoreNotice}</span>
              </div>
            )}

            {/* Snapshots Timeline */}
            <div className="d-flex flex-column gap-3">
              {snapshots.map((snap) => {
                const isConfirming = confirmRestoreId === snap.id;
                return (
                  <div
                    key={snap.id}
                    className="p-3.5 rounded-4 transition-all"
                    style={{
                      backgroundColor: "#10141C",
                      border: "1px solid #303947",
                    }}
                  >
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span
                          className="badge rounded-pill fw-bold"
                          style={{
                            backgroundColor: "rgba(139, 124, 255, 0.15)",
                            color: "#8B7CFF",
                            border: "1px solid rgba(139, 124, 255, 0.35)",
                          }}
                        >
                          v{snap.versionNumber}
                        </span>
                        <span className="fw-bold text-white small">{snap.summary}</span>
                        <span className="badge" style={{ backgroundColor: "#202938", color: "#BFC7D2" }}>
                          {snap.creator}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-2 align-self-end align-self-md-auto">
                        {!isConfirming ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 text-white d-flex align-items-center gap-1.5"
                            style={{ borderColor: "#303947", fontSize: "0.8rem" }}
                            onClick={() => setConfirmRestoreId(snap.id)}
                          >
                            <RotateCcw size={13} />
                            Restore This Version
                          </button>
                        ) : (
                          <div className="d-flex align-items-center gap-1.5">
                            <button
                              type="button"
                              className="btn btn-sm rounded-pill px-3 py-1 fw-bold"
                              style={{ backgroundColor: "#A3FF6F", color: "#0B0D12", fontSize: "0.8rem" }}
                              onClick={() => handleRestore(snap)}
                            >
                              Confirm Restore
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1 text-white"
                              style={{ borderColor: "#303947", fontSize: "0.8rem" }}
                              onClick={() => setConfirmRestoreId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {snapshots.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                            style={{ width: 28, height: 28 }}
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            title="Delete snapshot"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 small" style={{ color: "#8E9CAE", fontSize: "0.78rem" }}>
                      <span className="d-flex align-items-center gap-1">
                        <Calendar size={13} /> {new Date(snap.timestamp).toLocaleString()}
                      </span>
                      <span>&bull;</span>
                      <span className="d-flex align-items-center gap-1">
                        <Layers size={13} /> {snap.sectionsCount} Sections
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="modal-footer py-2.5 px-4 d-flex justify-content-between align-items-center"
            style={{ borderTop: "1px solid #303947" }}
          >
            <span className="small" style={{ color: "#BFC7D2", fontSize: "0.76rem" }}>
              Restoring a prior milestone automatically creates an auto-backup of your current work.
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
