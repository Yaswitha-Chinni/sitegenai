"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Server,
  Eye,
  Save,
  Download,
  Sparkles,
  Sliders,
  History,
  FileCode,
  Layers,
  ArrowRight,
  Palette,
  X,
  Keyboard,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Actions" | "Tools" | "Viewports";
  shortcut?: string;
  icon: any;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRunLocalhost: () => void;
  onPreview: () => void;
  onSave: () => void;
  onExport: () => void;
  onOpenAiAssistant: () => void;
  onOpenResponsiveLab: () => void;
  onOpenSeoAudit: () => void;
  onOpenVersionHistory: () => void;
  onSetViewport: (mode: "desktop" | "tablet" | "mobile") => void;
  onOpenBrandKit: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onRunLocalhost,
  onPreview,
  onSave,
  onExport,
  onOpenAiAssistant,
  onOpenResponsiveLab,
  onOpenSeoAudit,
  onOpenVersionHistory,
  onSetViewport,
  onOpenBrandKit,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: "save",
      title: "Save Project Changes",
      category: "Actions",
      shortcut: "Ctrl+S",
      icon: Save,
      action: onSave,
    },
    {
      id: "preview",
      title: "Open Live Full-Page Preview",
      category: "Actions",
      shortcut: "P",
      icon: Eye,
      action: onPreview,
    },
    {
      id: "localhost",
      title: "Run Website on Localhost Server",
      category: "Actions",
      shortcut: "L",
      icon: Server,
      action: onRunLocalhost,
    },
    {
      id: "export",
      title: "Export Standalone ZIP Package",
      category: "Actions",
      shortcut: "Ctrl+E",
      icon: Download,
      action: onExport,
    },
    {
      id: "ai-improve",
      title: "AI Website Improvement Assistant",
      category: "Tools",
      shortcut: "Ctrl+A",
      icon: Sparkles,
      action: onOpenAiAssistant,
    },
    {
      id: "responsive-lab",
      title: "Responsive Design Testing Lab",
      category: "Tools",
      shortcut: "Ctrl+R",
      icon: Sliders,
      action: onOpenResponsiveLab,
    },
    {
      id: "seo-audit",
      title: "SEO & Accessibility Quality Audit",
      category: "Tools",
      shortcut: "Ctrl+Shift+S",
      icon: Search,
      action: onOpenSeoAudit,
    },
    {
      id: "version-history",
      title: "Version History & Snapshot Milestones",
      category: "Tools",
      shortcut: "Ctrl+H",
      icon: History,
      action: onOpenVersionHistory,
    },
    {
      id: "brand-kit",
      title: "Brand Kit & Design Tokens",
      category: "Tools",
      shortcut: "Ctrl+B",
      icon: Palette,
      action: onOpenBrandKit,
    },
    {
      id: "viewport-desktop",
      title: "Switch Viewport: Desktop (1440px)",
      category: "Viewports",
      icon: Sliders,
      action: () => onSetViewport("desktop"),
    },
    {
      id: "viewport-tablet",
      title: "Switch Viewport: Tablet (768px)",
      category: "Viewports",
      icon: Sliders,
      action: () => onSetViewport("tablet"),
    },
    {
      id: "viewport-mobile",
      title: "Switch Viewport: Mobile (390px)",
      category: "Viewports",
      icon: Sliders,
      action: () => onSetViewport("mobile"),
    },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((idx) => (idx + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((idx) => (idx - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filtered, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{
        backgroundColor: "rgba(11, 13, 18, 0.82)",
        backdropFilter: "blur(12px)",
        zIndex: 1070,
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 620 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border rounded-4 shadow-2xl overflow-hidden text-white"
          style={{
            backgroundColor: "#151A24",
            borderColor: "#303947",
          }}
        >
          {/* Search Input Bar */}
          <div
            className="p-3 d-flex align-items-center gap-2 border-bottom"
            style={{ backgroundColor: "#10141C", borderColor: "#303947" }}
          >
            <Search size={18} style={{ color: "#A3FF6F" }} />
            <input
              type="text"
              autoFocus
              className="form-control bg-transparent border-0 text-white shadow-none fs-6 p-0"
              placeholder="Type a command or search action (e.g., Run, Save, Preview)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ outline: "none" }}
            />
            <span
              className="badge font-monospace small px-2 py-1"
              style={{ backgroundColor: "#202938", color: "#BFC7D2" }}
            >
              ESC
            </span>
          </div>

          {/* Results List */}
          <div
            className="p-2 overflow-y-auto"
            style={{ maxHeight: "380px" }}
          >
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-muted small">
                No matching commands found. Try &quot;Save&quot;, &quot;Run&quot;, or &quot;Preview&quot;.
              </div>
            ) : (
              filtered.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={cmd.id}
                    className="p-2.5 rounded-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                    style={{
                      backgroundColor: isSelected ? "rgba(163, 255, 111, 0.12)" : "transparent",
                      border: isSelected ? "1px solid rgba(163, 255, 111, 0.3)" : "1px solid transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="d-flex align-items-center gap-2.5">
                      <div
                        className="p-1.5 rounded-2 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: isSelected ? "#A3FF6F" : "#10141C",
                          color: isSelected ? "#0B0D12" : "#BFC7D2",
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="fw-semibold small text-white">{cmd.title}</div>
                        <span className="small" style={{ color: "#8E9CAE", fontSize: "0.74rem" }}>
                          {cmd.category}
                        </span>
                      </div>
                    </div>

                    {cmd.shortcut && (
                      <span
                        className="badge font-monospace small px-2 py-1"
                        style={{
                          backgroundColor: "#10141C",
                          color: isSelected ? "#A3FF6F" : "#BFC7D2",
                          border: "1px solid #303947",
                        }}
                      >
                        {cmd.shortcut}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Guide */}
          <div
            className="py-2 px-3 border-top d-flex justify-content-between align-items-center small"
            style={{ backgroundColor: "#10141C", borderColor: "#303947", color: "#8E9CAE", fontSize: "0.75rem" }}
          >
            <span>Navigation: ↑ ↓ Enter to execute</span>
            <span>SiteGenAI Command Hub (Ctrl+K)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
