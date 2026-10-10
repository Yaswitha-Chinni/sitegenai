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
    <footer className="mt-auto border-top" style={{ backgroundColor: "#0F172A", color: "#E2E8F0" }}>
      <div className="container py-5">
        <div className="row g-4 justify-content-between">
          {/* Brand Info */}
          <div className="col-12 col-lg-4">
            <Link href="/" className="d-flex align-items-center gap-2 text-white mb-3 text-decoration-none">
              <div className="sg-logo-icon" style={{ width: 34, height: 34 }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontFamily: "var(--sg-font-heading)", fontWeight: 800, fontSize: "1.35rem" }}>
                SiteGen<span style={{ color: "var(--sg-primary)" }}>AI</span>
              </span>
            </Link>
            <p style={{ color: "#94A3B8", fontSize: "0.95rem", maxWidth: "340px" }}>
              Imagine it. Design it. Make it yours. The next-generation AI website platform combining rapid blueprint synthesis with visual craftsmanship.
            </p>
            <div className="d-flex align-items-center gap-2 mt-3">
              <span className="sg-badge sg-badge-primary">Full-Stack AI Builder</span>
              <span className="sg-badge sg-badge-muted" style={{ color: "#94A3B8", borderColor: "#334155" }}>Bootstrap 5.3</span>
            </div>
          </div>

          {/* Product links */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-white fw-bold mb-3">Product</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link href="/create" className="text-decoration-none" style={{ color: "#94A3B8" }}>Creation Studio</Link></li>
              <li><Link href="/templates" className="text-decoration-none" style={{ color: "#94A3B8" }}>Template Gallery</Link></li>
              <li><Link href="/dashboard" className="text-decoration-none" style={{ color: "#94A3B8" }}>User Dashboard</Link></li>
              <li><Link href="/admin" className="text-decoration-none text-warning d-flex align-items-center gap-1">Admin Portal <span className="badge bg-warning text-dark" style={{ fontSize: "0.65rem" }}>Dev</span></Link></li>
              <li><Link href="/editor/proj-w1-cocopour" className="text-decoration-none" style={{ color: "#94A3B8" }}>COCO POUR Editor</Link></li>
              <li><Link href="/#pricing" className="text-decoration-none" style={{ color: "#94A3B8" }}>Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-white fw-bold mb-3">Templates</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link href="/templates?cat=Restaurant" className="text-decoration-none" style={{ color: "#94A3B8" }}>Restaurant & Food</Link></li>
              <li><Link href="/templates?cat=SaaS" className="text-decoration-none" style={{ color: "#94A3B8" }}>SaaS & Tech</Link></li>
              <li><Link href="/templates?cat=Portfolio" className="text-decoration-none" style={{ color: "#94A3B8" }}>Creative Portfolios</Link></li>
              <li><Link href="/templates?cat=Business" className="text-decoration-none" style={{ color: "#94A3B8" }}>Corporate Advisory</Link></li>
              <li><Link href="/templates?cat=Landing Page" className="text-decoration-none" style={{ color: "#94A3B8" }}>Product Launch</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="col-12 col-md-6 col-lg-3">
            <h6 className="text-white fw-bold mb-3">Stay Informed</h6>
            <p style={{ color: "#94A3B8", fontSize: "0.88rem" }}>
              Receive monthly design patterns, new template drops, and frontend architecture updates.
            </p>
            {subscribed ? (
              <div className="p-3 rounded border" style={{ backgroundColor: "#1E293B", borderColor: "#334155" }}>
                <div className="d-flex align-items-center gap-2 text-success fw-semibold mb-1" style={{ fontSize: "0.9rem" }}>
                  <CheckCircle2 size={16} />
                  Subscription Confirmed!
                </div>
                <small style={{ color: "#94A3B8" }}>You are on the preview dispatch list.</small>
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
                      backgroundColor: "#1E293B",
                      borderColor: "#334155",
                      color: "#FFFFFF",
                      fontSize: "0.9rem",
                    }}
                    aria-label="Email address for newsletter"
                  />
                  <button className="btn btn-sg-primary btn-sg-sm" type="submit" aria-label="Subscribe to newsletter">
                    <ArrowRight size={16} />
                  </button>
                </div>
                {error && <small className="text-danger">{error}</small>}
              </form>
            )}
          </div>
        </div>

        <div className="border-top mt-5 pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3" style={{ borderColor: "#334155", fontSize: "0.85rem", color: "#64748B" }}>
          <div>
            &copy; {new Date().getFullYear()} SiteGenAI. All rights reserved. Built with precision.
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link href="/#faq" style={{ color: "#64748B" }}>FAQ</Link>
            <span>&bull;</span>
            <Link href="/login" style={{ color: "#64748B" }}>Sign In</Link>
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
