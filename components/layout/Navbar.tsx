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
    { name: "Explore Templates", href: "/templates", icon: <LayoutTemplate size={16} /> },
    { name: "Creation Studio", href: "/create", icon: <Sparkles size={16} /> },
    { name: "My Dashboard", href: "/dashboard", icon: <Layers size={16} /> },
    { name: "Features", href: "/#features", icon: <Compass size={16} /> },
    { name: "Pricing", href: "/#pricing", icon: null },
  ];

  return (
    <header className={`sg-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container py-2">
        <div className="d-flex align-items-center justify-content-between">
          {/* Brand Logo */}
          <Link href="/" className="sg-brand-logo" id="sitegenai-nav-logo">
            <div className="sg-logo-icon">
              <Sparkles size={20} />
            </div>
            <span>SiteGen<span style={{ color: "var(--sg-primary)" }}>AI</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-lg-flex align-items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`sg-nav-link ${isActive ? "active" : ""}`}
                >
                  <span className="d-flex align-items-center gap-1">
                    {link.icon}
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth & Primary CTAs */}
          <div className="d-none d-lg-flex align-items-center gap-2">
            <Link href="/login" className="btn btn-sg-outline btn-sg-sm">
              <User size={15} />
              Log In
            </Link>
            <Link href="/create" className="btn btn-sg-primary btn-sg-sm" id="nav-cta-create">
              Start Creating
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="btn btn-light d-lg-none border"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            id="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="d-lg-none pt-3 pb-3 border-top mt-2 animate-fadeIn">
            <div className="d-flex flex-column gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`sg-nav-link ${pathname === link.href ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="d-flex align-items-center gap-2">
                    {link.icon}
                    {link.name}
                  </span>
                </Link>
              ))}
              <div className="d-flex flex-column gap-2 pt-3 border-top mt-2">
                <Link
                  href="/login"
                  className="btn btn-sg-outline w-100 justify-content-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} />
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-light border w-100 justify-content-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href="/create"
                  className="btn btn-sg-primary w-100 justify-content-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Creating
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
