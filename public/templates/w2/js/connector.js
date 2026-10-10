/**
 * BRUVA Coffee - Signature Electric Blue Connector Line & Scroll Journey Controller
 * Coordinates the left-rail chapter tracker and the continuous SVG narrative path.
 */

export function initConnectorSystem() {
  const sections = [
    { id: 'hero', nodeIndex: 0 },
    { id: 'ritual', nodeIndex: 1 },
    { id: 'selection', nodeIndex: 2 },
    { id: 'estate', nodeIndex: 3 },
    { id: 'finale', nodeIndex: 4 },
  ];

  const journeyNodes = document.querySelectorAll('.journey-node');
  const progressLine = document.querySelector('.journey-line-progress');
  const svgPath = document.querySelector('.svg-connector-path');
  const svgCanvas = document.querySelector('.svg-connector-canvas');

  // --- 1. LEFT RAIL JOURNEY NAVIGATION & TRACKING ---
  function updateJourneyRail() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollProgress = Math.min(Math.max(scrollY / (docHeight || 1), 0), 1);

    // Update vertical progress line height
    if (progressLine) {
      progressLine.style.height = `${scrollProgress * 100}%`;
    }

    // Determine current active section
    let activeIndex = 0;
    sections.forEach((sec, idx) => {
      const el = document.getElementById(sec.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Section is active if its top is near or above 40% of viewport
        if (rect.top <= windowHeight * 0.45) {
          activeIndex = idx;
        }
      }
    });

    journeyNodes.forEach((node, idx) => {
      if (idx === activeIndex) {
        node.classList.add('active');
        node.setAttribute('aria-current', 'step');
      } else {
        node.classList.remove('active');
        node.removeAttribute('aria-current');
      }
    });
  }

  // Node click handlers for smooth jump
  journeyNodes.forEach((node) => {
    node.addEventListener('click', () => {
      const targetId = node.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        if (window.__lenis) {
          window.__lenis.scrollTo(targetEl, { duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // --- 2. DYNAMIC CONTINUOUS SVG SPLINE PATH ---
  let pathLength = 0;

  function buildConnectorSpline() {
    if (!svgPath || !svgCanvas) return;

    const pageHeight = document.documentElement.scrollHeight;
    const pageWidth = document.documentElement.clientWidth;

    svgCanvas.setAttribute('width', pageWidth);
    svgCanvas.setAttribute('height', pageHeight);
    svgCanvas.setAttribute('viewBox', `0 0 ${pageWidth} ${pageHeight}`);

    // Milestone coordinates
    const heroEl = document.getElementById('hero');
    const ritualEl = document.getElementById('ritual');
    const selectionEl = document.getElementById('selection');
    const estateEl = document.getElementById('estate');
    const finaleEl = document.getElementById('finale');

    if (!heroEl || !ritualEl || !selectionEl || !estateEl || !finaleEl) return;

    const getCenter = (el) => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.pageYOffset;
      return {
        x: rect.left + rect.width / 2,
        y: top + rect.height / 2,
        top: top,
        bottom: top + rect.height,
        left: rect.left,
        right: rect.left + rect.width,
      };
    };

    const heroCoords = getCenter(heroEl);
    const ritualMedia = ritualEl.querySelector('.cinematic-media-container');
    const selectionMedia = selectionEl.querySelector('.cinematic-media-container');
    const estatePanoramic = estateEl.querySelector('.estate-panoramic-wrapper');
    const finaleCrest = finaleEl.querySelector('.finale-brand-crest');

    const p0 = { x: heroCoords.x, y: heroCoords.top + heroEl.offsetHeight * 0.75 };
    const p1 = ritualMedia ? getCenter(ritualMedia) : { x: pageWidth * 0.35, y: ritualEl.offsetTop + 300, top: ritualEl.offsetTop + 200, bottom: ritualEl.offsetTop + 600, left: pageWidth * 0.1, right: pageWidth * 0.5 };
    const p2 = selectionMedia ? getCenter(selectionMedia) : { x: pageWidth * 0.65, y: selectionEl.offsetTop + 300, top: selectionEl.offsetTop + 200, bottom: selectionEl.offsetTop + 600, left: pageWidth * 0.5, right: pageWidth * 0.9 };
    const p3 = estatePanoramic ? getCenter(estatePanoramic) : { x: pageWidth * 0.5, y: estateEl.offsetTop + 200, top: estateEl.offsetTop, bottom: estateEl.offsetTop + 500 };
    const p4 = finaleCrest ? getCenter(finaleCrest) : { x: pageWidth * 0.5, y: finaleEl.offsetTop + 150, top: finaleEl.offsetTop + 100 };

    // Construct a flowing smooth cubic Bezier path
    const pathD = `
      M ${p0.x} ${p0.y}
      C ${p0.x} ${p0.y + 200}, ${p1.left} ${p1.top - 150}, ${p1.left + 20} ${p1.top}
      S ${p1.right + 60} ${p1.bottom + 100}, ${p2.left - 40} ${p2.top - 100}
      C ${p2.right + 20} ${p2.top + 80}, ${p2.left} ${p2.bottom + 80}, ${p3.x - 120} ${p3.top}
      S ${p3.x + 120} ${p3.bottom - 40}, ${p4.x} ${p4.top - 100}
      L ${p4.x} ${p4.top}
    `;

    svgPath.setAttribute('d', pathD.trim());
    pathLength = svgPath.getTotalLength();
    svgPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
    updateSvgProgress();
  }

  function updateSvgProgress() {
    if (!svgPath || pathLength === 0) return;
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const maxScroll = document.documentElement.scrollHeight - windowHeight;
    const progress = Math.min(Math.max(scrollY / (maxScroll || 1), 0), 1);

    // Eased stroke drawing
    const drawOffset = pathLength - progress * pathLength;
    svgPath.style.strokeDashoffset = drawOffset;
  }

  // --- 3. SCROLL & RESIZE LISTENERS ---
  let isTicking = false;
  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateJourneyRail();
        updateSvgProgress();
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    buildConnectorSpline();
    updateJourneyRail();
  }, { passive: true });

  // Initial call after DOM settles
  setTimeout(() => {
    buildConnectorSpline();
    updateJourneyRail();
  }, 150);
}
