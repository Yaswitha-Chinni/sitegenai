"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X, ArrowRight, LayoutTemplate, Layers, Compass, User } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Explore Templates", href: "/templates", icon: <LayoutTemplate size={15} /> },
    { name: "Creation Studio", href: "/create", icon: <Sparkles size={15} /> },
    { name: "My Dashboard", href: "/dashboard", icon: <Layers size={15} /> },
    { name: "Features", href: "/#features", icon: <Compass size={15} /> },
    { name: "Pricing", href: "/#pricing", icon: null },
  ];

  return (
    <header
      className="sticky-top py-2 border-bottom position-relative"
      style={{
        backgroundColor: "rgba(16, 20, 28, 0.94)",
        backdropFilter: "blur(14px)",
        borderColor: "#303947",
        zIndex: 1040,
        boxShadow: scrolled ? "0 8px 30px rgba(0, 0, 0, 0.55)" : "none",
        transition: "all 0.25s ease",
      }}
    >
      <div className="container py-1">
        <div className="d-flex align-items-center justify-content-between">
          {/* Brand Logo */}
          <Link href="/" className="text-white text-decoration-none d-flex align-items-center gap-2 fw-bold fs-4" id="sitegenai-nav-logo">
            <div
              className="rounded-3 p-1 d-flex align-items-center justify-content-center text-dark shadow-sm"
              style={{ background: "linear-gradient(135deg, #A3FF6F 0%, #7CE643 100%)", width: 34, height: 34 }}
            >
              <Sparkles size={18} color="#0B0D12" />
            </div>
            <span>
              SiteGen<span className="sb-text-emerald">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-lg-flex align-items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-3 py-1.5 rounded-pill text-decoration-none small fw-semibold transition-all"
                  style={{
                    color: isActive ? "#A3FF6F" : "#D1D5DB",
                    backgroundColor: isActive ? "rgba(163, 255, 111, 0.12)" : "transparent",
                    border: isActive ? "1px solid rgba(163, 255, 111, 0.35)" : "1px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span className="d-flex align-items-center gap-1.5">
                    {link.icon}
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth & Primary CTAs */}
          <div className="d-none d-lg-flex align-items-center gap-2">
            <Link href="/login" className="sb-btn-outline btn-sm py-1.5 px-3 small btn-magnetic">
              <User size={14} />
              Sign In
            </Link>
            <Link href="/create" className="sb-btn-primary btn-sm py-1.5 px-3.5 small btn-magnetic" id="nav-cta-create">
              Start Creating
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="btn btn-sm d-lg-none text-white border"
            style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            id="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="d-lg-none pt-3 pb-3 border-top mt-2" style={{ borderColor: "#303947" }}>
            <div className="d-flex flex-column gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="py-2 px-3 rounded-3 text-decoration-none small fw-semibold"
                  style={{
                    color: pathname === link.href ? "#A3FF6F" : "#F1F5F9",
                    backgroundColor: pathname === link.href ? "rgba(163, 255, 111, 0.12)" : "rgba(255, 255, 255, 0.03)",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="d-flex align-items-center gap-2">
                    {link.icon}
                    {link.name}
                  </span>
                </Link>
              ))}
              <div className="d-flex gap-2 pt-3 border-top mt-2" style={{ borderColor: "#303947" }}>
                <Link
                  href="/login"
                  className="sb-btn-outline btn-sm w-50 justify-content-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/create"
                  className="sb-btn-primary btn-sm w-50 justify-content-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Creating
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
