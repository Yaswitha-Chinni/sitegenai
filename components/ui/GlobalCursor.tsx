"use client";

import React, { useEffect, useRef, useState } from "react";

export default function GlobalCursor() {
  const [enabled, setEnabled] = useState(true);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Accessibility & Safety Checks
    if (typeof window === "undefined") return;

    // Check touch devices or no hover support
    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasHover) {
      setEnabled(false);
      return;
    }

    // Check reduced-motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    // Check user preference in localStorage
    try {
      const storedPref = localStorage.getItem("sitegenai_cursor_glow");
      if (storedPref === "disabled") {
        setEnabled(false);
        return;
      }
    } catch {}

    let mouseX = -500;
    let mouseY = -500;
    let currentX = -500;
    let currentY = -500;
    let animFrameId: number;
    let isVisible = false;

    // Smooth Lerp loop for the glow
    const updateGlow = () => {
      // Linear interpolation for smooth trailing without lag
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
        glowRef.current.style.opacity = isVisible ? "1" : "0";
      }

      animFrameId = requestAnimationFrame(updateGlow);
    };

    animFrameId = requestAnimationFrame(updateGlow);

    // Global Pointer Move Handler
    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) isVisible = true;

      // Card Spotlight & 3D Tilt calculation
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const card = target.closest(".card-spotlight, .card-3d-tilt, .sb-card") as HTMLElement | null;
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);

        // Subtle 3D Tilt calculation
        if (card.classList.contains("card-3d-tilt")) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -3; // Max ±3 deg
          const rotateY = ((x - centerX) / centerX) * 3;  // Max ±3 deg
          card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
        }
      }

      // Magnetic Buttons effect
      const magneticBtn = target.closest(".btn-magnetic") as HTMLElement | null;
      if (magneticBtn) {
        const rect = magneticBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.15; // Max slight pull
        const deltaY = (e.clientY - centerY) * 0.15;
        const clampedX = Math.max(-5, Math.min(5, deltaX));
        const clampedY = Math.max(-5, Math.min(5, deltaY));
        magneticBtn.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;
      }
    };

    const handlePointerLeave = () => {
      isVisible = false;
      if (glowRef.current) {
        glowRef.current.style.opacity = "0";
      }
    };

    const handleCardMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const card = target.closest(".card-3d-tilt") as HTMLElement | null;
      if (card) {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      }
      const magneticBtn = target.closest(".btn-magnetic") as HTMLElement | null;
      if (magneticBtn) {
        magneticBtn.style.transform = "translate3d(0, 0, 0)";
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    document.addEventListener("mouseout", handleCardMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      document.removeEventListener("mouseout", handleCardMouseLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={glowRef}
      className="global-cursor-glow"
      aria-hidden="true"
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: 0,
        left: 0,
        opacity: 0,
        transition: "opacity 0.25s ease",
      }}
    />
  );
}
