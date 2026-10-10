"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEMPLATES_REGISTRY } from "@/lib/templates/registry";
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
    id: "terria-world",
    name: "Terria",
    tagline: "Explore The World",
    category: "Blog",
    badge: "Travel & Blog",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    editorId: "proj-zenith-cloud",
    description: "Expedition travel journal with route maps, gear guides, and photo essays.",
  },
];

// Advanced Features from Storyboard (8 Cards)
const ADVANCED_FEATURES = [
  {
    icon: <PenTool size={22} className="text-warning" />,
    title: "AI Content Generation",
    description: "Generate high-quality copy, images and sections with AI.",
  },
  {
    icon: <ImageIcon size={22} className="text-success" />,
    title: "AI Image Generation",
    description: "Create stunning, unique images for your website.",
  },
  {
    icon: <Globe size={22} className="text-primary" />,
    title: "Custom Domain Integration",
    description: "Connect your own domain in minutes.",
  },
  {
    icon: <Search size={22} className="text-info" />,
    title: "Built-in SEO Optimization",
    description: "Get better discoverability with AI-optimized content.",
  },
  {
    icon: <BarChart3 size={22} className="text-warning" />,
    title: "Analytics & Insights",
    description: "Track visitors, traffic and performance in real-time.",
  },
  {
    icon: <Languages size={22} className="text-info" />,
    title: "Multilingual Support",
    description: "Create websites in multiple languages.",
  },
  {
    icon: <ShoppingCart size={22} className="text-success" />,
    title: "E-commerce Ready",
    description: "Add products, payments and manage orders easily.",
  },
  {
    icon: <Users size={22} className="text-primary" />,
    title: "Team Collaboration",
    description: "Invite team members and work together.",
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
    <div className="sb-dark-root min-vh-100 d-flex flex-column font-sans">
      {/* Background Glow Blobs */}
      <div className="sb-glow-blob-emerald top-0 start-0 opacity-40" />
      <div className="sb-glow-blob-gold top-0 end-0 opacity-25" />

      {/* ======================================================================
          1. HEADER & NAVIGATION (Cinematic Storyboard Dark Emerald)
          ====================================================================== */}
      <header
        className="sticky-top py-3 border-bottom position-relative"
        style={{
          backgroundColor: "rgba(4, 18, 12, 0.88)",
          backdropFilter: "blur(14px)",
          borderColor: "rgba(16, 185, 129, 0.16)",
          zIndex: 1040,
        }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <Link href="/" className="text-white text-decoration-none d-flex align-items-center gap-2 fw-bold fs-4">
              <div
                className="rounded-3 p-1 d-flex align-items-center justify-content-center text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", width: 34, height: 34 }}
              >
                <Sparkles size={18} />
              </div>
              <span>
                SiteGen<span className="sb-text-emerald">AI</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="d-none d-lg-flex align-items-center gap-4">
              <Link href="#our-work" className="text-secondary text-decoration-none fw-medium small hover-text-white">
                Product
              </Link>
              <Link href="/templates" className="text-secondary text-decoration-none fw-medium small hover-text-white">
                Templates
              </Link>
              <Link href="#features" className="text-secondary text-decoration-none fw-medium small hover-text-white">
                Features
              </Link>
              <Link href="#pricing" className="text-secondary text-decoration-none fw-medium small hover-text-white">
                Pricing
              </Link>
              <Link href="#how-it-works" className="text-secondary text-decoration-none fw-medium small hover-text-white">
                Resources
              </Link>
            </nav>

            {/* Right CTAs */}
            <div className="d-none d-md-flex align-items-center gap-3">
              <Link href="/login" className="text-white text-decoration-none fw-medium small px-2">
                Sign In
              </Link>
              <Link href="/create" className="sb-btn-primary small">
                Get Started
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-lg-none text-white border-secondary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="d-lg-none pt-3 pb-2 border-top mt-3" style={{ borderColor: "rgba(16, 185, 129, 0.2)" }}>
              <div className="d-flex flex-column gap-2">
                <Link href="/templates" className="text-white py-1 text-decoration-none small" onClick={() => setMobileMenuOpen(false)}>
                  Templates
                </Link>
                <Link href="#features" className="text-white py-1 text-decoration-none small" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </Link>
                <Link href="#pricing" className="text-white py-1 text-decoration-none small" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </Link>
                <Link href="/dashboard" className="text-white py-1 text-decoration-none small" onClick={() => setMobileMenuOpen(false)}>
                  My Dashboard
                </Link>
                <Link href="/admin" className="text-warning py-1 text-decoration-none small" onClick={() => setMobileMenuOpen(false)}>
                  Admin Portal (Dev)
                </Link>
                <div className="d-flex gap-2 pt-2 border-top" style={{ borderColor: "rgba(16, 185, 129, 0.2)" }}>
                  <Link href="/login" className="btn btn-outline-light btn-sm w-50" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/create" className="sb-btn-primary btn-sm w-50" onClick={() => setMobileMenuOpen(false)}>
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
            2. HERO SECTION — "Turn Your Ideas Into Stunning Websites"
            ====================================================================== */}
        <section className="py-5 position-relative overflow-hidden">
          <div className="container py-4 py-lg-5">
            <div className="row justify-content-center text-center">
              <div className="col-12 col-xl-10">
                {/* Badge */}
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4 border" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                  <Sparkles size={14} className="sb-text-emerald" />
                  <span className="small fw-semibold text-white">AI-Powered Website Builder</span>
                </div>

                {/* Headline */}
                <h1 className="display-3 fw-bold mb-3 tracking-tight text-white" style={{ lineHeight: 1.15 }}>
                  Turn Your Ideas <br className="d-none d-sm-block" />
                  Into <span className="sb-text-emerald">Stunning Websites</span>
                </h1>

                {/* Subtitle */}
                <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: 700, fontSize: "1.18rem" }}>
                  Describe your idea, and let AI create a beautiful, customizable website in seconds. No coding. No limits. Just your imagination.
                </p>

                {/* Primary Buttons */}
                <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                  <Link href="/create" className="sb-btn-primary btn-lg px-4 py-3 fs-6">
                    Build with AI <ArrowRight size={18} />
                  </Link>
                  <Link href="/templates" className="sb-btn-outline btn-lg px-4 py-3 fs-6">
                    Explore Templates
                  </Link>
                </div>

                {/* Stats row */}
                <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 mb-5 pt-2">
                  <div className="text-center">
                    <div className="h3 fw-bold text-white mb-0">10K+</div>
                    <div className="small text-secondary">Websites Created</div>
                  </div>
                  <div className="text-center">
                    <div className="h3 fw-bold text-white mb-0 d-flex align-items-center justify-content-center gap-1">
                      <Star size={18} className="text-warning fill-warning" />
                      4.9/5
                    </div>
                    <div className="small text-secondary">User Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="h3 fw-bold text-white mb-0">100%</div>
                    <div className="small text-secondary">No Code Required</div>
                  </div>
                </div>

                {/* Interactive AI Prompt Input Bar */}
                <div className="mx-auto mb-5" style={{ maxWidth: 680 }}>
                  <form onSubmit={handlePromptSubmit} className="sb-prompt-box d-flex align-items-center gap-2">
                    <Sparkles size={18} className="sb-text-gold flex-shrink-0" />
                    <input
                      type="text"
                      className="sb-prompt-input"
                      placeholder="Create a modern e-commerce website for a honey brand..."
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{ width: 40, height: 40, backgroundColor: "#10B981" }}
                      aria-label="Generate website from prompt"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* FLOATING WEBSITE PREVIEWS (From Storyboard) */}
            <div className="position-relative pt-3 pb-4">
              <div className="row g-4 justify-content-center align-items-center">
                {/* Left Preview: SaaS Dashboard Mockup */}
                <div className="col-12 col-md-3 d-none d-lg-block">
                  <div className="sb-card p-3 shadow-lg transform -rotate-2" style={{ transform: "rotate(-3deg)" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                      <span className="small fw-bold text-white">ZenithFlow AI</span>
                      <span className="badge bg-primary-subtle text-primary small">SaaS</span>
                    </div>
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
                      alt="Build Smarter with AI"
                      className="img-fluid rounded-3 mb-2"
                      style={{ maxHeight: 160, objectFit: "cover", width: "100%" }}
                    />
                    <div className="small fw-semibold text-white">Build Smarter with AI</div>
                    <div className="small text-secondary" style={{ fontSize: "0.78rem" }}>Real-time telemetry pipeline</div>
                  </div>
                </div>

                {/* Center Main Preview: HoneyNest Hero Card */}
                <div className="col-12 col-lg-6">
                  <div
                    className="sb-card p-4 shadow-2xl position-relative overflow-hidden border border-emerald"
                    style={{ borderColor: "rgba(16, 185, 129, 0.4)", background: "rgba(10, 36, 24, 0.85)" }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                      <div className="d-flex align-items-center gap-2">
                        <span className="p-1 rounded bg-warning text-dark fw-bold small">🍯</span>
                        <span className="fw-bold text-white">HoneyNest</span>
                      </div>
                      <div className="d-flex gap-3 small text-secondary">
                        <span>Home</span>
                        <span>Shop</span>
                        <span>About</span>
                      </div>
                    </div>

                    <div className="row align-items-center g-3">
                      <div className="col-12 col-sm-6 text-start">
                        <span className="badge bg-warning text-dark mb-2 fw-semibold">100% Raw & Organic</span>
                        <h3 className="fw-bold text-white mb-2">Pure Nature in Every Drop</h3>
                        <p className="small text-secondary mb-3">Premium organic honey straight from nature to your home.</p>
                        <Link href="/editor/proj-w1-cocopour" className="btn btn-warning btn-sm text-dark fw-bold px-3 py-2 rounded-pill shadow-xs">
                          Shop Now &rarr;
                        </Link>
                      </div>
                      <div className="col-12 col-sm-6 text-center position-relative">
                        <div
                          className="rounded-4 overflow-hidden shadow-lg border position-relative"
                          style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}
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

                    {/* Bottom floating sticker */}
                    <div className="position-absolute bottom-0 end-0 m-3 d-none d-sm-block">
                      <span className="badge bg-emerald text-white p-2 rounded-pill shadow small" style={{ backgroundColor: "#10B981" }}>
                        ✨ Turn ideas into reality
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Preview: Creative Portfolio Portrait */}
                <div className="col-12 col-md-3 d-none d-lg-block">
                  <div className="sb-card p-3 shadow-lg" style={{ transform: "rotate(3deg)" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                      <span className="small fw-bold text-white">Alex Atelier</span>
                      <span className="badge bg-success-subtle text-success small">Portfolio</span>
                    </div>
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                      alt="Creative Portfolio"
                      className="img-fluid rounded-3 mb-2"
                      style={{ maxHeight: 160, objectFit: "cover", width: "100%" }}
                    />
                    <div className="small fw-semibold text-white">Design Create Inspire</div>
                    <div className="small text-secondary" style={{ fontSize: "0.78rem" }}>Spatial visual director</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================
            3. SECTION 2: OUR WORK — "From Imagination to Reality"
            ====================================================================== */}
        <section id="our-work" className="py-5 sb-bg-forest-alt position-relative border-top border-bottom" style={{ borderColor: "rgba(16, 185, 129, 0.12)" }}>
          <div className="container py-4">
            <div className="text-center mb-5">
              <span className="badge rounded-pill px-3 py-1 mb-2 text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                OUR WORK
              </span>
              <h2 className="display-5 fw-bold text-white mb-2">From Imagination to Reality</h2>
              <p className="text-secondary lead mx-auto" style={{ maxWidth: 650 }}>
                Explore amazing websites created with SiteGenAI. Different ideas. Infinite possibilities.
              </p>

              {/* Category Filter Pills */}
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
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
                  <div className="sb-card h-100 overflow-hidden d-flex flex-column justify-content-between p-3">
                    <div>
                      <div className="position-relative rounded-3 overflow-hidden mb-3" style={{ height: 210 }}>
                        <img
                          src={proj.image}
                          alt={proj.name}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                        <span className="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75 text-white border border-secondary border-opacity-50 small">
                          {proj.badge}
                        </span>
                      </div>
                      <h4 className="fw-bold text-white mb-1 fs-5">{proj.name}</h4>
                      <h6 className="sb-text-emerald small fw-semibold mb-2">{proj.tagline}</h6>
                      <p className="small text-secondary mb-3">{proj.description}</p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary border-opacity-25">
                      <span className="small text-white-50">{proj.category}</span>
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
            4. SECTION 3: HOW SITEGENAI WORKS — "3 Simple Steps"
            ====================================================================== */}
        <section id="how-it-works" className="py-5 position-relative">
          <div className="container py-4">
            <div className="text-center mb-5">
              <span className="badge rounded-pill px-3 py-1 mb-2 text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                HOW SITEGENAI WORKS
              </span>
              <h2 className="display-5 fw-bold text-white mb-2">
                Turn Your Idea Into a Live Website <br />
                in <span className="sb-text-emerald">3 Simple Steps</span>
              </h2>
              <p className="text-secondary lead">Simple • Fast • Powerful</p>
            </div>

            <div className="row g-4 align-items-stretch">
              {/* Step 1 */}
              <div className="col-12 col-md-4">
                <div className="sb-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="p-3 rounded-circle text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                        <MessageSquare size={24} className="sb-text-emerald" />
                      </div>
                      <span className="fs-3 fw-bold text-white-50">01</span>
                    </div>
                    <h4 className="fw-bold text-white mb-2">Describe Your Idea</h4>
                    <p className="text-secondary small mb-4">
                      Simply tell us what kind of website you want. Be as detailed as you like.
                    </p>
                  </div>

                  {/* Step 1 Interactive Card */}
                  <div className="p-3 rounded-3 border bg-dark bg-opacity-50" style={{ borderColor: "rgba(16, 185, 129, 0.2)" }}>
                    <div className="small text-white-50 mb-1">Example Prompt:</div>
                    <div className="small text-white font-monospace mb-2">
                      "Create a modern e-commerce website for a honey brand..."
                    </div>
                    <Link href="/create" className="btn btn-sm btn-outline-success w-100 rounded-pill py-1 small">
                      Try This Prompt &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="col-12 col-md-4">
                <div className="sb-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="p-3 rounded-circle text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                        <Layout size={24} className="sb-text-emerald" />
                      </div>
                      <span className="fs-3 fw-bold text-white-50">02</span>
                    </div>
                    <h4 className="fw-bold text-white mb-2">Customize Your Design</h4>
                    <p className="text-secondary small mb-4">
                      Fine-tune with our visual editor. Change content, images, colors, and more.
                    </p>
                  </div>

                  {/* Step 2 Mini Editor Card */}
                  <div className="p-3 rounded-3 border bg-dark bg-opacity-50" style={{ borderColor: "rgba(16, 185, 129, 0.2)" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-white fw-bold">Live Visual Canvas</span>
                      <span className="badge bg-success-subtle text-success small">Editing</span>
                    </div>
                    <div className="d-flex gap-1 mb-2">
                      <span className="p-2 rounded-circle" style={{ backgroundColor: "#10B981", width: 14, height: 14 }} />
                      <span className="p-2 rounded-circle" style={{ backgroundColor: "#F59E0B", width: 14, height: 14 }} />
                      <span className="p-2 rounded-circle" style={{ backgroundColor: "#061A12", width: 14, height: 14 }} />
                      <span className="p-2 rounded-circle" style={{ backgroundColor: "#FFFFFF", width: 14, height: 14 }} />
                    </div>
                    <Link href="/editor/proj-w1-cocopour" className="btn btn-sm btn-outline-light w-100 rounded-pill py-1 small">
                      Explore Visual Editor &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="col-12 col-md-4">
                <div className="sb-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="p-3 rounded-circle text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                        <Rocket size={24} className="sb-text-emerald" />
                      </div>
                      <span className="fs-3 fw-bold text-white-50">03</span>
                    </div>
                    <h4 className="fw-bold text-white mb-2">Publish Your Website</h4>
                    <p className="text-secondary small mb-4">
                      Launch your website with one click and share it with the world.
                    </p>
                  </div>

                  {/* Step 3 Live Launch Card */}
                  <div className="p-3 rounded-3 border bg-dark bg-opacity-50 text-center" style={{ borderColor: "rgba(16, 185, 129, 0.2)" }}>
                    <div className="small fw-bold text-white mb-1">Your Website is Live! 🚀</div>
                    <div className="p-2 rounded bg-black bg-opacity-50 font-monospace text-emerald small d-flex align-items-center justify-content-between mb-2">
                      <span style={{ fontSize: "0.78rem" }}>https://honeynest.sitegenai.app</span>
                      <button type="button" className="btn btn-xs btn-link p-0 text-white" onClick={copyLiveDemoUrl}>
                        {copiedUrl ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <Link href="/dashboard" className="btn btn-sm sb-btn-primary w-100 py-1 small">
                      View Live Project
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================
            5. SECTION 4: ADVANCED FEATURES — "Everything You Need to Build"
            ====================================================================== */}
        <section id="features" className="py-5 sb-bg-forest-alt border-top border-bottom" style={{ borderColor: "rgba(16, 185, 129, 0.12)" }}>
          <div className="container py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
              <div>
                <span className="badge rounded-pill px-3 py-1 mb-2 text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                  ADVANCED FEATURES
                </span>
                <h2 className="display-5 fw-bold text-white mb-2">
                  Everything You Need to <span className="sb-text-emerald">Build, Grow and Scale</span>
                </h2>
                <p className="text-secondary lead mb-0" style={{ maxWidth: 640 }}>
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
                  <div className="sb-card p-4 h-100">
                    <div className="p-3 rounded-3 d-inline-flex mb-3" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                      {feat.icon}
                    </div>
                    <h5 className="fw-bold text-white mb-2 fs-6">{feat.title}</h5>
                    <p className="text-secondary small mb-0">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================
            6. SECTION 5: BEAUTIFUL TEMPLATES — "Professionally Designed"
            ====================================================================== */}
        <section id="templates" className="py-5 position-relative">
          <div className="container py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
              <div>
                <span className="badge rounded-pill px-3 py-1 mb-2 text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                  BEAUTIFUL TEMPLATES
                </span>
                <h2 className="display-5 fw-bold text-white mb-2">Professionally Designed Templates</h2>
                <p className="text-secondary lead mb-0">Kickstart your website with stunning, fully customizable templates.</p>
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
                  <div className="sb-card h-100 overflow-hidden d-flex flex-column justify-content-between p-3">
                    <div>
                      <div className="position-relative rounded-3 overflow-hidden mb-3" style={{ height: 220 }}>
                        <img
                          src={tpl.thumbnail}
                          alt={tpl.name}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                        <span className="position-absolute top-0 end-0 m-2 badge bg-primary text-white shadow-xs">
                          {tpl.previewBadge || "Featured"}
                        </span>
                      </div>
                      <h4 className="fw-bold text-white mb-1 fs-5">{tpl.name}</h4>
                      <h6 className="sb-text-emerald small fw-semibold mb-2">{tpl.tagline}</h6>
                      <p className="small text-secondary mb-3">{tpl.description}</p>
                    </div>

                    <div className="d-flex gap-2 pt-3 border-top border-secondary border-opacity-25">
                      <Link href={`/editor/proj-${tpl.id}`} className="btn btn-sm sb-btn-primary flex-grow-1 py-2">
                        Customize in Studio
                      </Link>
                      <a
                        href={tpl.previewPath || `/templates`}
                        target={tpl.previewPath ? "_blank" : "_self"}
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-secondary text-white border-secondary px-3"
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
            7. SECTION 6: MEET OUR TEAM — "Meet the Team Behind the Magic"
            ====================================================================== */}
        <section id="team" className="py-5 sb-bg-forest-alt border-top border-bottom" style={{ borderColor: "rgba(16, 185, 129, 0.12)" }}>
          <div className="container py-4">
            <div className="text-center mb-5">
              <span className="badge rounded-pill px-3 py-1 mb-2 text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                OUR TEAM
              </span>
              <h2 className="display-5 fw-bold text-white mb-2">
                Meet the Team Behind <span className="sb-text-emerald">the Magic</span>
              </h2>
              <p className="text-secondary lead mx-auto" style={{ maxWidth: 650 }}>
                People • Passion • Possibilities | Building tools that turn imagination into reality.
              </p>
              <small className="text-muted d-block mt-1">(Demonstration Profiles for Project Presentation)</small>
            </div>

            <div className="row g-4">
              {TEAM_MEMBERS.map((member, idx) => (
                <div key={idx} className="col-12 col-sm-6 col-lg-3">
                  <div className="sb-card p-4 text-center h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="position-relative mx-auto rounded-circle overflow-hidden mb-3 shadow" style={{ width: 110, height: 110, border: "2px solid #10B981" }}>
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <h5 className="fw-bold text-white mb-1">{member.name}</h5>
                      <div className="sb-text-emerald small fw-semibold mb-2">{member.role}</div>
                      <p className="small text-secondary mb-3">{member.bio}</p>
                    </div>

                    <div className="d-flex justify-content-center gap-3 pt-3 border-top border-secondary border-opacity-25 text-secondary">
                      <span className="small text-white-50 cursor-pointer">LinkedIn</span>
                      <span>&bull;</span>
                      <span className="small text-white-50 cursor-pointer">X</span>
                      <span>&bull;</span>
                      <span className="small text-white-50 cursor-pointer">GitHub</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================
            8. SECTION 7: WHAT OUR USERS SAY — "Loved by Creators"
            ====================================================================== */}
        <section id="testimonials" className="py-5 position-relative">
          <div className="container py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
              <div>
                <span className="badge rounded-pill px-3 py-1 mb-2 text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                  WHAT OUR USERS SAY
                </span>
                <h2 className="display-5 fw-bold text-white mb-2">
                  Loved by <span className="sb-text-emerald">Creators, Founders and Businesses</span>
                </h2>
              </div>

              {/* Navigation arrows */}
              <div className="d-flex gap-2 mt-3 mt-md-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-circle p-2 text-white border-secondary"
                  onClick={() => setTestimonialIndex((testimonialIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-circle p-2 text-white border-secondary"
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
                  <div className="sb-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex gap-1 text-warning mb-3">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                        ))}
                      </div>
                      <p className="text-secondary mb-4 fs-6">"{t.quote}"</p>
                    </div>

                    <div className="d-flex align-items-center gap-3 pt-3 border-top border-secondary border-opacity-25">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="rounded-circle"
                        style={{ width: 44, height: 44, objectFit: "cover" }}
                      />
                      <div>
                        <div className="fw-bold text-white small">{t.name}</div>
                        <div className="text-secondary small" style={{ fontSize: "0.78rem" }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================
            9. SECTION 8: SIMPLE & TRANSPARENT PRICING — "Choose the Plan"
            ====================================================================== */}
        <section id="pricing" className="py-5 sb-bg-forest-alt border-top border-bottom" style={{ borderColor: "rgba(16, 185, 129, 0.12)" }}>
          <div className="container py-4">
            <div className="text-center mb-5">
              <span className="badge rounded-pill px-3 py-1 mb-2 text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                SIMPLE &amp; TRANSPARENT PRICING
              </span>
              <h2 className="display-5 fw-bold text-white mb-2">
                Choose the Plan That <span className="sb-text-emerald">Fits You</span>
              </h2>

              {/* Monthly / Yearly Toggle */}
              <div className="d-inline-flex align-items-center p-1 rounded-pill bg-dark border border-secondary border-opacity-25 mt-3">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-4 ${billingCycle === "monthly" ? "sb-btn-primary" : "text-secondary"}`}
                  onClick={() => setBillingCycle("monthly")}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-4 position-relative ${billingCycle === "yearly" ? "sb-btn-primary" : "text-secondary"}`}
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
                <div className="sb-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold text-white mb-1">Free</h5>
                    <p className="text-secondary small mb-3">Perfect for getting started</p>
                    <div className="display-6 fw-bold text-white mb-3">$0<span className="fs-6 text-secondary fw-normal">/month</span></div>

                    <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary mb-4">
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

              {/* Pro Plan (Most Popular) */}
              <div className="col-12 col-md-6 col-lg-3">
                <div className="sb-card p-4 h-100 d-flex flex-column justify-content-between border-emerald position-relative" style={{ borderColor: "#10B981" }}>
                  <span className="position-absolute top-0 end-0 m-3 badge bg-emerald text-white" style={{ backgroundColor: "#10B981" }}>
                    Most Popular
                  </span>
                  <div>
                    <h5 className="fw-bold text-white mb-1">Pro</h5>
                    <p className="text-secondary small mb-3">For creators and professionals</p>
                    <div className="display-6 fw-bold text-white mb-3">
                      {billingCycle === "monthly" ? "$12" : "$9"}
                      <span className="fs-6 text-secondary fw-normal">/month</span>
                    </div>

                    <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary mb-4">
                      <li className="d-flex align-items-center gap-2 text-white"><Check size={14} className="sb-text-emerald" /> Everything in Free</li>
                      <li className="d-flex align-items-center gap-2 text-white"><Check size={14} className="sb-text-emerald" /> Premium templates (w1 included)</li>
                      <li className="d-flex align-items-center gap-2 text-white"><Check size={14} className="sb-text-emerald" /> Custom domain</li>
                      <li className="d-flex align-items-center gap-2 text-white"><Check size={14} className="sb-text-emerald" /> Advanced AI features</li>
                      <li className="d-flex align-items-center gap-2 text-white"><Check size={14} className="sb-text-emerald" /> Priority support</li>
                    </ul>
                  </div>

                  <Link href="/create" className="sb-btn-primary w-100 text-center py-2">
                    Start Pro Plan
                  </Link>
                </div>
              </div>

              {/* Business Plan */}
              <div className="col-12 col-md-6 col-lg-3">
                <div className="sb-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold text-white mb-1">Business</h5>
                    <p className="text-secondary small mb-3">For growing businesses</p>
                    <div className="display-6 fw-bold text-white mb-3">
                      {billingCycle === "monthly" ? "$29" : "$23"}
                      <span className="fs-6 text-secondary fw-normal">/month</span>
                    </div>

                    <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary mb-4">
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Everything in Pro</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> E-commerce features</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Team collaboration</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Analytics &amp; SEO tools</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Multilingual support</li>
                    </ul>
                  </div>

                  <Link href="/create" className="sb-btn-outline w-100 text-center py-2">
                    Start Business Plan
                  </Link>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="col-12 col-md-6 col-lg-3">
                <div className="sb-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold text-white mb-1">Enterprise</h5>
                    <p className="text-secondary small mb-3">For large teams &amp; agencies</p>
                    <div className="display-6 fw-bold text-white mb-3">Custom</div>

                    <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary mb-4">
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Everything in Business</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Dedicated account manager</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Custom integrations</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> Advanced security &amp; RLS</li>
                      <li className="d-flex align-items-center gap-2"><Check size={14} className="sb-text-emerald" /> SLA support</li>
                    </ul>
                  </div>

                  <Link href="/admin" className="sb-btn-outline w-100 text-center py-2">
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <small className="text-muted">
                Note: Plans represent architectural capability tiers. Live payments are disabled for local and evaluation demonstration.
              </small>
            </div>
          </div>
        </section>

        {/* ======================================================================
            10. SECTION 9 & 10: FINAL CTA & COMPREHENSIVE FOOTER
            ====================================================================== */}
        <section className="py-5 position-relative">
          <div className="container py-4 text-center">
            <div
              className="p-5 rounded-4 shadow-xl text-center mx-auto position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 26, 18, 0.95) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                maxWidth: 960,
              }}
            >
              <span className="badge rounded-pill px-3 py-1 mb-3 text-white" style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}>
                GET STARTED TODAY
              </span>
              <h2 className="display-4 fw-bold text-white mb-3">Your Next Great Website Starts Here.</h2>
              <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: 600 }}>
                Bring your ideas to life with the power of AI. No coding. No limits. Just endless possibilities.
              </p>
              <Link href="/create" className="sb-btn-primary btn-lg px-5 py-3 fs-6">
                Start Building for Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-5 border-top" style={{ backgroundColor: "#020B07", borderColor: "rgba(16, 185, 129, 0.15)" }}>
        <div className="container">
          <div className="row g-4 justify-content-between mb-4">
            <div className="col-12 col-lg-4">
              <Link href="/" className="text-white text-decoration-none d-flex align-items-center gap-2 fw-bold fs-5 mb-3">
                <div
                  className="rounded-3 p-1 d-flex align-items-center justify-content-center text-white"
                  style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", width: 28, height: 28 }}
                >
                  <Sparkles size={16} />
                </div>
                <span>
                  SiteGen<span className="sb-text-emerald">AI</span>
                </span>
              </Link>
              <p className="text-secondary small mb-3" style={{ maxWidth: 320 }}>
                Turn your ideas into stunning websites with the power of AI. Built for creators, founders, and engineers.
              </p>
              <div className="d-flex gap-3 text-secondary small">
                <span className="cursor-pointer">LinkedIn</span>
                <span className="cursor-pointer">X (Twitter)</span>
                <span className="cursor-pointer">GitHub</span>
              </div>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6 className="fw-bold text-white small mb-3">Product</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary">
                <li><Link href="#features" className="text-secondary text-decoration-none">Features</Link></li>
                <li><Link href="/templates" className="text-secondary text-decoration-none">Templates</Link></li>
                <li><Link href="#pricing" className="text-secondary text-decoration-none">Pricing</Link></li>
                <li><Link href="/admin" className="text-warning text-decoration-none">Admin Portal</Link></li>
              </ul>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6 className="fw-bold text-white small mb-3">Resources</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary">
                <li><Link href="#how-it-works" className="text-secondary text-decoration-none">Overview</Link></li>
                <li><Link href="/dashboard" className="text-secondary text-decoration-none">Dashboard</Link></li>
                <li><Link href="/create" className="text-secondary text-decoration-none">Creation Studio</Link></li>
                <li><Link href="/editor/proj-w1-cocopour" className="text-secondary text-decoration-none">COCO POUR</Link></li>
              </ul>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6 className="fw-bold text-white small mb-3">Company</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary">
                <li><Link href="#team" className="text-secondary text-decoration-none">About</Link></li>
                <li><Link href="#team" className="text-secondary text-decoration-none">Careers</Link></li>
                <li><Link href="#pricing" className="text-secondary text-decoration-none">Contact</Link></li>
                <li><Link href="/admin" className="text-secondary text-decoration-none">Press</Link></li>
              </ul>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6 className="fw-bold text-white small mb-3">Legal</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary">
                <li><span className="text-secondary">Privacy Policy</span></li>
                <li><span className="text-secondary">Terms of Service</span></li>
                <li><span className="text-secondary">Cookie Policy</span></li>
              </ul>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between pt-4 border-top border-secondary border-opacity-25 small text-secondary">
            <div>&copy; {new Date().getFullYear()} SiteGenAI. All rights reserved. Imagine it. Design it. Make it yours.</div>
            <div className="mt-2 mt-sm-0">
              <span className="badge bg-dark text-success border border-success border-opacity-25">TRICITY Evaluation Build</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
