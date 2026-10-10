import { WebsiteDocument, WebsiteBlueprint, WebsiteSection } from "@/types/project";
import { getTemplateById, createDefaultSectionsFromTemplate } from "@/lib/templates/registry";

const STORAGE_KEY = "sitegenai_projects_v1";

const INITIAL_PROJECTS: WebsiteDocument[] = [
  {
    id: "proj-w1-cocopour",
    name: "COCO POUR — Brand Experience",
    description: "Official interactive brand website for cold-pressed coconut milk with video loops and pouring rituals.",
    templateId: "w1",
    templateSource: "w1",
    category: "Restaurant",
    style: "Editorial & Modern Coastal",
    theme: {
      primaryColor: "#087FE5",
      secondaryColor: "#071B32",
      backgroundColor: "#FFFFFF",
      fontFamily: "Outfit, Plus Jakarta Sans",
    },
    pages: ["Home", "Our Story", "Pouring Moments", "Product Showcase", "Culinary Recipes"],
    activePage: "Home",
    sections: createDefaultSectionsFromTemplate("w1"),
    createdAt: "2026-10-09T10:30:00Z",
    updatedAt: "2026-10-10T08:15:00Z",
    isFavorite: true,
    localPort: 3000,
  },
  {
    id: "proj-w2-bruva",
    name: "BRUVA — South Indian Coffee",
    description: "Official interactive brand website for artisanal South Indian filter coffee with brass ritual loops and shade-grown origins.",
    templateId: "w2",
    templateSource: "w2",
    category: "Restaurant",
    style: "Heritage Artisanal Dark Roast",
    theme: {
      primaryColor: "#C59B27",
      secondaryColor: "#080504",
      backgroundColor: "#080504",
      fontFamily: "Outfit, Plus Jakarta Sans",
    },
    pages: ["Home", "The Roast", "Ritual", "Origins", "Reserve"],
    activePage: "Home",
    sections: createDefaultSectionsFromTemplate("w2"),
    createdAt: "2026-10-09T11:00:00Z",
    updatedAt: "2026-10-10T09:00:00Z",
    isFavorite: true,
    localPort: 3000,
  },
  {
    id: "proj-zenith-cloud",
    name: "Zenith AI Analytics Platform",
    description: "Enterprise SaaS landing page for real-time cloud data pipelines and telemetry.",
    templateId: "zenith-saas",
    templateSource: "built-in",
    category: "SaaS",
    style: "Modern Minimal Tech",
    theme: {
      primaryColor: "#356DFF",
      secondaryColor: "#0F172A",
      backgroundColor: "#FFFFFF",
      fontFamily: "Plus Jakarta Sans, sans-serif",
    },
    pages: ["Home", "Features", "Pricing"],
    activePage: "Home",
    sections: createDefaultSectionsFromTemplate("zenith-saas"),
    createdAt: "2026-10-08T14:20:00Z",
    updatedAt: "2026-10-09T17:45:00Z",
    isFavorite: true,
    localPort: 3000,
  },
  {
    id: "proj-aurora-studio",
    name: "Aurora Vance — Photography Atelier",
    description: "Architectural visual director portfolio showcasing curated editorial commissions.",
    templateId: "aurora-portfolio",
    templateSource: "built-in",
    category: "Portfolio",
    style: "Minimalist Editorial",
    theme: {
      primaryColor: "#1E293B",
      secondaryColor: "#64748B",
      backgroundColor: "#FAFAFA",
      fontFamily: "Outfit, sans-serif",
    },
    pages: ["Work", "About", "Contact"],
    activePage: "Work",
    sections: createDefaultSectionsFromTemplate("aurora-portfolio"),
    createdAt: "2026-10-07T09:10:00Z",
    updatedAt: "2026-10-08T11:00:00Z",
    isFavorite: false,
    localPort: 3000,
  },
];

// Server-side project memory store
declare global {
  var __sitegenai_server_projects: Map<string, WebsiteDocument> | undefined;
}

function getServerProjectsMap(): Map<string, WebsiteDocument> {
  if (!globalThis.__sitegenai_server_projects) {
    globalThis.__sitegenai_server_projects = new Map<string, WebsiteDocument>();
    for (const p of INITIAL_PROJECTS) {
      globalThis.__sitegenai_server_projects.set(p.id, p);
    }
  }
  return globalThis.__sitegenai_server_projects;
}

class ProjectService {
  private getStorage(): WebsiteDocument[] {
    if (typeof window === "undefined") {
      return Array.from(getServerProjectsMap().values());
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
        return INITIAL_PROJECTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_PROJECTS;
    }
  }

  private saveStorage(projects: WebsiteDocument[]): void {
    if (typeof window === "undefined") {
      const map = getServerProjectsMap();
      for (const p of projects) {
        map.set(p.id, p);
      }
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  public getProjects(): WebsiteDocument[] {
    return this.getStorage();
  }

  public getProjectById(id: string): WebsiteDocument | undefined {
    if (typeof window === "undefined") {
      return getServerProjectsMap().get(id);
    }
    const list = this.getStorage();
    return list.find((p) => p.id === id);
  }

  public saveProject(project: WebsiteDocument): void {
    const updated: WebsiteDocument = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window === "undefined") {
      const map = getServerProjectsMap();
      map.set(updated.id, updated);
      return;
    }

    const list = this.getStorage();
    const index = list.findIndex((p) => p.id === project.id);

    if (index >= 0) {
      list[index] = updated;
    } else {
      list.unshift(updated);
    }
    this.saveStorage(list);

    // Sync to backend API asynchronously
    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch((e) => console.warn("Server sync notice:", e));
  }

  public createFromTemplate(templateId: string, customName?: string): WebsiteDocument {
    const template = getTemplateById(templateId);
    const newId = `proj-${templateId}-${Date.now().toString(36)}`;
    const sections = createDefaultSectionsFromTemplate(templateId);

    const doc: WebsiteDocument = {
      id: newId,
      name: customName || (template ? `${template.name} Draft` : "New Project Draft"),
      description: template ? template.description : "Custom drafted website created in SiteGenAI.",
      templateId: templateId,
      templateSource: template?.source || "built-in",
      category: template?.categories[0] || "Landing Page",
      style: template?.style || "Modern",
      theme: {
        primaryColor: template?.colors.primary || "#356DFF",
        secondaryColor: template?.colors.secondary || "#071B32",
        backgroundColor: template?.colors.background || "#FFFFFF",
        fontFamily: "Outfit, Plus Jakarta Sans",
      },
      pages: template?.pages || ["Home"],
      activePage: "Home",
      sections: sections,
      localPort: 3000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    };

    const list = this.getStorage();
    list.unshift(doc);
    this.saveStorage(list);
    return doc;
  }

  public createFromBlueprint(blueprint: WebsiteBlueprint): WebsiteDocument {
    const newId = `proj-custom-${Date.now().toString(36)}`;
    
    // Map enabled blueprint sections into website sections
    const sections: WebsiteSection[] = blueprint.sections
      .filter((s) => s.enabled)
      .map((s, idx) => ({
        id: `sec-${s.type}-${idx}-${Date.now().toString(36)}`,
        type: s.type,
        name: s.name,
        visible: true,
        content: {
          badge: blueprint.purpose.slice(0, 30),
          title: s.name,
          subtitle: blueprint.name,
          description: s.description,
          buttonText: "Get Started",
          buttonLink: "#",
          items: [
            { title: "Designed with Purpose", description: "Tailored to align with your core brand message." },
            { title: "Pixel Perfect", description: "Formatted smoothly for all modern mobile and desktop screens." },
          ],
        },
        style: {
          backgroundColor: idx % 2 === 0 ? "#FFFFFF" : blueprint.palette.accent,
          textColor: "#172033",
          paddingY: "lg",
          alignment: "center",
          borderRadius: "none",
        },
        animation: "slide-up",
      }));

    const doc: WebsiteDocument = {
      id: newId,
      name: blueprint.name || "My Generated Website",
      description: blueprint.purpose || "Generated from prompt blueprint.",
      category: blueprint.type,
      style: blueprint.style,
      theme: {
        primaryColor: blueprint.palette.primary,
        secondaryColor: blueprint.palette.secondary,
        backgroundColor: blueprint.palette.background,
        fontFamily: blueprint.typography || "Plus Jakarta Sans, sans-serif",
      },
      pages: blueprint.pages,
      activePage: blueprint.pages[0] || "Home",
      sections: sections,
      localPort: 3000,
      isLiveAiGenerated: blueprint.isLiveAI,
      aiModelUsed: blueprint.modelUsed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    };

    const list = this.getStorage();
    list.unshift(doc);
    this.saveStorage(list);
    return doc;
  }

  public duplicateProject(id: string): WebsiteDocument | undefined {
    const target = this.getProjectById(id);
    if (!target) return undefined;

    const dupId = `proj-dup-${Date.now().toString(36)}`;
    const duplicated: WebsiteDocument = {
      ...JSON.parse(JSON.stringify(target)),
      id: dupId,
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    };

    const list = this.getStorage();
    list.unshift(duplicated);
    this.saveStorage(list);
    return duplicated;
  }

  public deleteProject(id: string): boolean {
    const list = this.getStorage();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length !== list.length) {
      this.saveStorage(filtered);
      if (typeof window !== "undefined") {
        fetch(`/api/projects/${id}`, { method: "DELETE" }).catch(() => {});
      }
      return true;
    }
    return false;
  }

  public renameProject(id: string, newName: string): boolean {
    const list = this.getStorage();
    const item = list.find((p) => p.id === id);
    if (item && newName.trim()) {
      item.name = newName.trim();
      item.updatedAt = new Date().toISOString();
      this.saveStorage(list);
      return true;
    }
    return false;
  }

  public toggleFavorite(id: string): boolean {
    const list = this.getStorage();
    const item = list.find((p) => p.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      this.saveStorage(list);
      return !!item.isFavorite;
    }
    return false;
  }

  /**
   * Download a real standalone ZIP archive of the project
   */
  public async downloadProjectZip(project: WebsiteDocument): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to generate ZIP export");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const slug = (project.name || "website").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      a.download = `${slug}-site.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true };
    } catch (err: any) {
      console.error("ZIP download error:", err);
      return { success: false, error: err.message };
    }
  }
}

export const projectService = new ProjectService();
