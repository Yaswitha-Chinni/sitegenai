import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function runAcceptanceTests() {
  console.log("===============================================================");
  console.log("   SiteGenAI: Dynamic Generation & Visual Editor Tests       ");
  console.log("===============================================================\n");

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
      console.error(err);
      failed++;
    }
  }

  // PART A: THREE DISTINCT PROMPTS TEST (Dairy, Restaurant, SaaS)
  const prompts = [
    {
      type: "dairy",
      prompt: "Pure Green Pastures Organic Dairy farm producing grass-fed A2 milk, cultured bilona ghee, paneer, and rich dahi.",
      category: "Agriculture & Dairy",
      style: "Natural & Editorial",
      expectedKeywords: ["dairy", "milk", "pasture", "ghee", "pure"],
    },
    {
      type: "restaurant",
      prompt: "Trattoria Bella Notte — an artisanal Italian bistro with wood-fired pizzas, handmade pasta, natural wines, and candlelit courtyard dining.",
      category: "Restaurant",
      style: "Warm & Elegant",
      expectedKeywords: ["trattoria", "italian", "pasta", "dining", "wine", "table"],
    },
    {
      type: "saas",
      prompt: "PulseCloud Telemetry — real-time developer metrics, cloud observability, automated anomaly detection, and sub-millisecond query engine.",
      category: "SaaS",
      style: "Modern Minimal Tech",
      expectedKeywords: ["pulsecloud", "telemetry", "cloud", "metrics", "analytics"],
    },
  ];

  const generatedProjects = [];

  for (const p of prompts) {
    console.log(`\n--- Running Generation Workflow for: ${p.type.toUpperCase()} ---`);
    let sbId = "";
    let sbVersion = 1;
    let projId = "";

    // 1. Create storyboard
    await test(`Plan Storyboard for ${p.type}`, async () => {
      const res = await fetch(`${BASE_URL}/api/storyboard/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: p.prompt,
          category: p.category,
          style: p.style,
        }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert(data.storyboard, "Storyboard missing");
      sbId = data.storyboard.id;
      sbVersion = data.storyboard.version;
      assert(sbId.startsWith("sb-"), `Invalid storyboard ID: ${sbId}`);
    });

    // 2. Approve storyboard
    await test(`Approve Storyboard for ${p.type}`, async () => {
      const res = await fetch(`${BASE_URL}/api/storyboard/${sbId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: sbVersion }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200, `Approve failed: ${JSON.stringify(data)}`);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.storyboard.status, "approved");
    });

    // 3. Generate website
    await test(`Generate Website from Storyboard for ${p.type}`, async () => {
      const res = await fetch(`${BASE_URL}/api/storyboard/${sbId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200, `Generate failed: ${JSON.stringify(data)}`);
      assert.strictEqual(data.success, true);
      assert(data.project, "Project missing");
      assert(data.projectId, "ProjectId missing");
      projId = data.projectId;
      generatedProjects.push({ ...p, project: data.project });
    });

    // 4. Verify No Coco Pour contamination
    await test(`Verify No Coco Pour Hardcoding in ${p.type} Website`, async () => {
      const proj = generatedProjects.find((x) => x.type === p.type).project;
      const projJson = JSON.stringify(proj).toLowerCase();

      assert(!projJson.includes("coco pour"), `Coco Pour found in ${p.type} project!`);
      assert(!projJson.includes("cold-pressed coconut milk"), `Cold-pressed coconut milk found in ${p.type} project!`);

      // Verify prompt-specific identity preserved
      assert(proj.name.length > 0, "Project name empty");
      assert(proj.sections.length >= 8, `Expected >= 8 sections, got ${proj.sections.length}`);
    });

    // 5. Verify Project Persistence via GET /api/projects/[id]
    await test(`Retrieve Project by ID from Server API (${projId})`, async () => {
      const res = await fetch(`${BASE_URL}/api/projects/${projId}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.project.id, projId);
    });

    // 6. Test Idempotency on repeated generation calls
    await test(`Verify Idempotency on Repeated Generation for ${p.type}`, async () => {
      const res = await fetch(`${BASE_URL}/api/storyboard/${sbId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200, `Repeated generate failed: ${JSON.stringify(data)}`);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.projectId, projId, "Repeated generation should return identical project ID");
    });
  }

  // Verify Distinctness Across all 3 Websites
  console.log("\n--- Verifying Distinctness Between All 3 Generated Sites ---");
  await test("Verify All 3 Websites Have Different Identities, Titles, and Section Content", async () => {
    assert.strictEqual(generatedProjects.length, 3);
    const [dairy, restaurant, saas] = generatedProjects;

    assert.notStrictEqual(dairy.project.id, restaurant.project.id);
    assert.notStrictEqual(restaurant.project.id, saas.project.id);
    assert.notStrictEqual(dairy.project.name, restaurant.project.name);
    assert.notStrictEqual(restaurant.project.name, saas.project.name);

    const dairyHero = dairy.project.sections.find((s) => s.type === "hero")?.content.title || "";
    const restHero = restaurant.project.sections.find((s) => s.type === "hero")?.content.title || "";
    const saasHero = saas.project.sections.find((s) => s.type === "hero")?.content.title || "";

    assert.notStrictEqual(dairyHero, restHero);
    assert.notStrictEqual(restHero, saasHero);
  });

  // PART B: WORDPRESS-LIKE VISUAL EDITOR ACTIONS & PERSISTENCE
  console.log("\n--- Testing Visual Editor Operations & Persistence ---");
  const targetProject = generatedProjects[0].project; // Dairy project

  await test("Visual Editor: Update Element Text (Hero Title & Subtitle)", async () => {
    const updatedSections = targetProject.sections.map((s) => {
      if (s.type === "hero") {
        return {
          ...s,
          content: {
            ...s.content,
            title: "Custom Edited Dairy Title By Visual Editor",
            subtitle: "Custom edited subtitle verifying live editing",
          },
        };
      }
      return s;
    });

    const putRes = await fetch(`${BASE_URL}/api/projects/${targetProject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: updatedSections }),
    });

    assert.strictEqual(putRes.status, 200);
    const putData = await putRes.json();
    assert.strictEqual(putData.success, true);

    // Verify retrieval
    const checkRes = await fetch(`${BASE_URL}/api/projects/${targetProject.id}`);
    const checkData = await checkRes.json();
    const heroSec = checkData.project.sections.find((s) => s.type === "hero");
    assert.strictEqual(heroSec.content.title, "Custom Edited Dairy Title By Visual Editor");
    assert.strictEqual(heroSec.content.subtitle, "Custom edited subtitle verifying live editing");
  });

  await test("Visual Editor: Custom Typography & Styling (Font Size Stepper, Weight, Colors, Borders)", async () => {
    const heroSec = targetProject.sections.find((s) => s.type === "hero");
    assert(heroSec, "Hero section not found");

    const elementId = `${heroSec.id}-title`;
    const customStyle = {
      fontSize: 48,
      fontWeight: "800",
      color: "#064E3B",
      backgroundColor: "#ECFDF5",
      padding: "24px",
      margin: "12px",
      borderRadius: "14px",
      borderColor: "#10B981",
      borderWidth: "2px",
      borderStyle: "solid",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    };

    const updatedSections = targetProject.sections.map((s) => {
      if (s.id === heroSec.id) {
        return {
          ...s,
          elementStyles: {
            ...(s.elementStyles || {}),
            [elementId]: customStyle,
          },
        };
      }
      return s;
    });

    const putRes = await fetch(`${BASE_URL}/api/projects/${targetProject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: updatedSections }),
    });

    assert.strictEqual(putRes.status, 200);

    // Verify persisted
    const checkRes = await fetch(`${BASE_URL}/api/projects/${targetProject.id}`);
    const checkData = await checkRes.json();
    const loadedHero = checkData.project.sections.find((s) => s.id === heroSec.id);
    const loadedStyle = loadedHero.elementStyles?.[elementId];

    assert(loadedStyle, "Element custom style not persisted!");
    assert.strictEqual(loadedStyle.fontSize, 48);
    assert.strictEqual(loadedStyle.fontWeight, "800");
    assert.strictEqual(loadedStyle.color, "#064E3B");
    assert.strictEqual(loadedStyle.borderRadius, "14px");
  });

  await test("Visual Editor: Attach Lucide Vector Icon to Element", async () => {
    const heroSec = targetProject.sections.find((s) => s.type === "hero");
    const buttonId = `${heroSec.id}-button`;

    const updatedSections = targetProject.sections.map((s) => {
      if (s.id === heroSec.id) {
        return {
          ...s,
          elementStyles: {
            ...(s.elementStyles || {}),
            [buttonId]: {
              iconName: "Sparkles",
              iconSize: 20,
              iconColor: "#FFFFFF",
            },
          },
        };
      }
      return s;
    });

    const putRes = await fetch(`${BASE_URL}/api/projects/${targetProject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: updatedSections }),
    });

    assert.strictEqual(putRes.status, 200);

    // Verify persisted
    const checkRes = await fetch(`${BASE_URL}/api/projects/${targetProject.id}`);
    const checkData = await checkRes.json();
    const loadedHero = checkData.project.sections.find((s) => s.id === heroSec.id);
    const loadedButtonStyle = loadedHero.elementStyles?.[buttonId];

    assert(loadedButtonStyle, "Button element style missing");
    assert.strictEqual(loadedButtonStyle.iconName, "Sparkles");
    assert.strictEqual(loadedButtonStyle.iconSize, 20);
  });

  await test("Visual Editor: Add Element (Card) to Section and Persist", async () => {
    const featSec = targetProject.sections.find((s) => s.type === "features") || targetProject.sections[1];
    const initialItemsCount = featSec.content.items?.length || 0;

    const newCard = {
      title: "Newly Inserted Value Proposition",
      description: "Added directly through the visual editor Add Elements panel.",
      tag: "Live Added",
      price: "$29.00",
    };

    const updatedSections = targetProject.sections.map((s) => {
      if (s.id === featSec.id) {
        return {
          ...s,
          content: {
            ...s.content,
            items: [...(s.content.items || []), newCard],
          },
        };
      }
      return s;
    });

    const putRes = await fetch(`${BASE_URL}/api/projects/${targetProject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: updatedSections }),
    });

    assert.strictEqual(putRes.status, 200);

    // Verify persisted
    const checkRes = await fetch(`${BASE_URL}/api/projects/${targetProject.id}`);
    const checkData = await checkRes.json();
    const loadedFeat = checkData.project.sections.find((s) => s.id === featSec.id);
    assert.strictEqual(loadedFeat.content.items.length, initialItemsCount + 1);
    const lastItem = loadedFeat.content.items[loadedFeat.content.items.length - 1];
    assert.strictEqual(lastItem.title, "Newly Inserted Value Proposition");
  });

  console.log("\n===============================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests();
