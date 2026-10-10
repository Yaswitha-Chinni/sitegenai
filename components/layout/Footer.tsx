"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Heart } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    setError("");
    setSubscribed(true);
  };

  return (
    <footer
      className="mt-auto border-top position-relative"
      style={{
        backgroundColor: "#10141C",
        borderColor: "#303947",
        color: "#D1D5DB",
      }}
    >
      <div className="container py-5">
        <div className="row g-4 justify-content-between">
          {/* Brand Info */}
          <div className="col-12 col-lg-4">
            <Link href="/" className="d-flex align-items-center gap-2 text-white mb-3 text-decoration-none">
              <div
                className="rounded-3 p-1 d-flex align-items-center justify-content-center text-dark shadow-sm"
                style={{ background: "linear-gradient(135deg, #A3FF6F 0%, #7CE643 100%)", width: 34, height: 34 }}
              >
                <Sparkles size={18} color="#0B0D12" />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.35rem" }}>
                SiteGen<span className="sb-text-emerald">AI</span>
              </span>
            </Link>
            <p style={{ color: "#D1D5DB", fontSize: "0.95rem", maxWidth: "340px", lineHeight: 1.6 }}>
              Imagine it. Design it. Make it yours. The next-generation AI website platform combining rapid blueprint synthesis with visual craftsmanship.
            </p>
            <div className="d-flex align-items-center gap-2 mt-3">
              <span
                className="badge rounded-pill px-3 py-1.5 fw-semibold"
                style={{
                  backgroundColor: "rgba(163, 255, 111, 0.15)",
                  color: "#A3FF6F",
                  border: "1px solid rgba(163, 255, 111, 0.35)",
                  fontSize: "0.78rem",
                }}
              >
                Full-Stack AI Builder
              </span>
              <span
                className="badge rounded-pill px-3 py-1.5 fw-semibold"
                style={{
                  backgroundColor: "#202938",
                  color: "#BFC7D2",
                  border: "1px solid #303947",
                  fontSize: "0.78rem",
                }}
              >
                Bootstrap 5.3 &bull; Motion
              </span>
            </div>
          </div>

          {/* Product links */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Product</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.92rem" }}>
              <li><Link href="/create" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>Creation Studio</Link></li>
              <li><Link href="/templates" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>Template Gallery</Link></li>
              <li><Link href="/dashboard" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>User Dashboard</Link></li>
              <li><Link href="/admin" className="text-decoration-none d-flex align-items-center gap-1.5" style={{ color: "#F59E0B" }}>Admin Portal <span className="badge bg-warning text-dark" style={{ fontSize: "0.62rem" }}>Dev</span></Link></li>
              <li><Link href="/templates/w1/index.html" target="_blank" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>COCO POUR (W1)</Link></li>
              <li><Link href="/templates/w2/index.html" target="_blank" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>BRUVA Coffee (W2)</Link></li>
              <li><Link href="/#pricing" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Templates */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Showcase</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.92rem" }}>
              <li><Link href="/#our-work" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>Featured Works</Link></li>
              <li><Link href="/templates" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>E-commerce Stores</Link></li>
              <li><Link href="/templates" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>SaaS Landing Pages</Link></li>
              <li><Link href="/templates" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>Creative Portfolios</Link></li>
              <li><Link href="/templates" className="text-decoration-none hover-text-white" style={{ color: "#D1D5DB" }}>Restaurant &amp; Dining</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-12 col-md-6 col-lg-3">
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Stay Inspired</h6>
            <p style={{ color: "#D1D5DB", fontSize: "0.9rem" }}>
              Get weekly design teardowns, UI components, and AI website generation blueprints.
            </p>
            {subscribed ? (
              <div
                className="p-3 rounded-3 border"
                style={{ backgroundColor: "rgba(163, 255, 111, 0.12)", borderColor: "rgba(163, 255, 111, 0.35)" }}
              >
                <div className="d-flex align-items-center gap-2 fw-semibold mb-1" style={{ fontSize: "0.92rem", color: "#A3FF6F" }}>
                  <CheckCircle2 size={16} />
                  Subscription Confirmed!
                </div>
                <small style={{ color: "#D1D5DB" }}>You are on the preview dispatch list.</small>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate>
                <div className="input-group mb-2">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    style={{
                      backgroundColor: "#151A24",
                      borderColor: "#303947",
                      color: "#FFFFFF",
                      fontSize: "0.9rem",
                    }}
                    aria-label="Email address for newsletter"
                  />
                  <button className="sb-btn-primary px-3" type="submit" aria-label="Subscribe to newsletter">
                    <ArrowRight size={16} />
                  </button>
                </div>
                {error && <small className="text-danger fw-semibold">{error}</small>}
              </form>
            )}
          </div>
        </div>

        <div
          className="border-top mt-5 pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3"
          style={{ borderColor: "#303947", fontSize: "0.88rem", color: "#BFC7D2" }}
        >
          <div>
            &copy; {new Date().getFullYear()} SiteGenAI. All rights reserved. Built with precision.
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link href="/#how-it-works" style={{ color: "#D1D5DB", textDecoration: "none" }} className="hover-text-white">How It Works</Link>
            <span>&bull;</span>
            <Link href="/login" style={{ color: "#D1D5DB", textDecoration: "none" }} className="hover-text-white">Sign In</Link>
            <span>&bull;</span>
            <span className="d-inline-flex align-items-center gap-1">
              Crafted with <Heart size={13} className="text-danger fill-danger" /> for creators
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
