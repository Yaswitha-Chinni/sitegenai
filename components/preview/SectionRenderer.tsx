"use client";

import React, { useState } from "react";
import { WebsiteSection, ProjectTheme } from "@/types/project";
import {
  Sparkles,
  ArrowRight,
  Check,
  Star,
  Play,
  Eye,
  Coffee,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Droplet,
} from "lucide-react";

interface SectionRendererProps {
  sections: WebsiteSection[];
  theme: ProjectTheme;
  selectedSectionId?: string;
  onSelectSection?: (id: string) => void;
  isEditableCanvas?: boolean;
}

export default function SectionRenderer({
  sections,
  theme,
  selectedSectionId,
  onSelectSection,
  isEditableCanvas = false,
}: SectionRendererProps) {
  const [activeTabMoment, setActiveTabMoment] = useState<string>("latte");

  const visibleSections = sections.filter((s) => s.visible);

  const getPaddingClass = (paddingY: string) => {
    switch (paddingY) {
      case "sm": return "py-3";
      case "md": return "py-4";
      case "lg": return "py-5";
      case "xl": return "py-5 my-3";
      default: return "py-5";
    }
  };

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case "center": return "text-center justify-content-center";
      case "right": return "text-end justify-content-end";
      default: return "text-start justify-content-start";
    }
  };

  return (
    <div
      className="website-canvas-root w-100 bg-white"
      style={{
        fontFamily: theme.fontFamily || "inherit",
        color: "#172033",
      }}
    >
      {visibleSections.map((sec) => {
        const isSelected = selectedSectionId === sec.id;
        const { content, style } = sec;
        const alignClass = getAlignmentClass(style.alignment);
        const padClass = getPaddingClass(style.paddingY);

        return (
          <div
            key={sec.id}
            id={sec.id}
            className={`editor-canvas-section ${isSelected ? "is-selected" : ""}`}
            onClick={(e) => {
              if (isEditableCanvas && onSelectSection) {
                e.stopPropagation();
                onSelectSection(sec.id);
              }
            }}
            style={{
              backgroundColor: style.backgroundColor || "#FFFFFF",
              color: style.textColor || "#172033",
            }}
          >
            {isEditableCanvas && isSelected && (
              <span className="section-action-tag">
                Selected: {sec.name}
              </span>
            )}

            {/* 1. HEADER */}
            {sec.type === "header" && (
              <header className={`container ${padClass}`}>
                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="p-2 rounded-2 text-white"
                      style={{ backgroundColor: theme.primaryColor || "#356DFF" }}
                    >
                      <Sparkles size={18} />
                    </div>
                    <span className="fw-bold fs-5 tracking-tight">{content.title || "Brand Name"}</span>
                  </div>
                  <nav className="d-none d-md-flex align-items-center gap-4">
                    <span className="text-secondary small fw-medium">Home</span>
                    <span className="text-secondary small fw-medium">Story</span>
                    <span className="text-secondary small fw-medium">Products</span>
                    <span className="text-secondary small fw-medium">Journal</span>
                  </nav>
                  <div>
                    {content.buttonText && (
                      <button
                        className="btn btn-sm text-white fw-semibold px-3 py-2"
                        style={{ backgroundColor: theme.primaryColor || "#356DFF", borderRadius: 8 }}
                      >
                        {content.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </header>
            )}

            {/* 2. HERO */}
            {sec.type === "hero" && (
              <section className={`container ${padClass}`}>
                <div className={`row align-items-center ${style.alignment === "center" ? "justify-content-center text-center" : ""}`}>
                  <div className={content.videoUrl ? "col-12 col-lg-7" : "col-12 col-lg-9"}>
                    {content.badge && (
                      <div className="mb-3">
                        <span
                          className="sg-badge"
                          style={{
                            backgroundColor: "rgba(53, 109, 255, 0.08)",
                            color: theme.primaryColor || "#356DFF",
                            border: `1px solid ${theme.primaryColor}30`,
                          }}
                        >
                          <Sparkles size={13} />
                          {content.badge}
                        </span>
                      </div>
                    )}
                    <h1 className="display-4 fw-extrabold mb-3" style={{ letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                      {content.title}
                    </h1>
                    {content.subtitle && (
                      <h4 className="fw-medium mb-3 text-secondary" style={{ fontSize: "1.25rem" }}>
                        {content.subtitle}
                      </h4>
                    )}
                    {content.description && (
                      <p className="lead mb-4 text-secondary mx-auto" style={{ maxWidth: style.alignment === "center" ? "700px" : "100%" }}>
                        {content.description}
                      </p>
                    )}
                    <div className={`d-flex flex-wrap gap-3 mb-4 ${alignClass}`}>
                      {content.buttonText && (
                        <button
                          className="btn text-white fw-semibold px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                          style={{ backgroundColor: theme.primaryColor || "#356DFF", borderRadius: 8 }}
                        >
                          {content.buttonText}
                          <ArrowRight size={16} />
                        </button>
                      )}
                      {content.secondaryButtonText && (
                        <button
                          className="btn btn-outline-secondary fw-semibold px-4 py-2"
                          style={{ borderRadius: 8 }}
                        >
                          {content.secondaryButtonText}
                        </button>
                      )}
                    </div>

                    {content.items && content.items.length > 0 && (
                      <div className={`d-flex flex-wrap gap-4 pt-3 border-top ${alignClass}`}>
                        {content.items.map((item, idx) => (
                          <div key={idx} className="d-flex align-items-center gap-2">
                            <CheckCircle2 size={16} style={{ color: theme.primaryColor }} />
                            <span className="small fw-semibold">{item.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {content.videoUrl && (
                    <div className="col-12 col-lg-5 mt-4 mt-lg-0">
                      <div className="position-relative rounded-4 overflow-hidden shadow-lg border" style={{ backgroundColor: "#000" }}>
                        <video
                          src={content.videoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-100 d-block"
                          style={{ maxHeight: "380px", objectFit: "cover" }}
                        />
                        <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}>
                          <span className="badge bg-white text-dark small fw-medium">
                            <Droplet size={12} className="me-1 text-primary" />
                            Cold-Pressed HD Showcase
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 3. STORY / SPLIT */}
            {sec.type === "story" && (
              <section className={`container ${padClass}`}>
                <div className="row align-items-center g-5">
                  {content.videoUrl && (
                    <div className="col-12 col-lg-6">
                      <div className="rounded-4 overflow-hidden shadow border position-relative" style={{ backgroundColor: "#000" }}>
                        <video
                          src={content.videoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-100 d-block"
                          style={{ maxHeight: "360px", objectFit: "cover" }}
                        />
                      </div>
                    </div>
                  )}
                  <div className={content.videoUrl ? "col-12 col-lg-6" : "col-12"}>
                    {content.badge && (
                      <span className="sg-badge sg-badge-primary mb-3">
                        {content.badge}
                      </span>
                    )}
                    <h2 className="display-6 fw-bold mb-3">{content.title}</h2>
                    <p className="lead text-secondary mb-4">{content.description}</p>
                    
                    {content.items && content.items.length > 0 && (
                      <div className="row g-3 mb-4">
                        {content.items.map((stat, idx) => (
                          <div key={idx} className="col-6">
                            <div className="p-3 rounded-3 bg-white border shadow-sm">
                              <div className="fs-3 fw-bold" style={{ color: theme.primaryColor }}>
                                {stat.stat || "100%"}
                              </div>
                              <div className="small fw-semibold text-dark">{stat.title}</div>
                              <div className="small text-muted">{stat.label || stat.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {content.buttonText && (
                      <button
                        className="btn btn-outline-primary fw-semibold px-4 py-2"
                        style={{ borderRadius: 8, borderColor: theme.primaryColor, color: theme.primaryColor }}
                      >
                        {content.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* 4. TABS / MOMENTS */}
            {sec.type === "tabs" && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-4">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  <h2 className="display-6 fw-bold mb-2">{content.title}</h2>
                  <p className="text-secondary">{content.description}</p>
                </div>

                <div className="row align-items-center g-4">
                  <div className="col-12 col-lg-6">
                    <div className="d-flex flex-column gap-2">
                      {content.items?.map((item, idx) => {
                        const tabKey = item.title.toLowerCase();
                        const isActive = activeTabMoment === tabKey || (idx === 0 && !activeTabMoment);
                        return (
                          <div
                            key={idx}
                            onClick={() => setActiveTabMoment(tabKey)}
                            className={`p-3 rounded-3 border transition-all cursor-pointer ${
                              isActive ? "bg-primary-subtle border-primary shadow-sm" : "bg-white"
                            }`}
                            style={{ cursor: "pointer" }}
                          >
                            <h5 className="fw-bold mb-1 fs-6 d-flex align-items-center justify-content-between">
                              <span>{item.title}</span>
                              {isActive && <Check size={16} className="text-primary" />}
                            </h5>
                            <p className="mb-0 small text-secondary">{item.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {content.videoUrl && (
                    <div className="col-12 col-lg-6">
                      <div className="rounded-4 overflow-hidden shadow border" style={{ backgroundColor: "#000" }}>
                        <video
                          src={content.videoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-100 d-block"
                          style={{ maxHeight: "380px", objectFit: "cover" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 5. PRODUCT / BENEFITS */}
            {sec.type === "product" && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  <h2 className="display-6 fw-bold mb-3">{content.title}</h2>
                  <p className="lead text-secondary">{content.description}</p>
                </div>
                <div className="row g-4 align-items-center">
                  {content.videoUrl && (
                    <div className="col-12 col-lg-6">
                      <div className="rounded-4 overflow-hidden shadow-lg border" style={{ backgroundColor: "#000" }}>
                        <video
                          src={content.videoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-100 d-block"
                          style={{ maxHeight: "360px", objectFit: "cover" }}
                        />
                      </div>
                    </div>
                  )}
                  <div className={content.videoUrl ? "col-12 col-lg-6" : "col-12"}>
                    <div className="d-flex flex-column gap-3">
                      {content.items?.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-3 bg-white border shadow-sm">
                          <h5 className="fw-bold mb-1 fs-6 d-flex align-items-center gap-2">
                            <span className="p-1 rounded bg-primary-subtle text-primary">
                              <Droplet size={14} />
                            </span>
                            {item.title}
                          </h5>
                          <p className="small text-secondary mb-0">{item.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex gap-3 mt-4">
                      {content.buttonText && (
                        <button
                          className="btn text-white fw-semibold px-4 py-2"
                          style={{ backgroundColor: theme.primaryColor, borderRadius: 8 }}
                        >
                          {content.buttonText}
                        </button>
                      )}
                      {content.secondaryButtonText && (
                        <button className="btn btn-outline-secondary fw-semibold px-4 py-2" style={{ borderRadius: 8 }}>
                          {content.secondaryButtonText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 6. PROMO / BANNER */}
            {sec.type === "promo" && (
              <section className={`container ${padClass}`}>
                <div
                  className="p-5 rounded-4 position-relative overflow-hidden shadow-md text-white"
                  style={{
                    backgroundColor: style.backgroundColor || theme.primaryColor || "#087FE5",
                  }}
                >
                  <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
                    <div className="col-12 col-lg-7">
                      {content.badge && <span className="badge bg-white text-primary mb-3 px-3 py-2">{content.badge}</span>}
                      <h2 className="display-6 fw-bold mb-3">{content.title}</h2>
                      <p className="lead opacity-90 mb-4">{content.description}</p>
                      <div className="d-flex flex-wrap gap-3">
                        {content.buttonText && (
                          <button className="btn btn-light text-primary fw-bold px-4 py-2 shadow-sm" style={{ borderRadius: 8 }}>
                            {content.buttonText}
                          </button>
                        )}
                        {content.secondaryButtonText && (
                          <button className="btn btn-outline-light fw-bold px-4 py-2" style={{ borderRadius: 8 }}>
                            {content.secondaryButtonText}
                          </button>
                        )}
                      </div>
                    </div>
                    {content.items && (
                      <div className="col-12 col-lg-5 mt-4 mt-lg-0">
                        <div className="p-3 rounded-3 bg-white bg-opacity-10 border border-white border-opacity-20 backdrop-blur">
                          <div className="small text-white-50 text-uppercase fw-bold mb-2">Available At Leading Retailers</div>
                          <div className="d-flex flex-wrap gap-2">
                            {content.items.map((r, idx) => (
                              <span key={idx} className="badge bg-white text-dark px-3 py-2 fw-semibold">
                                {r.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* 7. RECIPES / CARDS */}
            {sec.type === "recipes" && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  <h2 className="display-6 fw-bold mb-3">{content.title}</h2>
                  <p className="text-secondary lead">{content.description}</p>
                </div>
                <div className="row g-4">
                  {content.items?.map((card, idx) => (
                    <div key={idx} className="col-12 col-md-4">
                      <div className="card h-100 border rounded-4 shadow-sm overflow-hidden bg-white">
                        <div className="p-4 bg-light border-bottom text-center">
                          <span className="badge bg-primary-subtle text-primary mb-2">{card.tag || "Recipe"}</span>
                          <h5 className="fw-bold mb-0">{card.title}</h5>
                        </div>
                        <div className="card-body p-4 d-flex flex-column justify-content-between">
                          <p className="small text-secondary mb-3">{card.description}</p>
                          <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                            <span className="badge bg-light text-secondary border">{card.label || "Approved"}</span>
                            <span className="small text-primary fw-semibold d-flex align-items-center gap-1">
                              View Notes <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 8. FEATURES */}
            {sec.type === "features" && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  <h2 className="display-6 fw-bold mb-3">{content.title}</h2>
                  <p className="text-secondary lead">{content.description}</p>
                </div>
                <div className="row g-4">
                  {content.items?.map((item, idx) => (
                    <div key={idx} className="col-12 col-md-4">
                      <div className="p-4 rounded-4 bg-white border shadow-sm h-100">
                        <div
                          className="p-3 rounded-3 text-white mb-3 d-inline-flex"
                          style={{ backgroundColor: theme.primaryColor || "#356DFF" }}
                        >
                          <Sparkles size={20} />
                        </div>
                        <h5 className="fw-bold mb-2">{item.title}</h5>
                        <p className="small text-secondary mb-0">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TESTIMONIALS */}
            {sec.type === "testimonials" && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  <h2 className="display-6 fw-bold mb-3">{content.title || "Client Testimonials"}</h2>
                  <p className="text-secondary lead">{content.description || "Trusted by forward-thinking teams worldwide."}</p>
                </div>
                <div className="row g-4">
                  {(content.items && content.items.length > 0 ? content.items : [
                    { title: "Alex Rivera", role: "Creative Director", description: "The attention to detail and velocity of iteration transformed how we launch client products." },
                    { title: "Sophia Chen", role: "Founder, Bloom Studio", description: "Flawless aesthetics and rock-solid performance right out of the box." },
                    { title: "Marcus Vance", role: "Product Lead", description: "SiteGenAI helped us ship our high-converting showcase in hours rather than months." }
                  ]).map((t, idx) => (
                    <div key={idx} className="col-12 col-md-4">
                      <div className="p-4 rounded-4 bg-white border shadow-sm h-100 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex gap-1 text-warning mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                            ))}
                          </div>
                          <p className="text-secondary mb-4 italic" style={{ fontSize: "0.95rem" }}>
                            "{t.description}"
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-3 pt-3 border-top">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{ width: 38, height: 38, backgroundColor: theme.primaryColor || "#356DFF", fontSize: "0.85rem" }}
                          >
                            {t.title ? t.title.charAt(0) : "U"}
                          </div>
                          <div>
                            <div className="fw-bold small">{t.title}</div>
                            <div className="text-muted" style={{ fontSize: "0.78rem" }}>{t.role || t.label || "Verified Client"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* GALLERY & SHOWCASE */}
            {(sec.type === "gallery" || sec.type === "showcase") && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  <h2 className="display-6 fw-bold mb-3">{content.title || "Curated Showcase & Gallery"}</h2>
                  <p className="text-secondary lead">{content.description || "Explore our latest projects and visual craft."}</p>
                </div>
                <div className="row g-4">
                  {(content.items && content.items.length > 0 ? content.items : [
                    { title: "Harmonic Architecture", description: "Spatial design commission", tag: "Spatial", label: "Featured" },
                    { title: "Artisanal Formulation", description: "Direct-to-consumer botanicals", tag: "Packaging", label: "Award" },
                    { title: "Kinetic Brand Identity", description: "Dynamic visual system", tag: "Identity", label: "2026" }
                  ]).map((item, idx) => (
                    <div key={idx} className="col-12 col-md-4">
                      <div className="card h-100 rounded-4 overflow-hidden border shadow-sm bg-white">
                        <div
                          className="p-5 d-flex align-items-center justify-content-center text-white position-relative"
                          style={{
                            minHeight: 180,
                            background: `linear-gradient(135deg, ${theme.primaryColor || "#356DFF"} 0%, ${theme.secondaryColor || "#071B32"} 100%)`
                          }}
                        >
                          <Sparkles size={28} className="opacity-75" />
                          {item.label && (
                            <span className="position-absolute top-0 end-0 m-3 badge bg-white text-dark shadow-xs">
                              {item.label}
                            </span>
                          )}
                        </div>
                        <div className="card-body p-4">
                          <span className="badge bg-light text-secondary border mb-2">{item.tag || "Showcase"}</span>
                          <h5 className="fw-bold mb-1">{item.title}</h5>
                          <p className="small text-secondary mb-0">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {sec.type === "faq" && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  <h2 className="display-6 fw-bold mb-3">{content.title || "Frequently Asked Questions"}</h2>
                  <p className="text-secondary lead">{content.description || "Everything you need to know about our offerings."}</p>
                </div>
                <div className="max-w-700 mx-auto d-flex flex-column gap-3">
                  {(content.items && content.items.length > 0 ? content.items : [
                    { title: "What makes your approach unique?", description: "We blend rapid artificial intelligence blueprints with artisanal visual engineering to deliver bespoke, production-ready experiences." },
                    { title: "Can I customize every design token?", description: "Yes. Every palette shade, typography hierarchy, section layout, and animation trigger can be adjusted directly in real time." },
                    { title: "How does export and standalone publishing work?", description: "You can download the full standalone code package at any moment without proprietary locks or recurring fees." }
                  ]).map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-3 border bg-white shadow-xs">
                      <h5 className="fw-bold mb-2 fs-6 d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} style={{ color: theme.primaryColor || "#356DFF" }} />
                        {faq.title}
                      </h5>
                      <p className="small text-secondary mb-0 ps-4">{faq.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 9. CTA */}
            {sec.type === "cta" && (
              <section className={`container ${padClass}`}>
                <div
                  className="p-5 rounded-4 text-center text-white shadow-lg"
                  style={{ backgroundColor: style.backgroundColor || theme.primaryColor || "#356DFF" }}
                >
                  <h2 className="display-6 fw-bold mb-3">{content.title}</h2>
                  <p className="lead opacity-90 mb-4 mx-auto" style={{ maxWidth: 650 }}>
                    {content.description}
                  </p>
                  {content.buttonText && (
                    <button className="btn btn-light text-primary fw-bold px-4 py-2 shadow-sm" style={{ borderRadius: 8 }}>
                      {content.buttonText}
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* 10. FOOTER */}
            {sec.type === "footer" && (
              <footer className={`container ${padClass} border-top mt-5`}>
                <div className="row g-4 justify-content-between">
                  <div className="col-12 col-md-5">
                    <h5 className="fw-bold mb-2">{content.title}</h5>
                    <p className="small text-secondary mb-3">{content.description}</p>
                    <small className="text-muted">&copy; {new Date().getFullYear()} All rights reserved.</small>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="row">
                      {content.footerLinks?.map((col, idx) => (
                        <div key={idx} className="col-6">
                          <h6 className="fw-bold small mb-2">{col.title}</h6>
                          <ul className="list-unstyled d-flex flex-column gap-1 small text-secondary">
                            {col.links.map((link, lIdx) => (
                              <li key={lIdx}>{link}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </footer>
            )}
          </div>
        );
      })}
    </div>
  );
}
