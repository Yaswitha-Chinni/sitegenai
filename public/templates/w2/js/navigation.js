/**
 * BRUVA Coffee - Navigation & Mobile Drawer Controller
 */

export function initNavigation() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link, .drawer-link');
  const menuToggle = document.querySelector('.menu-toggle-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');

  // 1. Header scroll effect
  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 2. Mobile drawer toggle
  if (menuToggle && mobileDrawer) {
    function toggleDrawer() {
      const isOpen = mobileDrawer.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen.toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    menuToggle.addEventListener('click', toggleDrawer);

    // Close on link click
    mobileDrawer.querySelectorAll('.drawer-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileDrawer.classList.contains('open')) {
          toggleDrawer();
        }
      });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        toggleDrawer();
      }
    });
  }

  function scrollToElement(targetEl) {
    if (!targetEl) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(targetEl, { duration: 1.2 });
    } else {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // 3. Smooth scrolling for internal anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        scrollToElement(targetEl);
      }
    });
  });

  // 4. Scroll indicator click to scene 02
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const nextSection = document.getElementById('ritual');
      if (nextSection) {
        scrollToElement(nextSection);
      }
    });
  }

  // 5. Scroll-to-top button in finale
  const toTopBtn = document.querySelector('[data-scroll-top]');
  if (toTopBtn) {
    toTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
