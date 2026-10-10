"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEMPLATES_REGISTRY } from "@/lib/templates/registry";
import Footer from "@/components/layout/Footer";
import {
  Sparkles,
  ArrowRight,
  Play,
  Star,
  ExternalLink,
  MessageSquare,
  Layout,
  Rocket,
  Edit3,
  PenTool,
  Image as ImageIcon,
  Globe,
  Search,
  BarChart3,
  Languages,
  ShoppingCart,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Copy,
  CheckCircle2,
  Menu,
  X,
  User,
} from "lucide-react";

// Filter Categories from Storyboard
const CATEGORIES = [
  "All",
  "E-commerce",
  "SaaS",
  "Portfolio",
  "Restaurant",
  "Real Estate",
  "Blog",
  "Landing Page",
];

// Showcase Projects from Storyboard
const SHOWCASE_PROJECTS = [
  {
    id: "honey-nest",
    name: "HoneyNest",
    tagline: "Pure Nature in Every Drop",
    category: "E-commerce",
    badge: "E-commerce",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    editorId: "proj-w1-cocopour",
    description: "Premium organic honey brand with cold-extracted batch jars and honeycomb journal.",
  },
  {
    id: "zenith-flow",
    name: "ZenithFlow",
    tagline: "Build Faster Grow Smarter",
    category: "SaaS",
    badge: "SaaS",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    editorId: "proj-zenith-cloud",
    description: "Enterprise SaaS analytics and telemetry platform with live interactive charts.",
  },
  {
    id: "alex-portfolio",
    name: "Alex Studio",
    tagline: "Design Create Inspire",
    category: "Portfolio",
    badge: "Creative Portfolio",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    editorId: "proj-aurora-studio",
    description: "High-fashion & architectural visual atelier portfolio with minimalist typography.",
  },
  {
    id: "savory-dining",
    name: "Savory",
    tagline: "Good Food Better Mood",
    category: "Restaurant",
    badge: "Restaurant",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    editorId: "proj-w1-cocopour",
    description: "Artisanal farm-to-table culinary destination with seasonal menus and table bookings.",
  },
  {
    id: "nest-space",
    name: "NestSpace",
    tagline: "Find Your Dream Home",
    category: "Real Estate",
    badge: "Real Estate",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    editorId: "proj-aurora-studio",
    description: "Architectural residences and modern villas with virtual spatial tours.",
  },
  {
    id: "echo-tech",
    name: "Echo Magazine",
    tagline: "Stories That Move You",
    category: "Blog",
    badge: "Modern Publication",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
    editorId: "proj-zenith-cloud",
    description: "Independent cultural journalism with curated essays and weekly audio podcasts.",
  },
];

// Advanced Features from Storyboard
const ADVANCED_FEATURES = [
  {
    icon: <Edit3 size={22} className="sb-text-emerald" />,
    title: "Intuitive AI Website Editor",
    description: "Edit text, images, styles and layouts with our powerful visual editor.",
  },
  {
    icon: <Sparkles size={22} className="sb-text-violet" />,
    title: "AI-Generated Media",
    description: "Create stunning custom images and videos tailored for your brand.",
  },
  {
    icon: <Globe size={22} className="sb-text-cyan" />,
    title: "Custom Domain & Hosting",
    description: "Publish your website with a custom domain and ultra-fast cloud hosting.",
  },
  {
    icon: <Search size={22} className="sb-text-emerald" />,
    title: "Built-in SEO Optimization",
    description: "Get better discoverability with AI-optimized content and semantic headings.",
  },
  {
    icon: <BarChart3 size={22} className="sb-text-violet" />,
    title: "Analytics & Insights",
    description: "Track visitors, traffic and conversion performance in real-time.",
  },
  {
    icon: <Languages size={22} className="sb-text-cyan" />,
    title: "Multilingual Support",
    description: "Create international websites with instant localization.",
  },
  {
    icon: <ShoppingCart size={22} className="sb-text-emerald" />,
    title: "E-commerce Ready",
    description: "Add products, checkout flows, and inventory controls easily.",
  },
  {
    icon: <Users size={22} className="sb-text-violet" />,
    title: "Team Collaboration",
    description: "Invite team members and review website revisions seamlessly.",
  },
];

// Team Members from Storyboard
const TEAM_MEMBERS = [
  {
    name: "Aarav Mehta",
    role: "Co-Founder & CEO",
    bio: "Vision, strategy and a passion for building products that empower creativity.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Priya Sharma",
    role: "AI Lead",
    bio: "Building intelligent AI systems that turn ideas into beautiful websites.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Rohan Verma",
    role: "Product Designer",
    bio: "Designing delightful experiences that make creation simple and fun.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Maya Iyer",
    role: "Engineering Lead",
    bio: "Turning ideas into scalable, robust products with clean and modern tech.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
  },
];

// Testimonials from Storyboard
const TESTIMONIALS = [
  {
    name: "Sneha Kapoor",
    role: "Small Business Owner",
    quote: "SiteGenAI turned my idea into a beautiful website in minutes. Absolutely incredible!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
  {
    name: "Rahul Desai",
    role: "Freelance Designer",
    quote: "The AI editor is mind-blowing. I launched my portfolio without writing a single line of code.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
  {
    name: "Aditi Sharma",
    role: "Startup Founder",
    quote: "Perfect for startups! We built our landing page and started getting users the same week.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [promptInput, setPromptInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter projects by category
  const filteredProjects = SHOWCASE_PROJECTS.filter((p) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Landing Page") return p.category === "SaaS" || p.category === "E-commerce";
    return p.category === selectedCategory;
  });

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = promptInput.trim() || "Create a modern e-commerce website for a honey brand";
    router.push(`/create?prompt=${encodeURIComponent(prompt)}`);
  };

  const copyLiveDemoUrl = () => {
    navigator.clipboard.writeText("https://honeynest.sitegenai.app");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="min-vh-100 d-flex flex-column position-relative" style={{ backgroundColor: "#0B0D12", color: "#F1F5F9" }}>
      {/* Background Glow Blobs */}
      <div className="sb-glow-blob-emerald top-0 start-0 opacity-30" />
      <div className="sb-glow-blob-violet top-0 end-0 opacity-20" />

      {/* ======================================================================
          1. HEADER & NAVIGATION
          ====================================================================== */}
      <header
        className="sticky-top py-3 border-bottom position-relative"
        style={{
          backgroundColor: "rgba(16, 20, 28, 0.94)",
          backdropFilter: "blur(14px)",
          borderColor: "#303947",
          zIndex: 1040,
        }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <Link href="/" className="text-white text-decoration-none d-flex align-items-center gap-2 fw-bold fs-4">
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

            {/* Desktop Nav Links */}
            <nav className="d-none d-lg-flex align-items-center gap-4">
              <Link href="#our-work" className="text-decoration-none fw-semibold small hover-text-white" style={{ color: "#D1D5DB" }}>
                Showcase
              </Link>
              <Link href="/templates" className="text-decoration-none fw-semibold small hover-text-white" style={{ color: "#D1D5DB" }}>
                Templates
              </Link>
              <Link href="#features" className="text-decoration-none fw-semibold small hover-text-white" style={{ color: "#D1D5DB" }}>
                Features
              </Link>
              <Link href="#pricing" className="text-decoration-none fw-semibold small hover-text-white" style={{ color: "#D1D5DB" }}>
                Pricing
              </Link>
              <Link href="#how-it-works" className="text-decoration-none fw-semibold small hover-text-white" style={{ color: "#D1D5DB" }}>
                How It Works
              </Link>
            </nav>

            {/* Right CTAs */}
            <div className="d-none d-md-flex align-items-center gap-3">
              <Link href="/login" className="sb-btn-outline btn-sm py-1.5 px-3 small btn-magnetic">
                Sign In
              </Link>
              <Link href="/create" className="sb-btn-primary btn-sm py-1.5 px-3.5 small btn-magnetic">
                Get Started
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              type="button"
              className="btn btn-sm d-lg-none text-white border p-1.5 rounded-3"
              style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="d-lg-none pt-3 pb-2 border-top mt-3" style={{ borderColor: "#303947" }}>
              <div className="d-flex flex-column gap-2">
                <Link href="/templates" className="text-white py-1.5 px-2 rounded-2 text-decoration-none small fw-semibold" onClick={() => setMobileMenuOpen(false)}>
                  Templates
                </Link>
                <Link href="#features" className="text-white py-1.5 px-2 rounded-2 text-decoration-none small fw-semibold" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </Link>
                <Link href="#pricing" className="text-white py-1.5 px-2 rounded-2 text-decoration-none small fw-semibold" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </Link>
                <Link href="/dashboard" className="text-white py-1.5 px-2 rounded-2 text-decoration-none small fw-semibold" onClick={() => setMobileMenuOpen(false)}>
                  My Dashboard
                </Link>
                <div className="d-flex gap-2 pt-2 border-top" style={{ borderColor: "#303947" }}>
                  <Link href="/login" className="sb-btn-outline btn-sm w-50 justify-content-center" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/create" className="sb-btn-primary btn-sm w-50 justify-content-center" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow-1 position-relative">
        {/* ======================================================================
            2. HERO SECTION
            ====================================================================== */}
        <section className="py-5 position-relative overflow-hidden">
          {/* Background Video Layer */}
          <div className="sb-hero-video-wrapper" aria-hidden="true">
            <video
              className="sb-hero-video"
              autoPlay
              muted
              loop
              playsInline
              poster="/hero-poster.jpg"
              preload="metadata"
            >
              <source src="/hero-video.mp4" type="video/mp4" />
              <source src="/video.mp4" type="video/mp4" />
            </video>
            <img
              src="/hero-poster.jpg"
              alt=""
              className="sb-hero-fallback-poster"
            />
            <div className="sb-hero-video-overlay" />
          </div>

          <div className="container py-4 py-lg-5 position-relative" style={{ zIndex: 2 }}>
            <div className="row justify-content-center text-center">
              <div className="col-12 col-xl-10">
                {/* Badge */}
                <div
                  className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-4 border"
                  style={{ backgroundColor: "rgba(163, 255, 111, 0.12)", borderColor: "rgba(163, 255, 111, 0.35)" }}
                >
                  <Sparkles size={14} className="sb-text-emerald" />
                  <span className="small fw-semibold text-white">Next-Generation AI Website Builder</span>
                </div>

                {/* Headline */}
                <h1 className="display-3 fw-extrabold mb-3 tracking-tight text-white" style={{ lineHeight: 1.15 }}>
                  Turn Your Ideas <br className="d-none d-sm-block" />
                  Into <span className="sb-text-emerald">Stunning Websites</span>
                </h1>

                {/* Subtitle */}
                <p className="lead mb-4 mx-auto" style={{ maxWidth: 700, fontSize: "1.18rem", color: "#D1D5DB", lineHeight: 1.6 }}>
                  Describe your idea, and let AI create a beautiful, customizable website in seconds. No coding. No limits. Just pure creativity.
                </p>

                {/* Primary Buttons */}
                <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                  <Link href="/create" className="sb-btn-primary btn-lg px-4 py-3 fs-6 btn-magnetic">
                    Build with AI <ArrowRight size={18} />
                  </Link>
                  <Link href="/templates" className="sb-btn-outline btn-lg px-4 py-3 fs-6 btn-magnetic">
                    Explore Templates
                  </Link>
                </div>

                {/* Stats row */}
                <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 mb-5 pt-2">
                  <div className="text-center">
                    <div className="h3 fw-bold text-white mb-0">10K+</div>
                    <div className="small" style={{ color: "#BFC7D2" }}>Websites Created</div>
                  </div>
                  <div className="text-center">
                    <div className="h3 fw-bold text-white mb-0 d-flex align-items-center justify-content-center gap-1">
                      <Star size={18} className="text-warning fill-warning" />
                      4.9/5
                    </div>
                    <div className="small" style={{ color: "#BFC7D2" }}>User Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="h3 fw-bold text-white mb-0">100%</div>
                    <div className="small" style={{ color: "#BFC7D2" }}>No Code Required</div>
                  </div>
                </div>

                {/* Interactive AI Prompt Input Bar */}
                <div className="mx-auto mb-5" style={{ maxWidth: 680 }}>
                  <form onSubmit={handlePromptSubmit} className="sb-prompt-box d-flex align-items-center gap-2 border" style={{ borderColor: "#303947" }}>
                    <Sparkles size={18} className="sb-text-emerald flex-shrink-0" />
                    <input
                      type="text"
                      className="sb-prompt-input"
                      placeholder="Create a modern e-commerce website for a honey brand..."
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn rounded-circle d-flex align-items-center justify-content-center text-dark flex-shrink-0"
                      style={{ width: 40, height: 40, backgroundColor: "#A3FF6F" }}
                      aria-label="Generate website from prompt"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* FLOATING WEBSITE PREVIEWS */}
            <div className="position-relative pt-3 pb-4">
              <div className="row g-4 justify-content-center align-items-center">
                {/* Left Preview: SaaS Dashboard Mockup */}
                <div className="col-12 col-md-3 d-none d-lg-block">
                  <div className="sb-card card-3d-tilt card-spotlight p-3 shadow-lg rounded-4 border" style={{ borderColor: "#303947", backgroundColor: "#151A24" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom" style={{ borderColor: "#303947" }}>
                      <span className="small fw-bold text-white">ZenithFlow AI</span>
                      <span className="badge small" style={{ backgroundColor: "rgba(139, 124, 255, 0.15)", color: "#8B7CFF", border: "1px solid rgba(139, 124, 255, 0.35)" }}>SaaS</span>
                    </div>
                    <div className="card-img-zoom rounded-3 overflow-hidden mb-2">
                      <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
                        alt="Build Smarter with AI"
                        className="img-fluid"
                        style={{ maxHeight: 160, objectFit: "cover", width: "100%" }}
                      />
                    </div>
                    <div className="small fw-semibold text-white">Build Smarter with AI</div>
                    <div className="small" style={{ fontSize: "0.8rem", color: "#D1D5DB" }}>Real-time telemetry pipeline</div>
                  </div>
                </div>

                {/* Center Main Preview: HoneyNest Hero Card */}
                <div className="col-12 col-lg-6">
                  <div
                    className="sb-card card-3d-tilt card-spotlight p-4 shadow-2xl position-relative overflow-hidden rounded-4 border"
                    style={{ borderColor: "rgba(163, 255, 111, 0.4)", background: "#151A24" }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: "#303947" }}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="p-1 rounded bg-warning text-dark fw-bold small">🍯</span>
                        <span className="fw-bold text-white">HoneyNest</span>
                      </div>
                      <div className="d-flex gap-3 small fw-semibold" style={{ color: "#D1D5DB" }}>
                        <span>Home</span>
                        <span>Shop</span>
                        <span>About</span>
                      </div>
                    </div>

                    <div className="row align-items-center g-3">
                      <div className="col-12 col-sm-6 text-start">
                        <span className="badge bg-warning text-dark mb-2 fw-semibold">100% Raw &amp; Organic</span>
                        <h3 className="fw-bold text-white mb-2">Pure Nature in Every Drop</h3>
                        <p className="small mb-3" style={{ color: "#D1D5DB" }}>Premium organic honey straight from nature to your home.</p>
                        <Link href="/editor/proj-w1-cocopour" className="btn btn-warning btn-sm text-dark fw-bold px-3 py-2 rounded-pill shadow-xs">
                          Shop Now &rarr;
                        </Link>
                      </div>
                      <div className="col-12 col-sm-6 text-center position-relative">
                        <div
                          className="rounded-4 overflow-hidden shadow-lg border position-relative card-img-zoom"
                          style={{ borderColor: "#303947" }}
                        >
                          <img
                            src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=700&q=80"
                            alt="HoneyNest golden honey jar"
                            className="img-fluid w-100"
                            style={{ maxHeight: 220, objectFit: "cover" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="position-absolute bottom-0 end-0 m-3 d-none d-sm-block">
                      <span className="badge text-dark p-2 rounded-pill shadow small fw-bold" style={{ backgroundColor: "#A3FF6F" }}>
                        ✨ Turn ideas into reality
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Preview: Creative Portfolio */}
                <div className="col-12 col-md-3 d-none d-lg-block">
                  <div className="sb-card card-3d-tilt card-spotlight p-3 shadow-lg rounded-4 border" style={{ borderColor: "#303947", backgroundColor: "#151A24" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom" style={{ borderColor: "#303947" }}>
                      <span className="small fw-bold text-white">Alex Atelier</span>
                      <span className="badge small" style={{ backgroundColor: "rgba(54, 217, 245, 0.15)", color: "#36D9F5", border: "1px solid rgba(54, 217, 245, 0.35)" }}>Portfolio</span>
                    </div>
                    <div className="card-img-zoom rounded-3 overflow-hidden mb-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                        alt="Creative Portfolio"
                        className="img-fluid"
                        style={{ maxHeight: 160, objectFit: "cover", width: "100%" }}
                      />
                    </div>
                    <div className="small fw-semibold text-white">Design Create Inspire</div>
                    <div className="small" style={{ fontSize: "0.8rem", color: "#D1D5DB" }}>Spatial visual director</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================
            3. SECTION 2: OUR WORK — SHOWCASE W1 & W2
            ====================================================================== */}
        <section id="our-work" className="py-5 position-relative border-top border-bottom" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
          <div className="container py-4">
            <div className="text-center mb-5">
              <span className="badge rounded-pill px-3 py-1 mb-2 fw-semibold" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", border: "1px solid rgba(163, 255, 111, 0.35)", color: "#A3FF6F" }}>
                OUR WORK
              </span>
              <h2 className="display-5 fw-bold text-white mb-2">From Imagination to Reality</h2>
              <p className="lead mx-auto" style={{ maxWidth: 650, color: "#D1D5DB" }}>
                Explore live website projects and interactive designs built with SiteGenAI. Real interactive code, infinite possibilities.
              </p>
            </div>

            {/* FEATURED WORK SHOWCASE: W1 & W2 */}
            <div className="row g-4 mb-5 align-items-stretch">
              {/* Project 1: W1 */}
              <div className="col-12 col-lg-6">
                <div className="sb-browser-frame h-100 rounded-4 border card-3d-tilt" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div className="sb-browser-header border-bottom" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
                    <div className="sb-browser-dots" aria-hidden="true">
                      <span className="sb-browser-dot sb-browser-dot-red" />
                      <span className="sb-browser-dot sb-browser-dot-yellow" />
                      <span className="sb-browser-dot sb-browser-dot-green" />
                    </div>
                    <div className="sb-browser-address-bar" title="https://w1.sitegenai.local/">
                      <span className="sb-text-emerald" style={{ fontSize: "0.75rem" }}>🔒</span>
                      <span>https://w1.sitegenai.local/</span>
                    </div>
                    <span className="badge rounded-pill px-2.5 py-1 fw-semibold border" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", borderColor: "rgba(163, 255, 111, 0.35)", color: "#A3FF6F", fontSize: "0.72rem" }}>
                      Live Rendered
                    </span>
                  </div>

                  <div className="sb-browser-viewport position-relative">
                    <iframe
                      src="/templates/w1/index.html"
                      title="W1 Website Project Preview"
                      className="sb-browser-iframe"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4 d-flex flex-column justify-content-between flex-grow-1" style={{ background: "#151A24" }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <h3 className="h4 fw-bold text-white mb-0">W1</h3>
                          <span className="badge border small" style={{ backgroundColor: "#202938", borderColor: "#303947", color: "#D1D5DB" }}>
                            COCO POUR
                          </span>
                        </div>
                        <span className="sb-text-emerald small fw-bold">Interactive Video</span>
                      </div>
                      <p className="small mb-3" style={{ lineHeight: 1.6, color: "#D1D5DB" }}>
                        Artisanal pure cold-pressed coconut milk website featuring interactive barista pouring moments, cinematic video loops, botanical ingredient specs, and culinary recipe cards.
                      </p>
                    </div>

                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 border-top mt-auto" style={{ borderColor: "#303947" }}>
                      <div className="d-flex align-items-center gap-2">
                        <a
                          href="/templates/w1/index.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sb-btn-primary btn-sm py-2 px-3.5 d-inline-flex align-items-center gap-2 text-decoration-none shadow-sm btn-magnetic"
                          id="btn-view-website-w1"
                        >
                          <ExternalLink size={15} />
                          View Website
                        </a>
                        <Link
                          href="/editor/proj-w1-cocopour"
                          className="sb-btn-outline btn-sm py-2 px-3 d-inline-flex align-items-center gap-1.5 text-decoration-none"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <Edit3 size={13} />
                          Open in Studio
                        </Link>
                      </div>
                      <span className="small fw-semibold" style={{ fontSize: "0.8rem", color: "#BFC7D2" }}>
                        HTML5 &bull; CSS3 &bull; GSAP 3.12
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project 2: W2 */}
              <div className="col-12 col-lg-6">
                <div className="sb-browser-frame h-100 rounded-4 border card-3d-tilt" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div className="sb-browser-header border-bottom" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
                    <div className="sb-browser-dots" aria-hidden="true">
                      <span className="sb-browser-dot sb-browser-dot-red" />
                      <span className="sb-browser-dot sb-browser-dot-yellow" />
                      <span className="sb-browser-dot sb-browser-dot-green" />
                    </div>
                    <div className="sb-browser-address-bar" title="https://w2.sitegenai.local/">
                      <span className="text-warning" style={{ fontSize: "0.75rem" }}>🔒</span>
                      <span>https://w2.sitegenai.local/</span>
                    </div>
                    <span className="badge rounded-pill px-2.5 py-1 fw-semibold border" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", borderColor: "rgba(245, 158, 11, 0.35)", color: "#F59E0B", fontSize: "0.72rem" }}>
                      Live Rendered
                    </span>
                  </div>

                  <div className="sb-browser-viewport position-relative">
                    <iframe
                      src="/templates/w2/index.html"
                      title="W2 Website Project Preview"
                      className="sb-browser-iframe"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4 d-flex flex-column justify-content-between flex-grow-1" style={{ background: "#151A24" }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <h3 className="h4 fw-bold text-white mb-0">W2</h3>
                          <span className="badge border small" style={{ backgroundColor: "#202938", borderColor: "#303947", color: "#D1D5DB" }}>
                            BRUVA Coffee
                          </span>
                        </div>
                        <span className="text-warning small fw-bold">Brass Filter Ritual</span>
                      </div>
                      <p className="small mb-3" style={{ lineHeight: 1.6, color: "#D1D5DB" }}>
                        Artisanal South Indian single-origin coffee with traditional brass filter decoction, Lenis smooth scrolling, GSAP interactive chapters, and rich coffee videos.
                      </p>
                    </div>

                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 border-top mt-auto" style={{ borderColor: "#303947" }}>
                      <div className="d-flex align-items-center gap-2">
                        <a
                          href="/templates/w2/index.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sb-btn-primary btn-sm py-2 px-3.5 d-inline-flex align-items-center gap-2 text-decoration-none shadow-sm btn-magnetic"
                          id="btn-view-website-w2"
                        >
                          <ExternalLink size={15} />
                          View Website
                        </a>
                        <Link
                          href="/editor/proj-w1-cocopour"
                          className="sb-btn-outline btn-sm py-2 px-3 d-inline-flex align-items-center gap-1.5 text-decoration-none"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <Edit3 size={13} />
                          Open in Studio
                        </Link>
                      </div>
                      <span className="small fw-semibold" style={{ fontSize: "0.8rem", color: "#BFC7D2" }}>
                        HTML5 &bull; Lenis &bull; GSAP 3.12
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter Pills & Showcase Portfolio */}
            <div className="text-center mb-4">
              <h4 className="fw-bold text-white mb-2 fs-5">More Categories &amp; Design Styles</h4>
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`sb-filter-pill ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 6 Grid Cards */}
            <div className="row g-4">
              {filteredProjects.map((proj) => (
                <div key={proj.id} className="col-12 col-md-6 col-lg-4">
                  <div className="sb-card card-3d-tilt card-spotlight h-100 overflow-hidden d-flex flex-column justify-content-between p-3.5 rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                    <div>
                      <div className="position-relative rounded-3 overflow-hidden mb-3 card-img-zoom" style={{ height: 210 }}>
                        <img
                          src={proj.image}
                          alt={proj.name}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                        <span className="position-absolute top-0 start-0 m-2 badge border small fw-semibold" style={{ backgroundColor: "#10141C", borderColor: "#303947", color: "#FFFFFF" }}>
                          {proj.badge}
                        </span>
                      </div>
                      <h4 className="fw-bold text-white mb-1 fs-5">{proj.name}</h4>
                      <h6 className="sb-text-emerald small fw-semibold mb-2">{proj.tagline}</h6>
                      <p className="small mb-3" style={{ color: "#D1D5DB", lineHeight: 1.55 }}>{proj.description}</p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-3 border-top" style={{ borderColor: "#303947" }}>
                      <span className="small fw-semibold" style={{ color: "#BFC7D2" }}>{proj.category}</span>
                      <Link
                        href={`/editor/${proj.editorId}`}
                        className="btn btn-sm sb-btn-outline py-1 px-3 d-flex align-items-center gap-1"
                        style={{ fontSize: "0.82rem" }}
                      >
                        Open Editor <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================
            4. SECTION 3: HOW SITEGENAI WORKS
            ====================================================================== */}
        <section id="how-it-works" className="py-5 position-relative">
          <div className="container py-4">
            <div className="text-center mb-5">
              <span className="badge rounded-pill px-3 py-1 mb-2 fw-semibold" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", border: "1px solid rgba(163, 255, 111, 0.35)", color: "#A3FF6F" }}>
                HOW SITEGENAI WORKS
              </span>
              <h2 className="display-5 fw-bold text-white mb-2">
                Turn Your Idea Into a Live Website <br />
                in <span className="sb-text-emerald">3 Simple Steps</span>
              </h2>
              <p className="lead" style={{ color: "#D1D5DB" }}>Simple • Fast • Powerful</p>
            </div>

            <div className="row g-4 align-items-stretch">
              {/* Step 1 */}
              <div className="col-12 col-md-4">
                <div className="sb-card card-3d-tilt card-spotlight p-4 h-100 d-flex flex-column justify-content-between rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="p-3 rounded-circle" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)" }}>
                        <MessageSquare size={24} className="sb-text-emerald" />
                      </div>
                      <span className="fs-3 fw-bold" style={{ color: "#BFC7D2" }}>01</span>
                    </div>
                    <h4 className="fw-bold text-white mb-2">Describe Your Idea</h4>
                    <p className="small mb-4" style={{ color: "#D1D5DB", lineHeight: 1.6 }}>
                      Simply tell us what kind of website you want. Be as detailed as you like, or remix an existing URL.
                    </p>
                  </div>

                  <div className="p-3 rounded-3 border" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
                    <div className="small mb-1" style={{ color: "#BFC7D2" }}>Example Prompt:</div>
                    <div className="small text-white font-monospace mb-2">
                      "Create a modern e-commerce website for a honey brand..."
                    </div>
                    <Link href="/create" className="sb-btn-outline w-100 rounded-pill py-1 small text-center d-block">
                      Try This Prompt &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="col-12 col-md-4">
                <div className="sb-card card-3d-tilt card-spotlight p-4 h-100 d-flex flex-column justify-content-between rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="p-3 rounded-circle" style={{ backgroundColor: "rgba(139, 124, 255, 0.15)" }}>
                        <Layout size={24} className="sb-text-violet" />
                      </div>
                      <span className="fs-3 fw-bold" style={{ color: "#BFC7D2" }}>02</span>
                    </div>
                    <h4 className="fw-bold text-white mb-2">Customize Your Design</h4>
                    <p className="small mb-4" style={{ color: "#D1D5DB", lineHeight: 1.6 }}>
                      Fine-tune with our visual editor. Change typography, images, colors, and layout blocks in real-time.
                    </p>
                  </div>

                  <div className="p-3 rounded-3 border" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-white fw-bold">Live Visual Canvas</span>
                      <span className="badge small" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", color: "#A3FF6F" }}>Editing</span>
                    </div>
                    <div className="d-flex gap-1.5 mb-2">
                      <span className="rounded-circle" style={{ backgroundColor: "#A3FF6F", width: 14, height: 14 }} />
                      <span className="rounded-circle" style={{ backgroundColor: "#8B7CFF", width: 14, height: 14 }} />
                      <span className="rounded-circle" style={{ backgroundColor: "#36D9F5", width: 14, height: 14 }} />
                      <span className="rounded-circle" style={{ backgroundColor: "#FFFFFF", width: 14, height: 14 }} />
                    </div>
                    <Link href="/editor/proj-w1-cocopour" className="sb-btn-outline w-100 rounded-pill py-1 small text-center d-block">
                      Explore Visual Editor &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="col-12 col-md-4">
                <div className="sb-card card-3d-tilt card-spotlight p-4 h-100 d-flex flex-column justify-content-between rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="p-3 rounded-circle" style={{ backgroundColor: "rgba(54, 217, 245, 0.15)" }}>
                        <Rocket size={24} className="sb-text-cyan" />
                      </div>
                      <span className="fs-3 fw-bold" style={{ color: "#BFC7D2" }}>03</span>
                    </div>
                    <h4 className="fw-bold text-white mb-2">Publish &amp; Export</h4>
                    <p className="small mb-4" style={{ color: "#D1D5DB", lineHeight: 1.6 }}>
                      Launch your website or download standalone ZIP packages with clean HTML, CSS, and assets.
                    </p>
                  </div>

                  <div className="p-3 rounded-3 border text-center" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
                    <div className="small fw-bold text-white mb-1">Your Website is Ready! 🚀</div>
                    <div className="p-2 rounded font-monospace small d-flex align-items-center justify-content-between mb-2 border" style={{ backgroundColor: "#0B0D12", borderColor: "#303947", color: "#A3FF6F" }}>
                      <span style={{ fontSize: "0.78rem" }}>https://honeynest.sitegenai.app</span>
                      <button type="button" className="btn btn-xs btn-link p-0 text-white" onClick={copyLiveDemoUrl} aria-label="Copy demo URL">
                        {copiedUrl ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <Link href="/dashboard" className="sb-btn-primary w-100 py-1 small text-center d-block">
                      View Live Project
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================
            5. SECTION 4: ADVANCED FEATURES
            ====================================================================== */}
        <section id="features" className="py-5 border-top border-bottom" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
          <div className="container py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
              <div>
                <span className="badge rounded-pill px-3 py-1 mb-2 fw-semibold" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", border: "1px solid rgba(163, 255, 111, 0.35)", color: "#A3FF6F" }}>
                  ADVANCED FEATURES
                </span>
                <h2 className="display-5 fw-bold text-white mb-2">
                  Everything You Need to <span className="sb-text-emerald">Build, Grow and Scale</span>
                </h2>
                <p className="lead mb-0" style={{ maxWidth: 640, color: "#D1D5DB" }}>
                  Powerful AI tools and modern features to create professional websites without limits.
                </p>
              </div>

              <div className="mt-3 mt-md-0">
                <Link href="/create" className="sb-btn-outline small">
                  View All Features &rarr;
                </Link>
              </div>
            </div>

            <div className="row g-4">
              {ADVANCED_FEATURES.map((feat, idx) => (
                <div key={idx} className="col-12 col-sm-6 col-lg-3">
                  <div className="sb-card card-3d-tilt card-spotlight p-4 h-100 rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                    <div className="p-3 rounded-3 d-inline-flex mb-3 border" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
                      {feat.icon}
                    </div>
                    <h5 className="fw-bold text-white mb-2 fs-6">{feat.title}</h5>
                    <p className="small mb-0" style={{ color: "#D1D5DB", lineHeight: 1.55 }}>{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================
            6. SECTION 5: BEAUTIFUL TEMPLATES
            ====================================================================== */}
        <section id="templates" className="py-5 position-relative">
          <div className="container py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
              <div>
                <span className="badge rounded-pill px-3 py-1 mb-2 fw-semibold" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", border: "1px solid rgba(163, 255, 111, 0.35)", color: "#A3FF6F" }}>
                  BEAUTIFUL TEMPLATES
                </span>
                <h2 className="display-5 fw-bold text-white mb-2">Professionally Designed Templates</h2>
                <p className="lead mb-0" style={{ color: "#D1D5DB" }}>Kickstart your website with stunning, fully customizable templates.</p>
              </div>

              <div className="mt-3 mt-md-0">
                <Link href="/templates" className="sb-btn-outline small">
                  Browse All Templates &rarr;
                </Link>
              </div>
            </div>

            <div className="row g-4">
              {TEMPLATES_REGISTRY.slice(0, 3).map((tpl) => (
                <div key={tpl.id} className="col-12 col-md-4">
                  <div className="sb-card card-3d-tilt card-spotlight h-100 overflow-hidden d-flex flex-column justify-content-between p-3.5 rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                    <div>
                      <div className="position-relative rounded-3 overflow-hidden mb-3 card-img-zoom" style={{ height: 220 }}>
                        <img
                          src={tpl.thumbnail}
                          alt={tpl.name}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                        <span className="position-absolute top-0 end-0 m-2 badge border small fw-bold" style={{ backgroundColor: "#A3FF6F", color: "#0B0D12", borderColor: "#A3FF6F" }}>
                          {tpl.previewBadge || "Featured"}
                        </span>
                      </div>
                      <h4 className="fw-bold text-white mb-1 fs-5">{tpl.name}</h4>
                      <h6 className="sb-text-emerald small fw-semibold mb-2">{tpl.tagline}</h6>
                      <p className="small mb-3" style={{ color: "#D1D5DB" }}>{tpl.description}</p>
                    </div>

                    <div className="d-flex gap-2 pt-3 border-top" style={{ borderColor: "#303947" }}>
                      <Link href={`/editor/proj-${tpl.id}`} className="sb-btn-primary btn-sm flex-grow-1 py-2 text-center">
                        Customize in Studio
                      </Link>
                      <a
                        href={tpl.previewPath || `/templates`}
                        target={tpl.previewPath ? "_blank" : "_self"}
                        rel="noreferrer"
                        className="btn btn-sm border px-3 text-white"
                        style={{ backgroundColor: "#202938", borderColor: "#303947" }}
                        aria-label="Preview template"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================
            7. SECTION 6: MEET OUR TEAM
            ====================================================================== */}
        <section id="team" className="py-5 border-top border-bottom" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
          <div className="container py-4">
            <div className="text-center mb-5">
              <span className="badge rounded-pill px-3 py-1 mb-2 fw-semibold" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", border: "1px solid rgba(163, 255, 111, 0.35)", color: "#A3FF6F" }}>
                OUR TEAM
              </span>
              <h2 className="display-5 fw-bold text-white mb-2">
                Meet the Team Behind <span className="sb-text-emerald">the Platform</span>
              </h2>
              <p className="lead mx-auto" style={{ maxWidth: 650, color: "#D1D5DB" }}>
                Passion • Craftsmanship • AI Systems | Building tools that empower creator autonomy.
              </p>
            </div>

            <div className="row g-4">
              {TEAM_MEMBERS.map((member, idx) => (
                <div key={idx} className="col-12 col-sm-6 col-lg-3">
                  <div className="sb-card card-3d-tilt card-spotlight p-4 text-center h-100 d-flex flex-column justify-content-between rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                    <div>
                      <div className="position-relative mx-auto rounded-circle overflow-hidden mb-3 shadow" style={{ width: 110, height: 110, border: "2px solid #A3FF6F" }}>
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <h5 className="fw-bold text-white mb-1">{member.name}</h5>
                      <div className="sb-text-emerald small fw-semibold mb-2">{member.role}</div>
                      <p className="small mb-3" style={{ color: "#D1D5DB" }}>{member.bio}</p>
                    </div>

                    <div className="d-flex justify-content-center gap-3 pt-3 border-top" style={{ borderColor: "#303947", color: "#BFC7D2" }}>
                      <span className="small hover-text-white cursor-pointer">LinkedIn</span>
                      <span>&bull;</span>
                      <span className="small hover-text-white cursor-pointer">GitHub</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================
            8. SECTION 7: WHAT OUR USERS SAY
            ====================================================================== */}
        <section id="testimonials" className="py-5 position-relative">
          <div className="container py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
              <div>
                <span className="badge rounded-pill px-3 py-1 mb-2 fw-semibold" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", border: "1px solid rgba(163, 255, 111, 0.35)", color: "#A3FF6F" }}>
                  WHAT OUR USERS SAY
                </span>
                <h2 className="display-5 fw-bold text-white mb-2">
                  Loved by <span className="sb-text-emerald">Creators, Founders &amp; Builders</span>
                </h2>
              </div>

              <div className="d-flex gap-2 mt-3 mt-md-0">
                <button
                  type="button"
                  className="btn rounded-circle p-2 text-white border"
                  style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
                  onClick={() => setTestimonialIndex((testimonialIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="btn rounded-circle p-2 text-white border"
                  style={{ backgroundColor: "#151A24", borderColor: "#303947" }}
                  onClick={() => setTestimonialIndex((testimonialIndex + 1) % TESTIMONIALS.length)}
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="row g-4">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="col-12 col-md-4">
                  <div className="sb-card card-3d-tilt card-spotlight p-4 h-100 d-flex flex-column justify-content-between rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                    <div>
                      <div className="d-flex gap-1 text-warning mb-3">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                        ))}
                      </div>
                      <p className="mb-4 fs-6" style={{ color: "#F1F5F9", fontStyle: "italic", lineHeight: 1.6 }}>"{t.quote}"</p>
                    </div>

                    <div className="d-flex align-items-center gap-3 pt-3 border-top" style={{ borderColor: "#303947" }}>
                      <img
                        src={t.image}
                        alt={t.name}
                        className="rounded-circle border"
                        style={{ width: 44, height: 44, objectFit: "cover", borderColor: "#303947" }}
                      />
                      <div>
                        <div className="fw-bold text-white small">{t.name}</div>
                        <div className="small" style={{ fontSize: "0.8rem", color: "#BFC7D2" }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================
            9. SECTION 8: SIMPLE & TRANSPARENT PRICING
            ====================================================================== */}
        <section id="pricing" className="py-5 border-top border-bottom" style={{ backgroundColor: "#10141C", borderColor: "#303947" }}>
          <div className="container py-4">
            <div className="text-center mb-5">
              <span className="badge rounded-pill px-3 py-1 mb-2 fw-semibold" style={{ backgroundColor: "rgba(163, 255, 111, 0.15)", border: "1px solid rgba(163, 255, 111, 0.35)", color: "#A3FF6F" }}>
                SIMPLE &amp; TRANSPARENT PRICING
              </span>
              <h2 className="display-5 fw-bold text-white mb-2">
                Choose the Plan That <span className="sb-text-emerald">Fits You</span>
              </h2>

              <div className="d-inline-flex align-items-center p-1 rounded-pill border mt-3" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-4 ${billingCycle === "monthly" ? "sb-btn-primary" : "text-white"}`}
                  style={billingCycle !== "monthly" ? { color: "#D1D5DB" } : {}}
                  onClick={() => setBillingCycle("monthly")}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-4 position-relative ${billingCycle === "yearly" ? "sb-btn-primary" : "text-white"}`}
                  style={billingCycle !== "yearly" ? { color: "#D1D5DB" } : {}}
                  onClick={() => setBillingCycle("yearly")}
                >
                  Yearly
                  <span className="badge bg-warning text-dark position-absolute top-0 start-100 translate-middle small">
                    20% OFF
                  </span>
                </button>
              </div>
            </div>

            <div className="row g-4 align-items-stretch">
              {/* Free Plan */}
              <div className="col-12 col-md-6 col-lg-3">
                <div className="sb-card card-3d-tilt card-spotlight p-4 h-100 d-flex flex-column justify-content-between rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div>
                    <h5 className="fw-bold text-white mb-1">Free</h5>
                    <p className="small mb-3" style={{ color: "#D1D5DB" }}>Perfect for exploring the studio</p>
                    <div className="display-6 fw-bold text-white mb-3">$0<span className="fs-6 fw-normal" style={{ color: "#BFC7D2" }}>/month</span></div>

                    <ul className="list-unstyled d-flex flex-column gap-2 small mb-4" style={{ color: "#D1D5DB" }}>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> AI website generation</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Basic templates</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> SiteGenAI subdomain</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Community support</li>
                    </ul>
                  </div>

                  <Link href="/create" className="sb-btn-outline w-100 text-center py-2">
                    Get Started
                  </Link>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="col-12 col-md-6 col-lg-3">
                <div
                  className="sb-card card-3d-tilt card-spotlight p-4 h-100 d-flex flex-column justify-content-between rounded-4 border position-relative"
                  style={{ backgroundColor: "#151A24", borderColor: "#A3FF6F", boxShadow: "0 0 25px rgba(163, 255, 111, 0.2)" }}
                >
                  <span className="position-absolute top-0 end-0 m-3 badge text-dark fw-bold" style={{ backgroundColor: "#A3FF6F" }}>
                    Most Popular
                  </span>
                  <div>
                    <h5 className="fw-bold text-white mb-1">Pro</h5>
                    <p className="small mb-3" style={{ color: "#D1D5DB" }}>For creators and professionals</p>
                    <div className="display-6 fw-bold text-white mb-3">
                      {billingCycle === "monthly" ? "$12" : "$9"}
                      <span className="fs-6 fw-normal" style={{ color: "#BFC7D2" }}>/month</span>
                    </div>

                    <ul className="list-unstyled d-flex flex-column gap-2 small mb-4">
                      <li className="d-flex align-items-center gap-2 text-white"><Check size={14} className="sb-text-emerald" /> Everything in Free</li>
                      <li className="d-flex align-items-center gap-2 text-white"><Check size={14} className="sb-text-emerald" /> Premium templates (w1 &amp; w2)</li>
                      <li className="d-flex align-items-center gap-2 text-white"><Check size={14} className="sb-text-emerald" /> Custom domain publishing</li>
                      <li className="d-flex align-items-center gap-2 text-white"><Check size={14} className="sb-text-emerald" /> Advanced stock photo search</li>
                      <li className="d-flex align-items-center gap-2 text-white"><Check size={14} className="sb-text-emerald" /> Priority generation</li>
                    </ul>
                  </div>

                  <Link href="/create" className="sb-btn-primary w-100 text-center py-2 btn-magnetic">
                    Start Pro Plan
                  </Link>
                </div>
              </div>

              {/* Business Plan */}
              <div className="col-12 col-md-6 col-lg-3">
                <div className="sb-card card-3d-tilt card-spotlight p-4 h-100 d-flex flex-column justify-content-between rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div>
                    <h5 className="fw-bold text-white mb-1">Business</h5>
                    <p className="small mb-3" style={{ color: "#D1D5DB" }}>For growing teams &amp; brands</p>
                    <div className="display-6 fw-bold text-white mb-3">
                      {billingCycle === "monthly" ? "$29" : "$23"}
                      <span className="fs-6 fw-normal" style={{ color: "#BFC7D2" }}>/month</span>
                    </div>

                    <ul className="list-unstyled d-flex flex-column gap-2 small mb-4" style={{ color: "#D1D5DB" }}>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Everything in Pro</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> E-commerce checkout builder</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Team collaboration seats</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Analytics &amp; SEO tools</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Multilingual localization</li>
                    </ul>
                  </div>

                  <Link href="/create" className="sb-btn-outline w-100 text-center py-2">
                    Start Business Plan
                  </Link>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="col-12 col-md-6 col-lg-3">
                <div className="sb-card card-3d-tilt card-spotlight p-4 h-100 d-flex flex-column justify-content-between rounded-4 border" style={{ backgroundColor: "#151A24", borderColor: "#303947" }}>
                  <div>
                    <h5 className="fw-bold text-white mb-1">Enterprise</h5>
                    <p className="small mb-3" style={{ color: "#D1D5DB" }}>For agencies &amp; organizations</p>
                    <div className="display-6 fw-bold text-white mb-3">Custom</div>

                    <ul className="list-unstyled d-flex flex-column gap-2 small mb-4" style={{ color: "#D1D5DB" }}>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Everything in Business</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Dedicated account manager</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Custom API integrations</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Advanced security &amp; RLS</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Enterprise SLA support</li>
                    </ul>
                  </div>

                  <Link href="/admin" className="sb-btn-outline w-100 text-center py-2">
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================
            10. FINAL CTA
            ====================================================================== */}
        <section className="py-5 position-relative">
          <div className="container py-4 text-center">
            <div
              className="p-5 rounded-4 shadow-2xl text-center mx-auto position-relative overflow-hidden border"
              style={{
                background: "linear-gradient(135deg, rgba(163, 255, 111, 0.15) 0%, #151A24 100%)",
                borderColor: "#303947",
                maxWidth: 960,
              }}
            >
              <span className="badge rounded-pill px-3 py-1 mb-3 fw-semibold" style={{ backgroundColor: "rgba(163, 255, 111, 0.2)", color: "#A3FF6F" }}>
                GET STARTED TODAY
              </span>
              <h2 className="display-4 fw-bold text-white mb-3">Your Next Great Website Starts Here.</h2>
              <p className="lead mb-4 mx-auto" style={{ maxWidth: 600, color: "#D1D5DB" }}>
                Bring your ideas to life with the power of AI. No coding. No limits. Just endless possibilities.
              </p>
              <Link href="/create" className="sb-btn-primary btn-lg px-5 py-3 fs-6 btn-magnetic">
                Start Building for Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
