/**
 * BRUVA Coffee - Luxury Interactive Magnetic Cursor
 * Smooth lerp motion, interactive context states, and touch suppression.
 */

export function initCustomCursor() {
  // Suppress on touch / coarse pointer devices or reduced motion
  if (window.matchMedia('(pointer: coarse)').matches || 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const cursorRing = document.querySelector('.cursor-ring');
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorText = document.querySelector('.cursor-text');

  if (!cursorRing || !cursorDot) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;
  let isVisible = false;

  const lerp = (start, end, factor) => start + (end - start) * factor;

  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      cursorRing.style.opacity = '1';
      cursorDot.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursorRing.style.opacity = '0';
    cursorDot.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursorRing.style.opacity = '1';
    cursorDot.style.opacity = '1';
  });

  // Render loop with requestAnimationFrame
  function renderCursor() {
    // Fast tracking for center dot, smooth trailing for outer ring
    dotX = lerp(dotX, mouseX, 0.45);
    dotY = lerp(dotY, mouseY, 0.45);

    ringX = lerp(ringX, mouseX, 0.15);
    ringY = lerp(ringY, mouseY, 0.15);

    cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states for links & buttons
  const interactiveElements = document.querySelectorAll('a, button, .journey-node, .scroll-indicator');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  // Hover states for cinematic media containers (display "EXPLORE" / "VIEW")
  const mediaContainers = document.querySelectorAll('.cinematic-media-container, .hero-section');
  mediaContainers.forEach((container) => {
    container.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-media');
      if (cursorText) {
        cursorText.textContent = container.getAttribute('data-cursor') || 'EXPLORE';
      }
    });
    container.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-media');
      if (cursorText) {
        cursorText.textContent = '';
      }
    });
  });

  // Magnetic attraction effect for CTA buttons
  const magneticButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-cyan');
  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - btnCenterX) * 0.25;
      const deltaY = (e.clientY - btnCenterY) * 0.25;

      btn.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}
