import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function runStoryboardTestSuite() {
  console.log("=================================================");
  console.log("   SiteGenAI Storyboard & Image Pipeline Tests   ");
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

  const testPrompts = [
    {
      label: "1. Premium Dairy Brand (Milk & Ghee)",
      prompt: "Create a premium dairy brand website selling fresh cow milk, organic ghee, paneer, and curd. Use a natural green and cream palette, show dairy farms and product photography.",
      category: "E-commerce & Agriculture",
      style: "Natural & Editorial",
    },
    {
      label: "2. Artisanal Restaurant & Bistro",
      prompt: "A modern Italian trattoria with handmade pasta, wood-fired pizzas, wine pairings, chef story, menu showcase, and online table reservations.",
      category: "Restaurant",
      style: "Warm & Elegant",
    },
    {
      label: "3. Enterprise SaaS Analytics Platform",
      prompt: "A cloud telemetry and real-time AI analytics platform called PulseCloud featuring speed benchmarks, infrastructure monitoring, security certifications, and interactive demo signup.",
      category: "SaaS",
      style: "Modern Minimal Tech",
    },
  ];

  for (const item of testPrompts) {
    console.log(`\n--- Running Pipeline for: ${item.label} ---`);

    let storyboardId = "";
    let initialVersion = 1;

    // Test 1: Storyboard Generation via Gemini & Stock Photo Discovery
    await test(`Generate Storyboard with Gemini & Stock Photos for ${item.category}`, async () => {
      const res = await fetch(`${BASE_URL}/api/storyboard/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: item.prompt,
          category: item.category,
          style: item.style,
        }),
      });

      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert(data.storyboard, "Storyboard object missing");
      storyboardId = data.storyboard.id;
      initialVersion = data.storyboard.version;

      const sections = data.storyboard.pages[0]?.sections || [];
      assert(sections.length >= 8, `Expected >= 8 sections, got ${sections.length}`);
      assert.strictEqual(data.storyboard.status, "awaiting_approval", `Expected awaiting_approval, got ${data.storyboard.status}`);

      // Verify at least 3 sections received real stock photographs with attribution
      const photos = sections.filter((s) => s.selectedImage);
      assert(photos.length >= 3, `Expected >= 3 sections with stock photos, got ${photos.length}`);

      for (const s of photos) {
        assert(s.selectedImage.url.startsWith("http"), `Invalid image URL: ${s.selectedImage.url}`);
        assert(s.selectedImage.photographer, "Missing photographer attribution");
        assert(s.selectedImage.source, "Missing photo source");
      }

      // Verify non-repeating photos across sections
      const photoUrls = photos.map((p) => p.selectedImage.url);
      const uniqueUrls = new Set(photoUrls);
      assert(uniqueUrls.size >= 2, `Expected distinct photos, got ${uniqueUrls.size} unique out of ${photoUrls.length}`);
    });

    // Test 2: Storyboard Retrieval
    await test(`Retrieve Storyboard Document by ID (${storyboardId})`, async () => {
      const res = await fetch(`${BASE_URL}/api/storyboard/${storyboardId}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.storyboard.id, storyboardId);
    });

    // Test 3: Storyboard Editing without advancing approval
    await test(`Edit Storyboard Headline & Verify Status Remains Awaiting Approval`, async () => {
      const getRes = await fetch(`${BASE_URL}/api/storyboard/${storyboardId}`);
      const getData = await getRes.json();
      const sb = getData.storyboard;

      const updatedHeadline = "Verified Fresh Farm Promise - Updated by Editor";
      sb.pages[0].sections[1].headline = updatedHeadline;

      const putRes = await fetch(`${BASE_URL}/api/storyboard/${storyboardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sb),
      });

      assert.strictEqual(putRes.status, 200);
      const putData = await putRes.json();
      assert.strictEqual(putData.success, true);
      assert.strictEqual(putData.storyboard.pages[0].sections[1].headline, updatedHeadline);
      assert.strictEqual(putData.storyboard.status, "awaiting_approval", "Editing must not approve storyboard");
      assert(putData.storyboard.version > initialVersion, "Version must increment on edit");
    });

    // Test 4: PDF Storyboard Export
    await test(`Export Storyboard as PDF Document (Real PDF binary, non-triggering)`, async () => {
      const res = await fetch(`${BASE_URL}/api/storyboard/${storyboardId}/pdf`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get("content-type"), "application/pdf");

      const buffer = await res.arrayBuffer();
      assert(buffer.byteLength > 2000, `Expected PDF size > 2KB, got ${buffer.byteLength}`);

      // Verify PDF magic header bytes "%PDF-"
      const header = new TextDecoder().decode(buffer.slice(0, 5));
      assert.strictEqual(header, "%PDF-", `Expected %PDF- magic bytes, got ${header}`);

      // Verify that exporting PDF did NOT advance status to approved or generated
      const checkRes = await fetch(`${BASE_URL}/api/storyboard/${storyboardId}`);
      const checkData = await checkRes.json();
      assert.strictEqual(checkData.storyboard.status, "awaiting_approval", "PDF export must not approve storyboard");
    });

    // Test 5: Explicit Server-Side Approval Gate
    await test(`Explicit Server-Side Approval Gate`, async () => {
      const res = await fetch(`${BASE_URL}/api/storyboard/${storyboardId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: 2 }),
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.storyboard.status, "approved");
      assert(data.storyboard.approvedAt, "approvedAt missing");
    });

    // Test 6: Full Website Generation from Approved Storyboard
    await test(`Generate Full Website from Approved Storyboard`, async () => {
      const res = await fetch(`${BASE_URL}/api/storyboard/${storyboardId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert(data.project, "Generated website project missing");
      assert(data.projectId, "Generated projectId missing");
      assert(data.project.sections.length >= 8, `Expected >= 8 website sections, got ${data.project.sections.length}`);

      // Verify storyboard status transitioned to website_ready
      const checkRes = await fetch(`${BASE_URL}/api/storyboard/${storyboardId}`);
      const checkData = await checkRes.json();
      assert.strictEqual(checkData.storyboard.status, "website_ready");
      assert.strictEqual(checkData.storyboard.generatedProjectId, data.projectId);
    });
  }

  console.log("\n=================================================");
  console.log(`Pipeline Results: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStoryboardTestSuite();
