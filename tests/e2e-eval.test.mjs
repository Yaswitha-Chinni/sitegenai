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

  console.log("\n=================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
