import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=================================================");
  console.log("   SiteGenAI TRICITY Evaluation Test Suite       ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`Testing: ${name}... `);
      await fn();
      console.log("✅ PASS");
      passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  // 1. Critical Public & Auth Routes
  await test("Critical HTTP Routes (Landing, Templates, Create, Dashboard, Admin, Editor)", async () => {
    const routes = [
      "/",
      "/templates",
      "/create",
      "/dashboard",
      "/admin",
      "/login",
      "/signup",
      "/signout",
      "/editor/proj-w1-cocopour"
    ];
    for (const r of routes) {
      const res = await fetch(`${BASE_URL}${r}`);
      assert.strictEqual(res.status, 200, `Expected 200 for ${r}, got ${res.status}`);
    }
  });

  // 2. Storyboard UI Landing Page Content
  await test("Landing Page Storyboard Sections & Content Verification", async () => {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    assert(html.includes("Turn Your Ideas"), "Headline missing");
    assert(html.includes("Stunning Websites"), "Headline highlight missing");
    assert(html.includes("From Imagination to Reality"), "Our Work section missing");
    assert(html.includes("3 Simple Steps"), "How It Works section missing");
    assert(html.includes("Everything You Need to"), "Advanced Features section missing");
    assert(html.includes("Professionally Designed Templates"), "Templates section missing");
    assert(html.includes("Meet the Team Behind"), "Team section missing");
    assert(html.includes("Loved by"), "Testimonials section missing");
    assert(html.includes("Choose the Plan That"), "Pricing section missing");
    assert(html.includes("Your Next Great Website Starts Here"), "Final CTA missing");
    // Hero Video assertions
    assert(html.includes("/hero-video.mp4"), "Hero background video source missing");
    assert(html.includes("sb-hero-video"), "Hero video element class missing");
    assert(html.includes("/hero-poster.jpg"), "Hero video fallback poster missing");
    // W1 and W2 Our Works previews
    assert(html.includes("/templates/w1/index.html"), "W1 preview iframe route missing");
    assert(html.includes("/templates/w2/index.html"), "W2 preview iframe route missing");
    assert(html.includes("btn-view-website-w1"), "W1 View Website action button missing");
    assert(html.includes("btn-view-website-w2"), "W2 View Website action button missing");
  });

  // 2b. Hero Video & Live Portfolio Static Assets Check
  await test("Static Video & W1/W2 Preview Assets Availability", async () => {
    const assetUrls = [
      "/hero-video.mp4",
      "/hero-poster.jpg",
      "/templates/w1/index.html",
      "/templates/w2/index.html",
      "/templates/w2/css/variables.css",
      "/templates/w2/vendor/gsap.min.js"
    ];
    for (const url of assetUrls) {
      const res = await fetch(`${BASE_URL}${url}`);
      assert.strictEqual(res.status, 200, `Expected 200 for ${url}, got ${res.status}`);
      const len = res.headers.get("content-length");
      if (len) {
        assert(parseInt(len, 10) > 0, `Expected non-empty content for ${url}`);
      }
    }
  });

  // 3. AI Planning Endpoint & 8+ Sections Enforcement
  await test("AI Planning Blueprint Enforces At Least 8 Sections", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "A luxury botanical candle boutique called Velora Lumiere",
        category: "E-commerce",
        style: "Minimalist Editorial"
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.blueprint.sections.length >= 8, `Expected >= 8 sections, got ${data.blueprint.sections.length}`);
    const types = data.blueprint.sections.map(s => s.type);
    assert(types.includes("header"), "Header section missing");
    assert(types.includes("hero"), "Hero section missing");
    assert(types.includes("footer"), "Footer section missing");
  });

  // 4. Standalone ZIP Export Integrity
  await test("Standalone ZIP Export Packaging & File Contents", async () => {
    const res = await fetch(`${BASE_URL}/api/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "eval-export-proj",
        name: "Velora Lumiere",
        description: "Botanical Candle Boutique",
        templateSource: "built-in",
        localPort: 3001,
        theme: {
          primaryColor: "#10B981",
          secondaryColor: "#04120C",
          backgroundColor: "#FFFFFF",
          fontFamily: "Outfit, sans-serif"
        },
        sections: [
          { id: "sec-header", type: "header", name: "Header", visible: true, content: { title: "Velora" }, style: {} },
          { id: "sec-hero", type: "hero", name: "Hero", visible: true, content: { title: "Pure Botanicals" }, style: {} },
          { id: "sec-story", type: "story", name: "Story", visible: true, content: { title: "Our Story" }, style: {} },
          { id: "sec-product", type: "product", name: "Candles", visible: true, content: { title: "Signature Jars" }, style: {} },
          { id: "sec-features", type: "features", name: "Pillars", visible: true, content: { title: "Why Choose Us" }, style: {} },
          { id: "sec-gallery", type: "gallery", name: "Gallery", visible: true, content: { title: "Visual Moments" }, style: {} },
          { id: "sec-testimonials", type: "testimonials", name: "Reviews", visible: true, content: { title: "Client Quotes" }, style: {} },
          { id: "sec-faq", type: "faq", name: "FAQ", visible: true, content: { title: "Questions Answered" }, style: {} },
          { id: "sec-cta", type: "cta", name: "CTA", visible: true, content: { title: "Order Today" }, style: {} },
          { id: "sec-footer", type: "footer", name: "Footer", visible: true, content: { title: "Velora Lumiere" }, style: {} }
        ]
      })
    });
    assert.strictEqual(res.status, 200);
    const buf = await res.arrayBuffer();
    assert(buf.byteLength > 1000, `Expected valid ZIP buffer > 1KB, got ${buf.byteLength} bytes`);
  });

  // 5. Database CRUD Endpoints
  await test("Database CRUD Operations (POST, GET, PUT, DELETE)", async () => {
    const testId = "eval-test-crud-" + Date.now();
    
    // POST
    const postRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: testId, name: "TRICITY Test Entity" })
    });
    const postJson = await postRes.json();
    assert.strictEqual(postJson.success, true);

    // GET
    const getRes = await fetch(`${BASE_URL}/api/projects`);
    const getJson = await getRes.json();
    assert.strictEqual(getJson.success, true);

    // PUT
    const putRes = await fetch(`${BASE_URL}/api/projects/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "TRICITY Test Entity Updated" })
    });
    const putJson = await putRes.json();
    assert.strictEqual(putJson.success, true);

    // DELETE
    const delRes = await fetch(`${BASE_URL}/api/projects/${testId}`, {
      method: "DELETE"
    });
    const delJson = await delRes.json();
    assert.strictEqual(delJson.success, true);
  });

  // 6. Admin Stats Telemetry Endpoint
  await test("Admin Telemetry API (Health, Uptime, Memory, Disk, AI)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.system.nodeVersion.startsWith("v24"), "Node.js v24 verified");
    assert.strictEqual(data.ai.geminiConfigured, true, "Gemini API key verified configured");
    assert(data.database.localStorageEngine.includes("sitegenai_projects_v1"), "Database persistence engine verified");
  });

  // 7. Local Port Availability Checker
  await test("Local Port Availability Socket Checker", async () => {
    const res = await fetch(`${BASE_URL}/api/projects/check-port?port=3000`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    // Port 3000 is occupied by our running dev server, so available should be false
    assert.strictEqual(data.available, false, "Port 3000 correctly detected as active socket");
  });

  // 8. Stock Photo Search API & Attribution Check
  await test("Stock Photo Search API with Orientation & Attribution", async () => {
    const res = await fetch(`${BASE_URL}/api/images/search?query=coffee&orientation=landscape&perPage=4`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(Array.isArray(data.images) && data.images.length > 0, "Expected non-empty image list");
    const first = data.images[0];
    assert(first.url && first.url.startsWith("http"), "Image URL missing or invalid");
    assert(first.photographer, "Photographer attribution missing");
    assert(first.source, "Image source missing");
  });

  // 9. Prompt-based Automatic Image Discovery Across Sections
  await test("Prompt-based Automatic Image Discovery Engine", async () => {
    const res = await fetch(`${BASE_URL}/api/images/discover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Artisanal bakery and organic cafe offering sourdough loaves and specialty espresso",
        sections: [
          { id: "sec-hero", type: "hero", name: "Hero Spotlight" },
          { id: "sec-story", type: "story", name: "Our Craft & Heritage" },
          { id: "sec-product", type: "product", name: "Fresh Bakes & Espresso" },
          { id: "sec-gallery", type: "gallery", name: "Visual Moments" }
        ]
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.assignments && data.assignments.length > 0, "Assignments missing");
    
    // Check that distinct images were assigned where possible
    const assignedUrls = data.assignments.map(a => a.image.url);
    const uniqueUrls = new Set(assignedUrls);
    assert(uniqueUrls.size >= 2, `Expected distinct images across sections, got ${uniqueUrls.size} unique URLs out of ${assignedUrls.length}`);
    
    // Verify each assignment contains full attribution metadata
    for (const a of data.assignments) {
      assert(a.image.photographer, `Photographer attribution missing for section ${a.sectionId}`);
      assert(a.image.source, `Source attribution missing for section ${a.sectionId}`);
      assert(a.sectionId, "SectionId missing on assignment");
    }
  });

  console.log("\n=================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
