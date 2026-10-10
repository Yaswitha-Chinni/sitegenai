import { jsPDF } from "jspdf";
import { StoryboardDocument } from "@/types/storyboard";

export async function generateStoryboardPdf(storyboard: StoryboardDocument): Promise<Uint8Array> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Helper for adding headers and footers
  const addPageDecorations = (pageNum: number, totalPagesStr: string = "") => {
    // Top subtle bar
    doc.setFillColor(16, 185, 129); // Emerald
    doc.rect(margin, 10, contentWidth, 1.2, "F");

    // Header text
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFont("helvetica", "normal");
    doc.text("SiteGenAI — Interactive Website Storyboard Specification", margin, 16);
    doc.text(`v${storyboard.version}`, pageWidth - margin, 16, { align: "right" });

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Project: ${storyboard.projectName} • Status: ${storyboard.status}`, margin, pageHeight - 7);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  };

  // ============================================================================
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // ============================================================================
  addPageDecorations(1);

  let y = 28;

  // Badge
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(margin, y, 42, 6.5, 1.5, 1.5, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105);
  doc.text("WEBSITE STORYBOARD", margin + 3.5, y + 4.5);

  y += 13;

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(4, 18, 12);
  const titleLines = doc.splitTextToSize(storyboard.projectName, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8.5;

  // Category & Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Category: ${storyboard.category} • Created: ${new Date(storyboard.createdAt).toLocaleDateString()}`, margin, y);
  y += 10;

  // Purpose Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Website Purpose & Vision:", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  const purposeLines = doc.splitTextToSize(storyboard.purpose, contentWidth - 8);
  doc.text(purposeLines.slice(0, 3), margin + 4, y + 12);
  y += 30;

  // Design Direction & Audience Grid
  const colWidth = (contentWidth - 6) / 2;

  // Left col: Target Audience
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, colWidth, 22, 2, 2, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Target Audience:", margin + 3.5, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  const audienceLines = doc.splitTextToSize(storyboard.targetAudience, colWidth - 7);
  doc.text(audienceLines.slice(0, 2), margin + 3.5, y + 12);

  // Right col: Typography
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + colWidth + 6, y, colWidth, 22, 2, 2, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Typography Pairing:", margin + colWidth + 9.5, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Headings: ${storyboard.typography.headingFont}`, margin + colWidth + 9.5, y + 12);
  doc.text(`Body: ${storyboard.typography.bodyFont}`, margin + colWidth + 9.5, y + 17);

  y += 28;

  // Color Palette Swatches
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`Color Palette: ${storyboard.palette.name}`, margin, y);
  y += 5;

  const hexColors = [
    { label: "Primary", hex: storyboard.palette.primary },
    { label: "Secondary", hex: storyboard.palette.secondary },
    { label: "Background", hex: storyboard.palette.background },
    { label: "Accent", hex: storyboard.palette.accent },
  ];

  const swatchWidth = contentWidth / 4;
  hexColors.forEach((color, i) => {
    const sx = margin + i * swatchWidth;
    try {
      doc.setFillColor(color.hex);
    } catch {
      doc.setFillColor(16, 185, 129);
    }
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(sx, y, swatchWidth - 4, 12, 1.5, 1.5, "FD");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`${color.label} (${color.hex})`, sx + 1, y + 16.5);
  });

  y += 24;

  // Planned Architecture Summary
  const allSections = (storyboard.pages[0]?.sections || []).filter((s) => s.enabled);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`Planned Sections Architecture (${allSections.length} Sections Planned):`, margin, y);
  y += 6;

  allSections.forEach((s) => {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(`#${s.sectionNumber}`, margin, y);

    doc.setTextColor(30, 41, 59);
    doc.text(s.name, margin + 8, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`• ${s.type} layout (${s.layout})`, margin + 55, y);
    y += 5.2;
  });

  // Licensing & Non-AI Image Disclaimer
  y = pageHeight - 25;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Notice: All stock photographs are retrieved under official Pexels and Unsplash licenses with verified photographer attribution. Images are not fake AI generated.",
    margin,
    y
  );

  // ============================================================================
  // PAGES 2+: SECTION DETAIL CARDS
  // ============================================================================
  let currentPage = 2;
  doc.addPage();
  addPageDecorations(currentPage);
  y = 26;

  for (let idx = 0; idx < allSections.length; idx++) {
    const sec = allSections[idx];
    const cardHeight = 44;

    // Check if new page is needed
    if (y + cardHeight > pageHeight - 20) {
      currentPage++;
      doc.addPage();
      addPageDecorations(currentPage);
      y = 26;
    }

    // Card Container
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, "FD");

    // Header row of Card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, "FD");
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105);
    doc.text(`SECTION ${sec.sectionNumber}: ${sec.name.toUpperCase()}`, margin + 3.5, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Type: ${sec.type}  |  Layout: ${sec.layout}`, margin + contentWidth - 3.5, y + 5.5, { align: "right" });

    // Headline & Subheadline
    let cy = y + 13;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    const hlLines = doc.splitTextToSize(sec.headline, contentWidth - 7);
    doc.text(hlLines.slice(0, 1), margin + 3.5, cy);
    cy += 5;

    // Content summary
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(sec.contentSummary, contentWidth - 7);
    doc.text(summaryLines.slice(0, 2), margin + 3.5, cy);
    cy += 9;

    // Image & Attribution block
    const img = sec.selectedImage;
    if (img) {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(margin + 3.5, cy, contentWidth - 7, 12, 1, 1, "FD");

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 101, 52);
      doc.text(`Stock Photograph: ${img.alt || sec.name}`, margin + 5.5, cy + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const credit = `Photo by ${img.photographer} via ${img.source.toUpperCase()} (${img.width}x${img.height})`;
      doc.text(credit, margin + 5.5, cy + 8.5);
    } else {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text("No photograph specified for this section.", margin + 3.5, cy + 5);
    }

    y += cardHeight + 5;
  }

  const pdfOutput = doc.output("arraybuffer");
  return new Uint8Array(pdfOutput);
}
