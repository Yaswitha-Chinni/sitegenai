/**
 * BRUVA Coffee - Master Experience Orchestrator
 */

import { initVideoController } from './video.js';
import { initCustomCursor } from './cursor.js';
import { initConnectorSystem } from './connector.js';
import { initAnimations } from './animations.js';
import { initAmbientAudio } from './audio.js';
import { initNavigation } from './navigation.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis smooth inertia scroll if available and reduced motion is false
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenisInstance = null;

  if (typeof window.Lenis !== 'undefined' && !prefersReducedMotion) {
    lenisInstance = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger if present
    if (typeof window.ScrollTrigger !== 'undefined') {
      lenisInstance.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    }

    window.__lenis = lenisInstance;
  }

  // 2. Initialize video subsystem
  initVideoController();

  // 3. Initialize custom magnetic cursor
  initCustomCursor();

  // 4. Initialize signature blue connector & scroll rail
  initConnectorSystem();

  // 5. Initialize cinematic animations
  initAnimations();

  // 6. Initialize ambient sound toggle
  initAmbientAudio();

  // 7. Initialize navigation & mobile drawer
  initNavigation();

  // 8. Direct section query parameter support & preview mode
  const params = new URLSearchParams(window.location.search);
  const previewParam = params.get('preview');
  if (previewParam) {
    const allSections = document.querySelectorAll('main > section');
    allSections.forEach((sec) => {
      if (sec.id !== previewParam) {
        sec.style.display = 'none';
      } else {
        sec.style.display = 'flex';
        sec.style.minHeight = '100vh';
        sec.classList.add('is-revealed');
        sec.querySelectorAll('.reveal-item').forEach((el) => el.classList.add('is-revealed'));
      }
    });
  } else {
    const targetSec = params.get('section');
    if (targetSec) {
      const secEl = document.getElementById(targetSec);
      if (secEl) {
        setTimeout(() => {
          secEl.scrollIntoView({ behavior: 'instant' });
        }, 100);
      }
    }
  }

  console.log('BRUVA Coffee Experience initialized successfully.');
});
