import { NextRequest, NextResponse } from "next/server";
import http from "http";
import fs from "fs";
import path from "path";
import os from "os";
import net from "net";
import { WebsiteDocument } from "@/types/project";

// Global map to persist running servers across Next.js API requests in development
interface ManagedServer {
  projectId: string;
  projectName: string;
  port: number;
  url: string;
  status: "starting" | "running" | "stopped" | "error";
  startTime: string;
  server: http.Server;
  logs: Array<{ timestamp: string; message: string; level: "info" | "success" | "warn" | "error" }>;
  directory: string;
  framework: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __sitegenai_servers: Map<string, ManagedServer> | undefined;
}

if (!globalThis.__sitegenai_servers) {
  globalThis.__sitegenai_servers = new Map<string, ManagedServer>();
}

const runningServers = globalThis.__sitegenai_servers;

// MIME types lookup
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function findAvailablePort(preferredPort: number = 3001): Promise<number> {
  let port = preferredPort;
  while (port <= 3099) {
    // Make sure our own registry isn't already holding it
    const isRegistered = Array.from(runningServers.values()).some((s) => s.port === port && s.status === "running");
    if (!isRegistered && (await isPortAvailable(port))) {
      return port;
    }
    port++;
  }
  return 3001; // fallback
}

/**
 * Creates and starts a standalone HTTP server serving the given directory.
 */
function createStaticHttpServer(
  dirPath: string,
  port: number,
  logCallback: (msg: string, level?: "info" | "success" | "warn" | "error") => void
): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = new URL(req.url || "/", `http://localhost:${port}`);
        let pathname = decodeURIComponent(parsedUrl.pathname);

        if (pathname === "/") {
          pathname = "/index.html";
        }

        // Prevent directory traversal
        const safePath = path.normalize(path.join(/* turbopackIgnore: true */ dirPath, pathname));
        if (!safePath.startsWith(path.normalize(dirPath))) {
          res.writeHead(403, { "Content-Type": "text/plain" });
          res.end("Forbidden");
          return;
        }

        if (!fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
          // Fallback to index.html for SPA/clean routing if index exists
          const fallbackIndex = path.join(dirPath, "index.html");
          if (fs.existsSync(fallbackIndex)) {
            const content = fs.readFileSync(fallbackIndex);
            res.writeHead(200, {
              "Content-Type": "text/html; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            });
            res.end(content);
            return;
          }

          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("File Not Found");
          return;
        }

        const ext = path.extname(safePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const stat = fs.statSync(safePath);

        // Support video range requests for smooth looping playback in W1 / W2
        const range = req.headers.range;
        if (range && (ext === ".mp4" || ext === ".webm")) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
          const chunksize = end - start + 1;
          const file = fs.createReadStream(safePath, { start, end });

          res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${stat.size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
          });
          file.pipe(res);
          return;
        }

        res.writeHead(200, {
          "Content-Length": stat.size,
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
        });

        const readStream = fs.createReadStream(safePath);
        readStream.pipe(res);

        // Log non-asset requests to avoid clutter
        if (ext === ".html" || pathname === "/index.html") {
          logCallback(`${req.method} ${pathname} — 200 OK`, "info");
        }
      } catch (err: any) {
        logCallback(`Error serving request ${req.url}: ${err.message}`, "error");
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      }
    });

    server.once("error", (err) => {
      reject(err);
    });

    server.listen(port, "127.0.0.1", () => {
      resolve(server);
    });
  });
}

function generateStandaloneProjectFiles(project: WebsiteDocument, targetDir: string) {
  try {
    fs.mkdirSync(targetDir, { recursive: true });

    const primary = project.theme?.primaryColor || "#356DFF";
    const secondary = project.theme?.secondaryColor || "#172033";
    const font = project.theme?.fontFamily || "Outfit, sans-serif";

    // 1. index.html
    const sectionsHtml = (project.sections || [])
      .filter((s) => s.visible)
      .map((s) => {
        const c = s.content || {};
        return `
    <!-- SECTION: ${s.name} (${s.type}) -->
    <section id="${s.id}" class="py-5" style="background-color: ${s.style?.backgroundColor || "#FFFFFF"}; color: ${s.style?.textColor || secondary};">
      <div class="container">
        ${c.badge ? `<span class="badge rounded-pill bg-light text-primary px-3 py-1.5 mb-2 border">${c.badge}</span>` : ""}
        ${c.title ? `<h2 class="fw-bold mb-3">${c.title}</h2>` : ""}
        ${c.subtitle ? `<h4 class="fw-semibold text-muted mb-3">${c.subtitle}</h4>` : ""}
        ${c.description ? `<p class="lead mb-4" style="max-width: 720px;">${c.description}</p>` : ""}
        ${c.buttonText ? `<a href="${c.buttonLink || "#"}" class="btn btn-primary px-4 py-2 rounded-pill fw-semibold me-2">${c.buttonText}</a>` : ""}
        ${c.secondaryButtonText ? `<a href="${c.secondaryButtonLink || "#"}" class="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold">${c.secondaryButtonText}</a>` : ""}
        
        ${
          c.items && c.items.length > 0
            ? `<div class="row g-4 mt-4">
            ${c.items
              .map(
                (item) => `
              <div class="col-12 col-md-4">
                <div class="card h-100 p-4 border rounded-4 shadow-sm">
                  ${item.stat ? `<div class="display-6 fw-extrabold text-primary mb-2">${item.stat}</div>` : ""}
                  <h5 class="fw-bold mb-2">${item.title}</h5>
                  <p class="text-secondary small mb-0">${item.description}</p>
                </div>
              </div>`
              )
              .join("")}
          </div>`
            : ""
        }
      </div>
    </section>`;
      })
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} — Live Localhost</title>
  <meta name="description" content="${project.description || project.name}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  ${sectionsHtml}
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="script.js"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf-8");

    // 2. styles.css
    const css = `:root {
  --primary-color: ${primary};
  --secondary-color: ${secondary};
  --font-family: ${font};
}
body {
  font-family: var(--font-family);
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
.btn-primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}
.text-primary {
  color: var(--primary-color) !important;
}
`;
    fs.writeFileSync(path.join(targetDir, "styles.css"), css, "utf-8");

    // 3. script.js
    const js = `console.log("${project.name} is running locally on SiteGenAI Localhost Server.");`;
    fs.writeFileSync(path.join(targetDir, "script.js"), js, "utf-8");
  } catch (err) {
    console.warn("Could not generate standalone files in target directory:", err);
  }
}

// -----------------------------------------------------------------------------
// POST: START OR RESTART LOCALHOST SERVER
// -----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project } = body as { project: WebsiteDocument };

    if (!project || !project.id || !project.name) {
      return NextResponse.json(
        { success: false, error: "Valid project document is required to launch localhost server." },
        { status: 400 }
      );
    }

    const projectId = project.id;

    // Check if a server for this project is already active
    const existing = runningServers.get(projectId);
    if (existing && existing.status === "running") {
      return NextResponse.json({
        success: true,
        message: "Server is already active and running on localhost.",
        server: {
          projectId: existing.projectId,
          projectName: existing.projectName,
          port: existing.port,
          url: existing.url,
          status: existing.status,
          startTime: existing.startTime,
          logs: existing.logs,
          framework: existing.framework,
        },
      });
    }

    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

    // Determine target directory
    let targetDir: string;
    let frameworkName = "HTML5 / CSS3 / JavaScript";

    if (project.templateSource === "w1" || project.templateId === "w1") {
      targetDir = path.join(process.cwd(), "public", "templates", "w1");
      frameworkName = "COCO POUR (HTML5 + GSAP 3.12 + ScrollTrigger)";
    } else if (project.templateSource === "w2" || project.templateId === "w2") {
      targetDir = path.join(process.cwd(), "public", "templates", "w2");
      frameworkName = "BRUVA Coffee (HTML5 + Lenis + GSAP)";
    } else {
      // Custom / AI project: synthesize into cache directory
      const baseCacheDir = isServerless ? path.join(os.tmpdir(), "sitegenai_cache") : path.join(process.cwd(), ".projects_cache");
      targetDir = path.join(baseCacheDir, projectId);
      generateStandaloneProjectFiles(project, targetDir);
      frameworkName = `SiteGenAI Semantic HTML5 (${project.style || "Modern"})`;
    }

    // Determine port
    const requestedPort = project.localPort && project.localPort >= 1024 ? project.localPort : 3000;

    if (isServerless) {
      // In serverless cloud runtime (e.g. Vercel), sockets cannot bind to the user's laptop loopback.
      // Return a graceful, fully-formed status informing the client and providing execution logs.
      const cloudLogs: Array<{ timestamp: string; message: string; level: "info" | "success" | "warn" | "error" }> = [
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `Notice: SiteGenAI is running in Cloud Mode (Vercel Serverless).`,
          level: "info",
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `Localhost servers bind to your personal computer's local loopback (127.0.0.1:${requestedPort}).`,
          level: "info",
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `Architecture synthesized: ${frameworkName}`,
          level: "info",
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `Terminal Command ready for your local CLI:`,
          level: "info",
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `npx -y serve -p ${requestedPort} .`,
          level: "success",
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `Alternatively, run SiteGenAI locally on your PC via 'npm run dev' to activate the integrated port daemon.`,
          level: "info",
        },
      ];

      return NextResponse.json({
        success: true,
        isCloud: true,
        message: "Cloud deployment active. Ready for local machine execution.",
        server: {
          projectId,
          projectName: project.name,
          port: requestedPort,
          url: `http://localhost:${requestedPort}`,
          status: "cloud",
          startTime: new Date().toISOString(),
          logs: cloudLogs,
          framework: frameworkName,
        },
      });
    }

    const finalPort = await findAvailablePort(requestedPort);

    const logs: Array<{ timestamp: string; message: string; level: "info" | "success" | "warn" | "error" }> = [];
    const addLog = (message: string, level: "info" | "success" | "warn" | "error" = "info") => {
      const entry = {
        timestamp: new Date().toLocaleTimeString(),
        message,
        level,
      };
      logs.push(entry);
      if (logs.length > 100) logs.shift(); // keep last 100 lines
    };

    addLog(`Initializing localhost runner for project: "${project.name}"`, "info");
    addLog(`Detected architecture: ${frameworkName}`, "info");
    addLog(`Serving files from: ${targetDir}`, "info");
    addLog(`Requesting socket port :${finalPort}...`, "info");

    const httpServer = await createStaticHttpServer(targetDir, finalPort, addLog);

    const managed: ManagedServer = {
      projectId,
      projectName: project.name,
      port: finalPort,
      url: `http://localhost:${finalPort}`,
      status: "running",
      startTime: new Date().toISOString(),
      server: httpServer,
      logs,
      directory: targetDir,
      framework: frameworkName,
    };

    runningServers.set(projectId, managed);

    addLog(`Development server successfully listening on http://localhost:${finalPort}`, "success");
    addLog(`Ready for live browser connections.`, "success");

    return NextResponse.json({
      success: true,
      message: `Localhost server started successfully on port ${finalPort}`,
      server: {
        projectId: managed.projectId,
        projectName: managed.projectName,
        port: managed.port,
        url: managed.url,
        status: managed.status,
        startTime: managed.startTime,
        logs: managed.logs,
        framework: managed.framework,
      },
    });
  } catch (err: any) {
    console.error("Localhost startup error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to start localhost server." },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// GET: QUERY STATUS & LOGS
// -----------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    // Return all running servers summary
    const list = Array.from(runningServers.values()).map((s) => ({
      projectId: s.projectId,
      projectName: s.projectName,
      port: s.port,
      url: s.url,
      status: s.status,
      startTime: s.startTime,
      framework: s.framework,
    }));
    return NextResponse.json({ success: true, servers: list });
  }

  const server = runningServers.get(projectId);
  if (!server) {
    return NextResponse.json({
      success: true,
      server: {
        projectId,
        status: "stopped",
        port: 0,
        url: "",
        logs: [],
      },
    });
  }

  return NextResponse.json({
    success: true,
    server: {
      projectId: server.projectId,
      projectName: server.projectName,
      port: server.port,
      url: server.url,
      status: server.status,
      startTime: server.startTime,
      logs: server.logs,
      framework: server.framework,
    },
  });
}

// -----------------------------------------------------------------------------
// DELETE: STOP RUNNING SERVER
// -----------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required." }, { status: 400 });
    }

    const server = runningServers.get(projectId);
    if (!server) {
      return NextResponse.json({ success: true, message: "Server was already stopped." });
    }

    server.logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: `Terminating localhost server process on port ${server.port}...`,
      level: "warn",
    });

    await new Promise<void>((resolve) => {
      server.server.close(() => {
        resolve();
      });
    });

    server.status = "stopped";
    runningServers.delete(projectId);

    return NextResponse.json({
      success: true,
      message: `Localhost server on port ${server.port} stopped cleanly.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to stop server." },
      { status: 500 }
    );
  }
}
