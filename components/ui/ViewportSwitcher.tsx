"use client";

import React from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";

export type ViewportMode = "desktop" | "tablet" | "mobile";

interface ViewportSwitcherProps {
  currentMode: ViewportMode;
  onChange: (mode: ViewportMode) => void;
  size?: "sm" | "md";
}

export default function ViewportSwitcher({
  currentMode,
  onChange,
  size = "md",
}: ViewportSwitcherProps) {
  const options: { mode: ViewportMode; label: string; icon: React.ReactNode; width: string }[] = [
    { mode: "desktop", label: "Desktop", icon: <Monitor size={size === "sm" ? 14 : 16} />, width: "1440px" },
    { mode: "tablet", label: "Tablet", icon: <Tablet size={size === "sm" ? 14 : 16} />, width: "768px" },
    { mode: "mobile", label: "Mobile", icon: <Smartphone size={size === "sm" ? 14 : 16} />, width: "375px" },
  ];

  return (
    <div
      className="btn-group p-1 bg-light border rounded-3 align-items-center"
      role="group"
      aria-label="Responsive viewport mode selector"
    >
      {options.map((opt) => {
        const isActive = currentMode === opt.mode;
        return (
          <button
            key={opt.mode}
            type="button"
            className={`btn btn-sm ${
              isActive
                ? "btn-white bg-white shadow-sm fw-semibold text-primary border"
                : "text-secondary border-0"
            } d-flex align-items-center gap-1 py-1 px-2`}
            onClick={() => onChange(opt.mode)}
            title={`${opt.label} viewport (${opt.width})`}
            aria-pressed={isActive}
            id={`viewport-btn-${opt.mode}`}
          >
            {opt.icon}
            <span className={size === "sm" ? "d-none d-md-inline" : "d-none d-sm-inline"} style={{ fontSize: "0.82rem" }}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
