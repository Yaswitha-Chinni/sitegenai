/**
 * BRUVA Coffee - Resilient Editorial Motion System
 * Combines CSS hardware-accelerated transitions with IntersectionObserver & GSAP.
 * Guarantees zero blank screens: content is visible by default.
 */

export function initAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Hero Entrance Animation
  const heroElements = document.querySelectorAll(
    '.hero-brand-mark, .hero-eyebrow, .hero-headline, .hero-supporting, .hero-cta-group, .scroll-indicator'
  );

  if (!prefersReducedMotion) {
    heroElements.forEach((el, idx) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.12}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.12}s`;
      
      // Trigger smoothly after load
      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 50);
      });
    });
  }

  // 2. Scroll Reveal for Sections (Ritual, Selection, Estate, Finale)
  const targets = document.querySelectorAll(
    '.ritual-section, .selection-section, .estate-section, .finale-section, .cinematic-media-container, .editorial-headline, .editorial-copy, .ritual-meta-grid, .tasting-notes-card, .feature-badges, .finale-content'
  );

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Once revealed, keep it visible
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    targets.forEach((el) => {
      // Mark for reveal transition
      el.classList.add('reveal-item');
      revealObserver.observe(el);
    });
  } else {
    targets.forEach((el) => {
      el.classList.add('is-revealed');
    });
  }
}
