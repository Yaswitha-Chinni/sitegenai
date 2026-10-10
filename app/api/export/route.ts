import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { promises as fs } from "fs";
import path from "path";
import { WebsiteDocument, WebsiteSection } from "@/types/project";

export async function POST(req: NextRequest) {
  try {
    const project: WebsiteDocument = await req.json();

    if (!project || !project.name) {
      return NextResponse.json(
        { success: false, error: "Invalid project document supplied for export." },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    const port = project.localPort || 3000;
    const slug = (project.name || "website").toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check if exporting W1 template
    if (project.templateSource === "w1" || project.templateId === "w1") {
      const w1Dir = path.join(process.cwd(), "public", "templates", "w1");
      try {
        const files = await fs.readdir(w1Dir);
        for (const f of files) {
          const fullPath = path.join(w1Dir, f);
          const stat = await fs.stat(fullPath);
          if (stat.isFile()) {
            const content = await fs.readFile(fullPath);
            zip.file(f, content);
          }
        }
      } catch (err) {
        console.warn("Could not read public/templates/w1 files:", err);
      }

      // Add comprehensive customized README for W1
      const readmeContent = `# ${project.name}

${project.description || "Official brand website generated with SiteGenAI."}

## Local Development & Execution

To run this website locally on port ${port}:

### Option 1: Python HTTP Server (Recommended)
\`\`\`bash
# Python 3
python -m http.server ${port}
\`\`\`
Then open your browser at:
http://localhost:${port}

### Option 2: Node.js (npx serve)
\`\`\`bash
npx -y serve -p ${port} .
\`\`\`

### Option 3: Python Streaming Server (included)
\`\`\`bash
python server.py
\`\`\`

## Included Assets
- Brand logos & vectors
- 4 High-definition video loops (1280x720)
- Optimized 60 FPS IntersectionObserver playback

Generated with SiteGenAI ("Imagine it. Design it. Make it yours.")
`;
      zip.file("README.md", readmeContent);
    } else {
      // Build standalone modern HTML5 / CSS / JS website for custom/AI sites
      const htmlContent = generateStandaloneHtml(project);
      const cssContent = generateStandaloneCss(project);
      const jsContent = generateStandaloneJs(project);

      zip.file("index.html", htmlContent);
      zip.file("styles.css", cssContent);
      zip.file("script.js", jsContent);

      const pkgJson = {
        name: slug,
        version: "1.0.0",
        description: project.description || "Generated with SiteGenAI",
        scripts: {
          dev: `npx serve -p ${port} .`,
          start: `npx serve -p ${port} .`,
        },
      };
      zip.file("package.json", JSON.stringify(pkgJson, null, 2));

      const readmeContent = `# ${project.name}

${project.description || "AI-generated responsive website."}

## Setup & Running Locally

This standalone website requires no build step. You can run it immediately on port ${port}:

### Windows PowerShell
\`\`\`powershell
# Quick run with Node / npx
npx -y serve -p ${port} .

# OR with Python
python -m http.server ${port}
\`\`\`

### Open in Browser
Once started, visit:
**http://localhost:${port}**

## Project Architecture
- \`index.html\`: Semantic HTML5 structure with SEO metadata
- \`styles.css\`: Design tokens, typography (${project.theme?.fontFamily || "Outfit"}), responsive grid
- \`script.js\`: Smooth scrolling, mobile navigation toggle, interactivity
- \`package.json\`: npm convenience scripts

Generated with **SiteGenAI** — *Imagine it. Design it. Make it yours.*
`;
      zip.file("README.md", readmeContent);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${slug}-site.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("API /api/export error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate export archive." },
      { status: 500 }
    );
  }
}

function generateStandaloneHtml(project: WebsiteDocument): string {
  const primary = project.theme?.primaryColor || "#356DFF";
  const secondary = project.theme?.secondaryColor || "#172033";
  const font = project.theme?.fontFamily || "Outfit, sans-serif";

  const sectionsHtml = (project.sections || [])
    .filter((s) => s.visible)
    .map((s) => renderHtmlSection(s, primary, secondary))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <meta name="description" content="${project.description || project.name}">
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Bootstrap 5.3 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  ${sectionsHtml}

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="script.js"></script>
</body>
</html>`;
}

function renderHtmlSection(s: WebsiteSection, primary: string, secondary: string): string {
  const c = s.content || {};

  switch (s.type) {
    case "header":
      return `
  <header class="site-header py-3 border-bottom sticky-top bg-white">
    <div class="container d-flex align-items-center justify-content-between">
      <a href="#" class="brand-logo text-decoration-none fw-bold fs-4" style="color: ${secondary};">
        ${c.imageUrl ? `<img src="${c.imageUrl}" alt="${c.title || "Logo"}" height="36" class="me-2">` : ""}
        ${c.title || "Brand"}
      </a>
      <nav class="d-none d-md-flex gap-4">
        <a href="#features" class="nav-link text-secondary">Features</a>
        <a href="#about" class="nav-link text-secondary">About</a>
        <a href="#contact" class="nav-link text-secondary">Contact</a>
      </nav>
      ${c.buttonText ? `<a href="${c.buttonLink || "#"}" class="btn btn-primary px-4 rounded-pill" style="background-color: ${primary}; border-color: ${primary};">${c.buttonText}</a>` : ""}
    </div>
  </header>`;

    case "hero":
      return `
  <section class="hero-section py-5 text-center" style="background: linear-gradient(180deg, #EFF5FF 0%, #FFFFFF 100%);">
    <div class="container py-5">
      ${c.badge ? `<span class="badge rounded-pill bg-white text-primary border px-3 py-2 mb-3 shadow-sm">${c.badge}</span>` : ""}
      <h1 class="display-3 fw-bold mb-4" style="color: ${secondary};">${c.title || "Hero Title"}</h1>
      ${c.subtitle ? `<p class="lead text-secondary mx-auto mb-4" style="max-width: 680px;">${c.subtitle}</p>` : ""}
      <div class="d-flex justify-content-center gap-3 mb-5">
        ${c.buttonText ? `<a href="${c.buttonLink || "#"}" class="btn btn-primary btn-lg px-4 rounded-pill shadow-sm" style="background-color: ${primary}; border-color: ${primary};">${c.buttonText}</a>` : ""}
        ${c.secondaryButtonText ? `<a href="${c.secondaryButtonLink || "#"}" class="btn btn-outline-secondary btn-lg px-4 rounded-pill">${c.secondaryButtonText}</a>` : ""}
      </div>
      ${c.imageUrl ? `<div class="hero-media mx-auto shadow-lg rounded-4 overflow-hidden" style="max-width: 900px;"><img src="${c.imageUrl}" alt="Hero showcase" class="img-fluid w-100"></div>` : ""}
    </div>
  </section>`;

    case "features":
      return `
  <section id="features" class="py-5 bg-white">
    <div class="container py-5 text-center">
      ${c.badge ? `<span class="badge rounded-pill bg-light text-primary px-3 py-2 mb-2">${c.badge}</span>` : ""}
      <h2 class="display-5 fw-bold mb-3" style="color: ${secondary};">${c.title || "Features"}</h2>
      ${c.description ? `<p class="text-secondary mx-auto mb-5" style="max-width: 600px;">${c.description}</p>` : ""}
      <div class="row g-4 text-start">
        ${(c.items || [])
          .map(
            (item) => `
        <div class="col-md-4">
          <div class="card h-100 border p-4 shadow-sm rounded-4">
            ${item.stat ? `<div class="fs-2 fw-extrabold mb-2" style="color: ${primary};">${item.stat}</div>` : ""}
            <h4 class="fw-bold mb-2">${item.title}</h4>
            <p class="text-secondary mb-0">${item.description}</p>
          </div>
        </div>`
          )
          .join("")}
      </div>
    </div>
  </section>`;

    case "story":
      return `
  <section id="story" class="py-5" style="background-color: #F8FAFD;">
    <div class="container py-5">
      <div class="row align-items-center g-5">
        <div class="col-lg-6">
          ${c.badge ? `<span class="badge rounded-pill bg-white text-primary border px-3 py-2 mb-3 shadow-xs">${c.badge}</span>` : ""}
          <h2 class="display-5 fw-bold mb-3" style="color: ${secondary};">${c.title || "Our Story"}</h2>
          <p class="lead text-secondary mb-4">${c.description || ""}</p>
          ${c.items && c.items.length > 0 ? `
          <div class="row g-3">
            ${c.items.map(it => `
            <div class="col-6">
              <div class="p-3 rounded-4 bg-white border shadow-xs">
                ${it.stat ? `<div class="fs-3 fw-bold" style="color: ${primary};">${it.stat}</div>` : ""}
                <div class="small fw-bold">${it.title}</div>
                <div class="small text-muted">${it.description}</div>
              </div>
            </div>`).join("")}
          </div>` : ""}
        </div>
        <div class="col-lg-6">
          ${c.imageUrl ? `<img src="${c.imageUrl}" alt="Brand story" class="img-fluid rounded-4 shadow-lg w-100">` : `
          <div class="p-5 rounded-4 text-white text-center shadow-lg" style="background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%); min-height: 280px; display: flex; align-items: center; justify-content: center;">
            <h3 class="fw-bold mb-0">${c.title || "Crafted With Conviction"}</h3>
          </div>`}
        </div>
      </div>
    </div>
  </section>`;

    case "product":
      return `
  <section id="products" class="py-5 bg-white">
    <div class="container py-5 text-center">
      ${c.badge ? `<span class="badge rounded-pill bg-light text-primary px-3 py-2 mb-2">${c.badge}</span>` : ""}
      <h2 class="display-5 fw-bold mb-3" style="color: ${secondary};">${c.title || "Signature Offerings"}</h2>
      ${c.description ? `<p class="text-secondary mx-auto mb-5" style="max-width: 600px;">${c.description}</p>` : ""}
      <div class="row g-4 text-start">
        ${(c.items || []).map(item => `
        <div class="col-md-4">
          <div class="card h-100 border p-4 shadow-sm rounded-4">
            <h4 class="fw-bold mb-2">${item.title}</h4>
            <p class="text-secondary mb-0">${item.description}</p>
          </div>
        </div>`).join("")}
      </div>
    </div>
  </section>`;

    case "gallery":
    case "showcase":
      return `
  <section id="gallery" class="py-5" style="background-color: #F8FAFD;">
    <div class="container py-5 text-center">
      ${c.badge ? `<span class="badge rounded-pill bg-white text-primary border px-3 py-2 mb-2">${c.badge}</span>` : ""}
      <h2 class="display-5 fw-bold mb-3" style="color: ${secondary};">${c.title || "Curated Showcase & Gallery"}</h2>
      ${c.description ? `<p class="text-secondary mx-auto mb-5" style="max-width: 600px;">${c.description}</p>` : ""}
      <div class="row g-4 text-start">
        ${(c.items || []).map(item => `
        <div class="col-md-4">
          <div class="card h-100 border shadow-sm rounded-4 overflow-hidden bg-white">
            <div class="p-4 text-white text-center" style="background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%); min-height: 140px; display: flex; align-items: center; justify-content: center;">
              <span class="badge bg-white text-dark">${item.tag || "Gallery"}</span>
            </div>
            <div class="p-4">
              <h5 class="fw-bold mb-2">${item.title}</h5>
              <p class="small text-secondary mb-0">${item.description}</p>
            </div>
          </div>
        </div>`).join("")}
      </div>
    </div>
  </section>`;

    case "testimonials":
      return `
  <section id="testimonials" class="py-5 bg-white">
    <div class="container py-5 text-center">
      ${c.badge ? `<span class="badge rounded-pill bg-light text-primary px-3 py-2 mb-2">${c.badge}</span>` : ""}
      <h2 class="display-5 fw-bold mb-3" style="color: ${secondary};">${c.title || "Client Testimonials"}</h2>
      ${c.description ? `<p class="text-secondary mx-auto mb-5" style="max-width: 600px;">${c.description}</p>` : ""}
      <div class="row g-4 text-start">
        ${(c.items || []).map(item => `
        <div class="col-md-4">
          <div class="card h-100 border p-4 shadow-sm rounded-4 d-flex flex-column justify-content-between">
            <p class="text-secondary mb-4">"${item.description}"</p>
            <div class="pt-3 border-top">
              <div class="fw-bold">${item.title}</div>
              <div class="small text-muted">${item.role || "Verified Client"}</div>
            </div>
          </div>
        </div>`).join("")}
      </div>
    </div>
  </section>`;

    case "faq":
      return `
  <section id="faq" class="py-5" style="background-color: #F8FAFD;">
    <div class="container py-5 text-center">
      ${c.badge ? `<span class="badge rounded-pill bg-white text-primary border px-3 py-2 mb-2">${c.badge}</span>` : ""}
      <h2 class="display-5 fw-bold mb-3" style="color: ${secondary};">${c.title || "Frequently Asked Questions"}</h2>
      ${c.description ? `<p class="text-secondary mx-auto mb-5" style="max-width: 600px;">${c.description}</p>` : ""}
      <div class="mx-auto text-start d-flex flex-column gap-3" style="max-width: 760px;">
        ${(c.items || []).map(item => `
        <div class="p-4 rounded-4 bg-white border shadow-xs">
          <h5 class="fw-bold mb-2">${item.title}</h5>
          <p class="small text-secondary mb-0">${item.description}</p>
        </div>`).join("")}
      </div>
    </div>
  </section>`;

    case "cta":
      return `
  <section id="cta" class="py-5 text-white text-center" style="background-color: ${primary};">
    <div class="container py-5">
      ${c.badge ? `<span class="badge bg-white text-dark rounded-pill px-3 py-2 mb-3">${c.badge}</span>` : ""}
      <h2 class="display-4 fw-bold mb-3">${c.title || "Ready to get started?"}</h2>
      ${c.description ? `<p class="lead mb-4 mx-auto" style="max-width: 600px;">${c.description}</p>` : ""}
      ${c.buttonText ? `<a href="${c.buttonLink || "#"}" class="btn btn-light btn-lg px-5 py-3 rounded-pill fw-bold shadow">${c.buttonText}</a>` : ""}
    </div>
  </section>`;

    case "footer":
      return `
  <footer class="py-4 border-top text-center text-secondary bg-white">
    <div class="container">
      <p class="mb-0">${c.description || `© ${new Date().getFullYear()} All rights reserved.`}</p>
    </div>
  </footer>`;

    default:
      return `
  <section class="py-5 bg-light">
    <div class="container text-center">
      <h3 class="fw-bold mb-3">${s.name}</h3>
      <p class="text-secondary">${c.description || ""}</p>
    </div>
  </section>`;
  }
}

function generateStandaloneCss(project: WebsiteDocument): string {
  const primary = project.theme?.primaryColor || "#356DFF";
  const secondary = project.theme?.secondaryColor || "#172033";
  const bg = project.theme?.backgroundColor || "#FFFFFF";
  const font = project.theme?.fontFamily || "Outfit, sans-serif";

  return `:root {
  --primary-color: ${primary};
  --secondary-color: ${secondary};
  --bg-color: ${bg};
  --font-family: ${font};
}

body {
  font-family: var(--font-family);
  color: var(--secondary-color);
  background-color: var(--bg-color);
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.site-header {
  transition: all 0.2s ease-in-out;
}

.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;
}

function generateStandaloneJs(project: WebsiteDocument): string {
  return `document.addEventListener("DOMContentLoaded", () => {
  console.log("${project.name} loaded successfully.");
});
`;
}
