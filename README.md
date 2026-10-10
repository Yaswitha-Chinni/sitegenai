# SiteGenAI — Imagine it. Design it. Make it yours.

> Next-Generation Full-Stack AI Website Builder & Visual Atelier. Built for creators, founders, and engineering teams.

---

## 🌟 Overview & Mission

**SiteGenAI** enables users to describe any brand or business concept in plain English and automatically synthesizes a fully structured, customizable website with **at least eight meaningful sections** (including Header, Hero, Story, Offerings, Features, Media Gallery, Testimonials, FAQ, and Footer).

- **Cinematic Marketing Hub:** Deep forest-green SaaS aesthetic with emerald and warm-gold accents.
- **AI Architecture:** Multimodal synthesis via Google Gemini (`gemini-3.8-flash`) with automatic bounded repair and structural validation.
- **Interactive Visual Editor:** Live canvas editing with real-time typography, palette adjustments, section toggling, reordering, and asset uploads.
- **Official Template Integration:** Preserves and registers the **COCO POUR (`w1`)** video website experience with high-definition MP4 streaming.
- **Zero Lock-In ZIP Export:** Generates standalone HTML5, CSS3, and JavaScript packages with Python/Node local run scripts.
- **Admin Control Plane:** Localhost telemetry dashboard for server health, database records, and AI pipeline status.

---

## 🚀 Quick Start (Localhost Run)

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v24.11)
- **NPM**: v9+

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd SiteGenAI/sitegenai

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the `sitegenai` root:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase PostgreSQL (Optional — Leave empty to use Browser LocalStorage Dev Mode)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Admin Dashboard & Local Database Inspection

- **Admin URL:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Email:** `admin@sitegenai.local`
- **Password:** `admin123`
- **Quick Access:** The login page features a 1-click **Quick Admin Login** button for instant dev authentication.

### Inspecting Database on Localhost:
1. **Method 1 (Admin Explorer):** Go to [http://localhost:3000/admin](http://localhost:3000/admin) &rarr; Click **Database Explorer** &rarr; Inspect live JSON records or click **Export DB Dump (JSON)**.
2. **Method 2 (DevTools Console):** Press `F12` on [http://localhost:3000](http://localhost:3000), open Console, and run:
   ```javascript
   console.table(JSON.parse(localStorage.getItem('sitegenai_projects_v1')));
   ```
3. **Method 3 (Supabase PostgreSQL):** Schema is available in `supabase/schema.sql` for local Supabase CLI or cloud deployment.

---

## 🧪 Automated Testing

SiteGenAI includes an automated test suite verifying critical routes, AI blueprint section count, standalone export packaging, and database CRUD operations:

```bash
node tests/e2e-eval.test.mjs
```

Type checking:
```bash
npx tsc --noEmit
```

---

## 🏛️ Application Architecture

```
sitegenai/
├── app/
│   ├── page.tsx               # Cinematic Emerald SaaS Landing Page (10 Sections)
│   ├── templates/             # Filterable Template Catalog (w1 registered)
│   ├── create/                # AI Prompt Studio with Asset Uploader & Blueprint Review
│   ├── dashboard/             # Project Management & Local Storage Hub
│   ├── editor/[projectId]/    # Live Visual Canvas Editor with Device Viewport Switcher
│   ├── admin/                 # Admin Control Plane & Database Explorer
│   └── api/
│       ├── ai/plan/           # Gemini AI Website Blueprint Planning (>=8 Sections)
│       ├── ai/generate/       # Gemini AI Full Copywriting & Layout Synthesis
│       ├── export/            # Standalone ZIP Generation (JSZip)
│       ├── projects/          # CRUD Persistence & Local Socket Port Checker
│       ├── upload/            # Multipart Asset Uploader
│       └── admin/stats/       # Server Telemetry & Disk Health
├── components/
│   ├── layout/                # Responsive Navbar & Footer
│   ├── preview/               # Live SectionRenderer (Header, Hero, Story, Gallery, etc.)
│   └── ui/                    # AssetUploader, ProjectSettingsModal, VideoGeneratorModal
├── lib/
│   ├── ai/gemini.ts           # Google GenAI SDK Client & Section Enforcer
│   ├── projects/              # Project Persistence Service & Server Sync
│   └── templates/registry.ts  # Catalog Registry with w1 COCO POUR Integration
├── public/templates/w1/       # Verified COCO POUR Video Assets (vid1-4.mp4, logo)
├── supabase/schema.sql        # Relational PostgreSQL DDL with RLS Policies
└── tests/e2e-eval.test.mjs    # End-to-End Evaluation Test Suite
```

---

## 📄 Standalone Export Structure

When exporting any website project as a ZIP archive:
```
exported-website/
├── index.html       # Clean semantic HTML5 with Bootstrap 5.3 & custom styling
├── styles.css       # Scoped theme variables, responsive typography, and animations
├── script.js        # Interactive handlers and DOM event listeners
├── package.json     # Ready to run with 'npx serve'
└── README.md        # Copyable Python (python -m http.server) & Node.js launch commands
```

---

## ⚖️ License
Proprietary — SiteGenAI Evaluation Project.
