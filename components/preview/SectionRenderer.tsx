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
  Flame,
  Zap,
} from "lucide-react";
import { renderRegisteredIcon } from "@/lib/icons/iconRegistry";

export interface SelectedElementInfo {
  sectionId: string;
  elementId: string;
  elementType:
    | "heading"
    | "subheading"
    | "paragraph"
    | "button"
    | "secondary-button"
    | "badge"
    | "image"
    | "icon"
    | "item"
    | "card"
    | "container";
  itemIndex?: number;
}

interface SectionRendererProps {
  sections: WebsiteSection[];
  theme: ProjectTheme;
  selectedSectionId?: string;
  onSelectSection?: (id: string) => void;
  selectedElement?: SelectedElementInfo | null;
  onSelectElement?: (info: SelectedElementInfo) => void;
  onInlineTextChange?: (sectionId: string, elementId: string, newText: string, itemIndex?: number) => void;
  isEditableCanvas?: boolean;
}

export default function SectionRenderer({
  sections,
  theme,
  selectedSectionId,
  onSelectSection,
  selectedElement,
  onSelectElement,
  onInlineTextChange,
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

  const resolveCustomStyle = (sec: WebsiteSection, elementId: string): React.CSSProperties => {
    const custom = sec.elementStyles?.[elementId];
    if (!custom) return {};
    const s: React.CSSProperties = {};
    if (custom.fontSize !== undefined) {
      s.fontSize = typeof custom.fontSize === "number" ? `${custom.fontSize}px` : custom.fontSize;
    }
    if (custom.fontWeight) s.fontWeight = custom.fontWeight;
    if (custom.color) s.color = custom.color;
    if (custom.backgroundColor) s.backgroundColor = custom.backgroundColor;
    if (custom.fontFamily) s.fontFamily = custom.fontFamily;
    if (custom.textAlign) s.textAlign = custom.textAlign;
    if (custom.lineHeight !== undefined) s.lineHeight = custom.lineHeight;
    if (custom.letterSpacing) s.letterSpacing = custom.letterSpacing;
    if (custom.textTransform) s.textTransform = custom.textTransform;
    if (custom.textDecoration) s.textDecoration = custom.textDecoration;
    if (custom.width) s.width = custom.width;
    if (custom.maxWidth) s.maxWidth = custom.maxWidth;
    if (custom.height) s.height = custom.height;
    if (custom.minHeight) s.minHeight = custom.minHeight;
    if (custom.padding) s.padding = custom.padding;
    if (custom.margin) s.margin = custom.margin;
    if (custom.borderRadius) s.borderRadius = custom.borderRadius;
    if (custom.borderColor) s.borderColor = custom.borderColor;
    if (custom.borderWidth) s.borderWidth = custom.borderWidth;
    if (custom.borderStyle) s.borderStyle = custom.borderStyle;
    if (custom.boxShadow) s.boxShadow = custom.boxShadow;
    if (custom.opacity !== undefined) s.opacity = custom.opacity;
    if (custom.aspectRatio) s.aspectRatio = custom.aspectRatio;
    return s;
  };

  const renderEl = ({
    key,
    sec,
    elementId,
    elementType,
    label,
    itemIndex,
    children,
    className = "",
    style = {},
    as: Component = "div",
    isResizable = false,
  }: {
    key?: React.Key;
    sec: WebsiteSection;
    elementId: string;
    elementType: SelectedElementInfo["elementType"];
    label: string;
    itemIndex?: number;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    as?: any;
    isResizable?: boolean;
  }) => {
    const isElSelected =
      isEditableCanvas &&
      selectedElement?.sectionId === sec.id &&
      selectedElement?.elementId === elementId;

    const customStyle = resolveCustomStyle(sec, elementId);
    const elementCustomStyle = sec.elementStyles?.[elementId];
    const mergedStyle = { ...style, ...customStyle };

    const handleClick = (e: React.MouseEvent) => {
      if (!isEditableCanvas) return;
      e.stopPropagation();
      e.preventDefault();
      onSelectSection?.(sec.id);
      onSelectElement?.({
        sectionId: sec.id,
        elementId,
        elementType,
        itemIndex,
      });
    };

    const isText = ["heading", "subheading", "paragraph", "badge", "button", "secondary-button"].includes(elementType);

    return (
      <Component
        key={key}
        data-element-id={elementId}
        data-element-type={elementType}
        className={`${className} ${isEditableCanvas ? "editor-editable-element" : ""} ${isElSelected ? "is-element-selected" : ""}`}
        style={mergedStyle}
        onClick={handleClick}
        contentEditable={isEditableCanvas && isElSelected && isText}
        suppressContentEditableWarning={true}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          if (isEditableCanvas && isText && onInlineTextChange) {
            onInlineTextChange(sec.id, elementId, e.currentTarget.innerText.trim(), itemIndex);
          }
        }}
      >
        {isEditableCanvas && isElSelected && (
          <>
            <span className="element-action-tag">{label}</span>
            {isResizable && (
              <>
                <span className="element-resize-handle br"></span>
                <span className="element-resize-handle bl"></span>
              </>
            )}
          </>
        )}
        {elementCustomStyle?.iconName && (
          <span className="me-2 d-inline-flex align-items-center" style={{ color: elementCustomStyle.iconColor || "inherit" }}>
            {renderRegisteredIcon(elementCustomStyle.iconName, { size: elementCustomStyle.iconSize || 18 })}
          </span>
        )}
        {children}
      </Component>
    );
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
        const isSectionSelected = selectedSectionId === sec.id;
        const { content, style } = sec;
        const alignClass = getAlignmentClass(style.alignment);
        const padClass = getPaddingClass(style.paddingY);

        return (
          <div
            key={sec.id}
            id={sec.id}
            className={`editor-canvas-section ${isSectionSelected ? "is-selected" : ""}`}
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
            {isEditableCanvas && isSectionSelected && (
              <span className="section-action-tag">
                Section: {sec.name}
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
                    {renderEl({
                      sec,
                      elementId: `${sec.id}-title`,
                      elementType: "heading",
                      label: "Header Brand",
                      as: "span",
                      className: "fw-bold fs-5 tracking-tight",
                      children: content.title || "Brand Name",
                    })}
                  </div>
                  <nav className="d-none d-md-flex align-items-center gap-4">
                    <span className="text-secondary small fw-medium">Home</span>
                    <span className="text-secondary small fw-medium">Story</span>
                    <span className="text-secondary small fw-medium">Products</span>
                    <span className="text-secondary small fw-medium">Journal</span>
                  </nav>
                  <div>
                    {content.buttonText &&
                      renderEl({
                        sec,
                        elementId: `${sec.id}-button`,
                        elementType: "button",
                        label: "Header Button",
                        as: "button",
                        className: "btn btn-sm text-white fw-semibold px-3 py-2",
                        style: { backgroundColor: theme.primaryColor || "#356DFF", borderRadius: 8 },
                        children: content.buttonText,
                      })}
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
                        {renderEl({
                          sec,
                          elementId: `${sec.id}-badge`,
                          elementType: "badge",
                          label: "Hero Badge",
                          as: "span",
                          className: "sg-badge",
                          style: {
                            backgroundColor: "rgba(53, 109, 255, 0.08)",
                            color: theme.primaryColor || "#356DFF",
                            border: `1px solid ${theme.primaryColor}30`,
                          },
                          children: (
                            <>
                              <Sparkles size={13} className="me-1" />
                              {content.badge}
                            </>
                          ),
                        })}
                      </div>
                    )}
                    {renderEl({
                      sec,
                      elementId: `${sec.id}-title`,
                      elementType: "heading",
                      label: "Hero Heading (H1)",
                      as: "h1",
                      className: "display-4 fw-extrabold mb-3",
                      style: { letterSpacing: "-0.03em", lineHeight: 1.15 },
                      children: content.title,
                    })}
                    {content.subtitle &&
                      renderEl({
                        sec,
                        elementId: `${sec.id}-subtitle`,
                        elementType: "subheading",
                        label: "Hero Subheading",
                        as: "h4",
                        className: "fw-medium mb-3 text-secondary",
                        style: { fontSize: "1.25rem" },
                        children: content.subtitle,
                      })}
                    {content.description &&
                      renderEl({
                        sec,
                        elementId: `${sec.id}-description`,
                        elementType: "paragraph",
                        label: "Hero Paragraph",
                        as: "p",
                        className: "lead mb-4 text-secondary mx-auto",
                        style: { maxWidth: style.alignment === "center" ? "700px" : "100%" },
                        children: content.description,
                      })}
                    <div className={`d-flex flex-wrap gap-3 mb-4 ${alignClass}`}>
                      {content.buttonText &&
                        renderEl({
                          sec,
                          elementId: `${sec.id}-button`,
                          elementType: "button",
                          label: "Primary Button",
                          as: "button",
                          className: "btn text-white fw-semibold px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm",
                          style: { backgroundColor: theme.primaryColor || "#356DFF", borderRadius: 8 },
                          children: (
                            <>
                              {content.buttonText}
                              <ArrowRight size={16} />
                            </>
                          ),
                        })}
                      {content.secondaryButtonText &&
                        renderEl({
                          sec,
                          elementId: `${sec.id}-secondary-button`,
                          elementType: "secondary-button",
                          label: "Secondary Button",
                          as: "button",
                          className: "btn btn-outline-secondary fw-semibold px-4 py-2",
                          style: { borderRadius: 8 },
                          children: content.secondaryButtonText,
                        })}
                    </div>

                    {content.items && content.items.length > 0 && (
                      <div className={`d-flex flex-wrap gap-4 pt-3 border-top ${alignClass}`}>
                        {content.items.map((item, idx) =>
                          renderEl({
                            key: idx,
                            sec,
                            elementId: `${sec.id}-item-${idx}`,
                            elementType: "item",
                            label: `Feature ${idx + 1}`,
                            itemIndex: idx,
                            as: "div",
                            className: "d-flex align-items-center gap-2",
                            children: (
                              <>
                                <CheckCircle2 size={16} style={{ color: theme.primaryColor }} />
                                <span className="small fw-semibold">{item.title}</span>
                              </>
                            ),
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {content.imageUrl && !content.videoUrl && (
                    <div className="col-12 col-lg-5 mt-4 mt-lg-0">
                      {renderEl({
                        sec,
                        elementId: `${sec.id}-image`,
                        elementType: "image",
                        label: "Hero Showcase Image",
                        isResizable: true,
                        as: "div",
                        className: "position-relative rounded-4 overflow-hidden shadow-lg border",
                        style: { backgroundColor: "#04120C", borderColor: "rgba(16, 185, 129, 0.2)" },
                        children: (
                          <>
                            <img
                              src={content.imageUrl}
                              alt={content.title || "Hero showcase"}
                              className="w-100 d-block"
                              style={{
                                maxHeight: "380px",
                                objectFit: (style.imageFit as any) || "cover",
                                objectPosition: style.focalPosition || (content.imageMetadata?.focalPoint ? `${content.imageMetadata.focalPoint.x}% ${content.imageMetadata.focalPoint.y}%` : "center center"),
                              }}
                            />
                            {content.imageMetadata?.photographer && (
                              <div
                                className="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-between align-items-center"
                                style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}
                              >
                                <span className="badge bg-dark bg-opacity-75 text-white-50 small border border-secondary border-opacity-25" style={{ fontSize: "0.68rem" }}>
                                  Photo by {content.imageMetadata.photographer} ({content.imageMetadata.source.toUpperCase()})
                                </span>
                              </div>
                            )}
                          </>
                        ),
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 3. STORY */}
            {sec.type === "story" && (
              <section className={`container ${padClass}`}>
                <div className="row align-items-center g-5">
                  {content.imageUrl && (
                    <div className="col-12 col-lg-6">
                      {renderEl({
                        sec,
                        elementId: `${sec.id}-image`,
                        elementType: "image",
                        label: "Story Image",
                        isResizable: true,
                        as: "div",
                        className: "rounded-4 overflow-hidden shadow border position-relative",
                        style: { backgroundColor: "#04120C" },
                        children: (
                          <>
                            <img
                              src={content.imageUrl}
                              alt={content.title || "Brand Story"}
                              className="w-100 d-block"
                              style={{
                                maxHeight: "360px",
                                objectFit: (style.imageFit as any) || "cover",
                                objectPosition: style.focalPosition || "center center",
                              }}
                            />
                            {content.imageMetadata?.photographer && (
                              <div
                                className="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-between align-items-center"
                                style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}
                              >
                                <span className="badge bg-dark bg-opacity-75 text-white-50 small border border-secondary border-opacity-25" style={{ fontSize: "0.68rem" }}>
                                  Photo by {content.imageMetadata.photographer} ({content.imageMetadata.source.toUpperCase()})
                                </span>
                              </div>
                            )}
                          </>
                        ),
                      })}
                    </div>
                  )}
                  <div className={content.imageUrl ? "col-12 col-lg-6" : "col-12"}>
                    {content.badge && (
                      <span className="sg-badge sg-badge-primary mb-3">
                        {content.badge}
                      </span>
                    )}
                    {renderEl({
                      sec,
                      elementId: `${sec.id}-title`,
                      elementType: "heading",
                      label: "Story Title",
                      as: "h2",
                      className: "display-6 fw-bold mb-3",
                      children: content.title,
                    })}
                    {renderEl({
                      sec,
                      elementId: `${sec.id}-description`,
                      elementType: "paragraph",
                      label: "Story Narrative",
                      as: "p",
                      className: "lead text-secondary mb-4",
                      children: content.description,
                    })}

                    {content.items && content.items.length > 0 && (
                      <div className="row g-3 mb-4">
                        {content.items.map((stat, idx) => (
                          <div key={idx} className="col-6">
                            {renderEl({
                              sec,
                              elementId: `${sec.id}-item-${idx}`,
                              elementType: "card",
                              label: `Story Card ${idx + 1}`,
                              itemIndex: idx,
                              as: "div",
                              className: "p-3 rounded-3 bg-white border shadow-sm",
                              children: (
                                <>
                                  <div className="fs-3 fw-bold" style={{ color: theme.primaryColor }}>
                                    {stat.stat || "100%"}
                                  </div>
                                  <div className="small fw-semibold text-dark">{stat.title}</div>
                                  <div className="small text-muted">{stat.label || stat.description}</div>
                                </>
                              ),
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* 4. PRODUCT */}
            {sec.type === "product" && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  {renderEl({
                    sec,
                    elementId: `${sec.id}-title`,
                    elementType: "heading",
                    label: "Product Catalog Title",
                    as: "h2",
                    className: "display-6 fw-bold mb-3",
                    children: content.title,
                  })}
                  {content.description &&
                    renderEl({
                      sec,
                      elementId: `${sec.id}-description`,
                      elementType: "paragraph",
                      label: "Product Description",
                      as: "p",
                      className: "lead text-secondary",
                      children: content.description,
                    })}
                </div>
                <div className="row g-4 align-items-center">
                  {content.imageUrl && (
                    <div className="col-12 col-lg-5">
                      {renderEl({
                        sec,
                        elementId: `${sec.id}-image`,
                        elementType: "image",
                        label: "Product Featured Visual",
                        isResizable: true,
                        as: "div",
                        className: "rounded-4 overflow-hidden shadow-lg border position-relative",
                        style: { backgroundColor: "#04120C" },
                        children: (
                          <img
                            src={content.imageUrl}
                            alt={content.title || "Product Lineup"}
                            className="w-100 d-block"
                            style={{
                              maxHeight: "360px",
                              objectFit: (style.imageFit as any) || "cover",
                              objectPosition: style.focalPosition || "center center",
                            }}
                          />
                        ),
                      })}
                    </div>
                  )}
                  <div className={content.imageUrl ? "col-12 col-lg-7" : "col-12"}>
                    <div className="row g-3">
                      {content.items?.map((item, idx) => (
                        <div key={idx} className="col-12 col-sm-6">
                          {renderEl({
                            sec,
                            elementId: `${sec.id}-item-${idx}`,
                            elementType: "card",
                            label: `Product Item ${idx + 1}`,
                            itemIndex: idx,
                            as: "div",
                            className: "p-4 rounded-4 bg-white border shadow-sm h-100",
                            children: (
                              <>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="badge bg-primary-subtle text-primary small">{item.tag || "Available"}</span>
                                  {item.price && <span className="fw-bold fs-6 text-dark">{item.price}</span>}
                                </div>
                                <h5 className="fw-bold mb-1 fs-6">{item.title}</h5>
                                <p className="small text-secondary mb-0">{item.description}</p>
                              </>
                            ),
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 5. FEATURES */}
            {sec.type === "features" && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  {renderEl({
                    sec,
                    elementId: `${sec.id}-title`,
                    elementType: "heading",
                    label: "Features Section Title",
                    as: "h2",
                    className: "display-6 fw-bold mb-3",
                    children: content.title,
                  })}
                  {content.description &&
                    renderEl({
                      sec,
                      elementId: `${sec.id}-description`,
                      elementType: "paragraph",
                      label: "Features Description",
                      as: "p",
                      className: "text-secondary lead",
                      children: content.description,
                    })}
                </div>
                <div className="row g-4">
                  {content.items?.map((item, idx) => (
                    <div key={idx} className="col-12 col-md-4">
                      {renderEl({
                        sec,
                        elementId: `${sec.id}-item-${idx}`,
                        elementType: "card",
                        label: `Feature Card ${idx + 1}`,
                        itemIndex: idx,
                        as: "div",
                        className: "p-4 rounded-4 bg-white border shadow-sm h-100",
                        children: (
                          <>
                            <div
                              className="p-3 rounded-3 text-white mb-3 d-inline-flex"
                              style={{ backgroundColor: theme.primaryColor || "#356DFF" }}
                            >
                              <Sparkles size={20} />
                            </div>
                            <h5 className="fw-bold mb-2">{item.title}</h5>
                            <p className="small text-secondary mb-0">{item.description}</p>
                          </>
                        ),
                      })}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. TESTIMONIALS */}
            {sec.type === "testimonials" && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  {renderEl({
                    sec,
                    elementId: `${sec.id}-title`,
                    elementType: "heading",
                    label: "Reviews Title",
                    as: "h2",
                    className: "display-6 fw-bold mb-3",
                    children: content.title || "Client Testimonials",
                  })}
                  <p className="text-secondary lead">{content.description || "Trusted by forward-thinking teams worldwide."}</p>
                </div>
                <div className="row g-4">
                  {(content.items && content.items.length > 0 ? content.items : [
                    { title: "Alex Rivera", role: "Creative Director", description: "The attention to detail and velocity of iteration transformed how we launch client products." },
                    { title: "Sophia Chen", role: "Founder, Bloom Studio", description: "Flawless aesthetics and rock-solid performance right out of the box." },
                    { title: "Marcus Vance", role: "Product Lead", description: "SiteGenAI helped us ship our high-converting showcase in hours rather than months." }
                  ]).map((t, idx) => (
                    <div key={idx} className="col-12 col-md-4">
                      {renderEl({
                        sec,
                        elementId: `${sec.id}-item-${idx}`,
                        elementType: "card",
                        label: `Testimonial ${idx + 1}`,
                        itemIndex: idx,
                        as: "div",
                        className: "p-4 rounded-4 bg-white border shadow-sm h-100 d-flex flex-column justify-content-between",
                        children: (
                          <>
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
                          </>
                        ),
                      })}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 7. GALLERY */}
            {(sec.type === "gallery" || sec.type === "showcase") && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  {renderEl({
                    sec,
                    elementId: `${sec.id}-title`,
                    elementType: "heading",
                    label: "Gallery Heading",
                    as: "h2",
                    className: "display-6 fw-bold mb-3",
                    children: content.title || "Visual Gallery",
                  })}
                  <p className="text-secondary lead">{content.description || "Explore authentic moments and crafted details."}</p>
                </div>
                <div className="row g-4">
                  {(content.items && content.items.length > 0 ? content.items : [
                    { title: "Harmonic Craftsmanship", description: "Mastery and precision", tag: "Atmosphere", label: "Featured" },
                    { title: "Artisanal Preparation", description: "Small-batch formulation", tag: "Process", label: "Selected" },
                    { title: "Heritage Detail", description: "Enduring standards", tag: "Visual", label: "2026" }
                  ]).map((item, idx) => (
                    <div key={idx} className="col-12 col-md-4">
                      {renderEl({
                        sec,
                        elementId: `${sec.id}-item-${idx}`,
                        elementType: "card",
                        label: `Gallery Card ${idx + 1}`,
                        itemIndex: idx,
                        isResizable: true,
                        as: "div",
                        className: "card h-100 rounded-4 overflow-hidden border shadow-sm bg-white",
                        children: (
                          <>
                            <div className="position-relative overflow-hidden" style={{ height: 200, backgroundColor: "#071B12" }}>
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className="w-100 h-100" style={{ objectFit: "cover" }} />
                              ) : (
                                <div
                                  className="w-100 h-100 d-flex align-items-center justify-content-center text-white"
                                  style={{
                                    background: `linear-gradient(135deg, ${theme.primaryColor || "#356DFF"} 0%, ${theme.secondaryColor || "#071B32"} 100%)`,
                                  }}
                                >
                                  <Sparkles size={28} className="opacity-75" />
                                </div>
                              )}
                            </div>
                            <div className="card-body p-4">
                              <span className="badge bg-light text-secondary border mb-2">{item.tag || "Gallery"}</span>
                              <h5 className="fw-bold mb-1">{item.title}</h5>
                              <p className="small text-secondary mb-0">{item.description}</p>
                            </div>
                          </>
                        ),
                      })}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 8. FAQ */}
            {sec.type === "faq" && (
              <section className={`container ${padClass}`}>
                <div className="text-center max-w-700 mx-auto mb-5">
                  {content.badge && <span className="sg-badge sg-badge-primary mb-2">{content.badge}</span>}
                  {renderEl({
                    sec,
                    elementId: `${sec.id}-title`,
                    elementType: "heading",
                    label: "FAQ Heading",
                    as: "h2",
                    className: "display-6 fw-bold mb-3",
                    children: content.title || "Frequently Asked Questions",
                  })}
                  <p className="text-secondary lead">{content.description || "Everything you need to know about our offerings."}</p>
                </div>
                <div className="max-w-700 mx-auto d-flex flex-column gap-3">
                  {(content.items && content.items.length > 0 ? content.items : [
                    { title: "What makes your approach unique?", description: "We blend rapid artificial intelligence blueprints with artisanal visual engineering to deliver bespoke experiences." },
                    { title: "Can I customize every design token?", description: "Yes. Every palette shade, typography hierarchy, section layout, and animation trigger can be adjusted directly in real time." },
                    { title: "How does export and publishing work?", description: "You can download the full standalone code package at any moment without proprietary locks or fees." }
                  ]).map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-3 border bg-white shadow-xs">
                      {renderEl({
                        sec,
                        elementId: `${sec.id}-item-${idx}`,
                        elementType: "card",
                        label: `FAQ Item ${idx + 1}`,
                        itemIndex: idx,
                        as: "div",
                        children: (
                          <>
                            <h5 className="fw-bold mb-2 fs-6 d-flex align-items-center gap-2">
                              <CheckCircle2 size={16} style={{ color: theme.primaryColor || "#356DFF" }} />
                              {faq.title}
                            </h5>
                            <p className="small text-secondary mb-0 ps-4">{faq.description}</p>
                          </>
                        ),
                      })}
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
                  {renderEl({
                    sec,
                    elementId: `${sec.id}-title`,
                    elementType: "heading",
                    label: "CTA Heading",
                    as: "h2",
                    className: "display-6 fw-bold mb-3",
                    children: content.title,
                  })}
                  {renderEl({
                    sec,
                    elementId: `${sec.id}-description`,
                    elementType: "paragraph",
                    label: "CTA Description",
                    as: "p",
                    className: "lead opacity-90 mb-4 mx-auto",
                    style: { maxWidth: 650 },
                    children: content.description,
                  })}
                  {content.buttonText &&
                    renderEl({
                      sec,
                      elementId: `${sec.id}-button`,
                      elementType: "button",
                      label: "CTA Button",
                      as: "button",
                      className: "btn btn-light text-primary fw-bold px-4 py-2 shadow-sm",
                      style: { borderRadius: 8 },
                      children: content.buttonText,
                    })}
                </div>
              </section>
            )}

            {/* 10. FOOTER */}
            {sec.type === "footer" && (
              <footer className={`container ${padClass} border-top mt-5`}>
                <div className="row g-4 justify-content-between">
                  <div className="col-12 col-md-5">
                    {renderEl({
                      sec,
                      elementId: `${sec.id}-title`,
                      elementType: "heading",
                      label: "Footer Brand",
                      as: "h5",
                      className: "fw-bold mb-2",
                      children: content.title,
                    })}
                    {renderEl({
                      sec,
                      elementId: `${sec.id}-description`,
                      elementType: "paragraph",
                      label: "Footer Text",
                      as: "p",
                      className: "small text-secondary mb-3",
                      children: content.description,
                    })}
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
