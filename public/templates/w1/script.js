/**
 * COCO POUR — Cinematic Storyboard & Continuous Motion Controller
 * Features:
 * 1. Continuous scroll-linked animated blue SVG connector line with cubic Bezier curves & glowing nodes
 * 2. Alternating split entrances (left-video/right-text, then right-video/left-text)
 * 3. Smart IntersectionObserver video playback (single video in view)
 * 4. Custom desktop cursor with Lerp easing & magnetic buttons
 * 5. Interactive Moments tab switcher & Culinary Recipe Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none), (max-width: 992px)').matches;

  // ========================================================================
  // 1. Custom Desktop Cursor & Magnetic Buttons
  // ========================================================================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const cursorLabel = document.getElementById('cursor-label');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isCursorVisible = false;

  if (!isTouchDevice && cursorDot && cursorRing && !prefersReducedMotion) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isCursorVisible) {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        isCursorVisible = true;
      }

      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
      isCursorVisible = false;
    });

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    const interactiveElements = document.querySelectorAll('[data-cursor]');
    interactiveElements.forEach(el => {
      const cursorType = el.getAttribute('data-cursor');

      el.addEventListener('mouseenter', () => {
        if (cursorType === 'play') {
          cursorRing.classList.add('play');
          cursorLabel.textContent = 'PLAY';
        } else {
          cursorRing.classList.add('hovered');
        }
      });

      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('hovered', 'play');
        cursorLabel.textContent = '';
      });
    });

    const magneticButtons = document.querySelectorAll('[data-magnetic="true"]');
    magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.22;
        const deltaY = (e.clientY - centerY) * 0.22;

        btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // ========================================================================
  // 2. Ambient Cursor Proximity Spotlight (Hero)
  // ========================================================================
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroSection.style.setProperty('--mouse-x', `${x}%`);
      heroSection.style.setProperty('--mouse-y', `${y}%`);
    }, { passive: true });
  }

  // ========================================================================
  // 3. Header Scroll Glassmorphism & Mobile Menu
  // ========================================================================
  const siteHeader = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta');

  const handleHeaderScroll = () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      } else {
        mobileDrawer.classList.add('open');
        mobileToggle.classList.add('active');
        mobileToggle.setAttribute('aria-expanded', 'true');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // Active Nav Link Update
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const updateActiveNavLink = () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  // ========================================================================
  // 4. Smart Video Management (IntersectionObserver)
  // ========================================================================
  const videoElements = [
    document.getElementById('hero-video'),
    document.getElementById('story-video'),
    document.getElementById('pouring-video'),
    document.getElementById('product-video')
  ].filter(Boolean);

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              video.muted = true;
              video.play().catch(() => {});
            });
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, {
      root: null,
      threshold: 0.25
    });

    videoElements.forEach(video => {
      videoObserver.observe(video);
    });
  } else {
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) heroVideo.play().catch(() => {});
  }

  // Video Mute Buttons
  const videoControlButtons = document.querySelectorAll('.video-control-pill');
  videoControlButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-video-target');
      const targetVideo = document.getElementById(targetId);
      if (!targetVideo) return;

      const textSpan = btn.querySelector('.audio-state-text');
      const icon = btn.querySelector('.mute-icon');

      if (targetVideo.muted) {
        videoElements.forEach(v => { if (v !== targetVideo) v.muted = true; });
        targetVideo.muted = false;
        if (textSpan) textSpan.textContent = 'Sound On';
        if (icon) {
          icon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          `;
        }
      } else {
        targetVideo.muted = true;
        if (textSpan) textSpan.textContent = 'Muted';
        if (icon) {
          icon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          `;
        }
      }
    });
  });

  // ========================================================================
  // 5. Continuous Scroll-Linked Animated Blue Connector Line
  // ========================================================================
  const storyboardFlow = document.getElementById('storyboard-flow');
  const connectorSvg = document.getElementById('story-connector-svg');
  const pathBg = document.getElementById('connector-path-bg');
  const pathGlow = document.getElementById('connector-path-glow');
  const pathActive = document.getElementById('connector-path-active');

  const nodeHeroPt = document.getElementById('node-hero-pt');
  const nodeStoryPt = document.getElementById('node-story-pt');
  const nodePouringPt = document.getElementById('node-pouring-pt');
  const nodeProductPt = document.getElementById('node-product-pt');
  const nodePromoPt = document.getElementById('node-promo-pt');

  let pathTotalLength = 0;
  let cachedPoints = [];

  const updateConnectorLine = () => {
    if (!storyboardFlow || !connectorSvg || !pathActive || prefersReducedMotion) return;

    const flowRect = storyboardFlow.getBoundingClientRect();
    const flowWidth = storyboardFlow.offsetWidth;
    const flowHeight = storyboardFlow.offsetHeight;

    connectorSvg.setAttribute('viewBox', `0 0 ${flowWidth} ${flowHeight}`);
    connectorSvg.style.height = `${flowHeight}px`;

    // Anchor Elements
    const heroCard = document.querySelector('.hero-cinematic-theater');
    const storyCard = document.querySelector('.story-video-card');
    const pouringCard = document.querySelector('.pouring-video-card');
    const productCard = document.querySelector('.product-video-card');
    const promoCard = document.querySelector('.promo-visual-card');

    if (!heroCard || !storyCard || !pouringCard || !productCard || !promoCard) return;

    const getRelPos = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - flowRect.left + r.width / 2,
        y: r.top - flowRect.top + r.height / 2,
        top: r.top - flowRect.top,
        bottom: r.bottom - flowRect.top,
        left: r.left - flowRect.left,
        right: r.right - flowRect.left
      };
    };

    const heroPos = getRelPos(heroCard);
    const storyPos = getRelPos(storyCard);
    const pouringPos = getRelPos(pouringCard);
    const productPos = getRelPos(productCard);
    const promoPos = getRelPos(promoCard);

    let pts = [];

    if (flowWidth > 860) {
      // Desktop: Serpentine cubic Bezier weaving through alternating sections
      pts = [
        { x: flowWidth * 0.5, y: heroPos.bottom + 20 },                 // P0: Hero exit (center)
        { x: Math.max(30, storyPos.left - 25), y: storyPos.y },         // P1: Story video (curves around left)
        { x: Math.min(flowWidth - 30, pouringPos.right + 25), y: pouringPos.y }, // P2: Pouring video (curves around right)
        { x: flowWidth * 0.5, y: productPos.top - 20 },                 // P3: Product showcase (weaves to center)
        { x: flowWidth * 0.5, y: promoPos.top + 30 }                    // P4: Connects directly to promo milk drop!
      ];
    } else {
      // Mobile: Vertical undulating centered spine
      pts = [
        { x: flowWidth * 0.5, y: heroPos.bottom + 15 },
        { x: flowWidth * 0.25, y: storyPos.y },
        { x: flowWidth * 0.75, y: pouringPos.y },
        { x: flowWidth * 0.5, y: productPos.top - 15 },
        { x: flowWidth * 0.5, y: promoPos.top + 20 }
      ];
    }

    cachedPoints = pts;

    // Position glowing node circles along the path
    const setNodePos = (nodeEl, pt) => {
      if (nodeEl && pt) {
        nodeEl.style.left = `${pt.x}px`;
        nodeEl.style.top = `${pt.y}px`;
      }
    };

    setNodePos(nodeHeroPt, pts[0]);
    setNodePos(nodeStoryPt, pts[1]);
    setNodePos(nodePouringPt, pts[2]);
    setNodePos(nodeProductPt, pts[3]);
    setNodePos(nodePromoPt, pts[4]);

    // Build smooth cubic Bezier path
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const dy = (p1.y - p0.y) * 0.5;
      const cp1x = p0.x;
      const cp1y = p0.y + dy;
      const cp2x = p1.x;
      const cp2y = p1.y - dy;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    pathBg.setAttribute('d', d);
    pathGlow.setAttribute('d', d);
    pathActive.setAttribute('d', d);

    pathTotalLength = pathActive.getTotalLength();
    pathActive.style.strokeDasharray = `${pathTotalLength} ${pathTotalLength}`;
    pathGlow.style.strokeDasharray = `${pathTotalLength} ${pathTotalLength}`;

    onScrollProgress();
  };

  const onScrollProgress = () => {
    if (!storyboardFlow || !pathActive || pathTotalLength === 0 || prefersReducedMotion) return;

    const flowRect = storyboardFlow.getBoundingClientRect();
    const startOffset = window.innerHeight * 0.6;
    const scrollCurrent = -flowRect.top + startOffset;
    const scrollMax = flowRect.height - 200;

    let progress = scrollCurrent / scrollMax;
    progress = Math.max(0, Math.min(1, progress));

    const dashOffset = pathTotalLength * (1 - progress);
    pathActive.style.strokeDashoffset = `${dashOffset}`;
    pathGlow.style.strokeDashoffset = `${dashOffset}`;

    // Glow line nodes as scroll passes them
    const currentY = -flowRect.top + window.innerHeight * 0.5;
    const nodes = [
      { el: nodeHeroPt, pt: cachedPoints[0] },
      { el: nodeStoryPt, pt: cachedPoints[1] },
      { el: nodePouringPt, pt: cachedPoints[2] },
      { el: nodeProductPt, pt: cachedPoints[3] },
      { el: nodePromoPt, pt: cachedPoints[4] }
    ];

    nodes.forEach(({ el, pt }) => {
      if (el && pt) {
        if (currentY >= pt.y - 120) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });
  };

  window.addEventListener('resize', updateConnectorLine);
  window.addEventListener('scroll', onScrollProgress, { passive: true });
  setTimeout(updateConnectorLine, 250);

  // ========================================================================
  // 6. GSAP Motion & Alternating Split Entrances
  // ========================================================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Entrance Timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    gsap.set('#hero .reveal-word', { yPercent: 120, opacity: 0 });

    heroTl
      .from('.hero-tag-reveal', { opacity: 0, y: 15, duration: 0.6 })
      .to('#hero .reveal-word', { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.14 }, '-=0.3')
      .from('.hero-desc-reveal', { opacity: 0, y: 20, duration: 0.7 }, '-=0.4')
      .from('.hero-buttons-reveal .btn', { opacity: 0, y: 20, stagger: 0.15, duration: 0.6 }, '-=0.4')
      .from('.hero-badges-reveal .badge-item', { opacity: 0, y: 15, stagger: 0.1, duration: 0.5 }, '-=0.3')
      .from('.hero-cinematic-theater', { opacity: 0, scale: 0.94, duration: 1.1, ease: 'power2.out' }, '-=0.8')
      .from('.floating-product-pill', { opacity: 0, y: -15, duration: 0.6 }, '-=0.5')
      .from('.hero-scroll-cue', { opacity: 0, y: 15, duration: 0.6 }, '-=0.3');

    // Section 2 (Story): Left Video slides from left, Right Text staggers from right
    gsap.from('.story-section .slide-from-left', {
      scrollTrigger: {
        trigger: '.story-section',
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      x: -60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    gsap.from('.story-section .stagger-from-right', {
      scrollTrigger: {
        trigger: '.story-section',
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      x: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    // Section 3 (Pouring): Left Text staggers from left, Right Video slides from right
    gsap.from('.pouring-section .stagger-from-left', {
      scrollTrigger: {
        trigger: '.pouring-section',
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      x: -60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    gsap.from('.pouring-section .slide-from-right', {
      scrollTrigger: {
        trigger: '.pouring-section',
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      x: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    // Section 4 (Product Showcase): Large focal panel scale & spotlight
    gsap.from('.product-video-card', {
      scrollTrigger: {
        trigger: '.product-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      scale: 0.94,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out'
    });

    gsap.from('.benefit-card', {
      scrollTrigger: {
        trigger: '.benefits-list',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      x: 35,
      stagger: 0.15,
      duration: 0.75,
      ease: 'power2.out'
    });

    // Section 5 (Promotional Banner): Entrance
    gsap.from('.promo-grid', {
      scrollTrigger: {
        trigger: '.promo-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power2.out'
    });

    // Section 6 (Editorial Cards): Stagger
    gsap.from('.recipe-card', {
      scrollTrigger: {
        trigger: '.recipes-grid',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 35,
      stagger: 0.16,
      duration: 0.8,
      ease: 'power2.out'
    });
  }

  // ========================================================================
  // 7. Moments Tab Switcher (Section 3)
  // ========================================================================
  const momentData = {
    latte: {
      title: "The Morning Flat White",
      desc: "Engineered with natural plant fats that steam and stretch like dairy, producing glossy micro-foam without separating or altering the delicate nuances of specialty espresso beans."
    },
    matcha: {
      title: "Iced Ceremonial Matcha Cloud",
      desc: "Earthy, stone-ground green tea floated gently over cold-pressed coconut milk. Natural coconut sweetness balances the vibrant umami for an energizing midday refresh."
    },
    smoothie: {
      title: "Tropical Superfood Smoothie Bowl",
      desc: "A rich, indulgent base packed with clean MCT fats that emulsify seamlessly with frozen acai, pitaya, and fresh mango. Creamy consistency without any heavy dairy feel."
    },
    culinary: {
      title: "Artisanal Southeast Asian Curries",
      desc: "Crafted to hold up at high cooking heat without breaking or turning oily. Infuses comforting curries, soups, and marinades with pure, authentic tropical body and aroma."
    }
  };

  const momentButtons = document.querySelectorAll('.moment-tab-btn');
  const momentCard = document.getElementById('moment-card-content');

  if (momentButtons.length && momentCard) {
    momentButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-moment');
        if (!momentData[key]) return;

        momentButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        momentCard.style.opacity = '0';
        momentCard.style.transform = 'translateY(8px)';
        setTimeout(() => {
          momentCard.innerHTML = `
            <h3 class="moment-card-title">${momentData[key].title}</h3>
            <p class="moment-card-desc">${momentData[key].desc}</p>
          `;
          momentCard.style.opacity = '1';
          momentCard.style.transform = 'translateY(0)';
        }, 160);
      });
    });
  }

  // ========================================================================
  // 8. Culinary Recipe Modal
  // ========================================================================
  const recipeModal = document.getElementById('recipe-modal');
  const recipeModalClose = document.getElementById('recipe-modal-close');
  const recipeModalBody = document.getElementById('recipe-modal-body');
  const recipeOpenButtons = document.querySelectorAll('.recipe-open-btn');

  const recipeDatabase = {
    flatwhite: {
      title: "Iced Coconut Flat White",
      category: "Specialty Coffee",
      prep: "3 Minutes",
      ingredients: [
        "120ml COCO POUR Coconut Milk",
        "60ml Fresh Double Shot Espresso (Medium/Light Roast)",
        "Handful of clean artisanal ice cubes",
        "Dash of Ceylon cinnamon (optional)"
      ],
      instructions: [
        "1. Cold-froth 120ml of chilled COCO POUR using a handheld frother until glossy microfoam forms.",
        "2. Fill a double-walled glass with ice.",
        "3. Pour cold-frothed COCO POUR over the ice.",
        "4. Slowly pull your double espresso shot and float it gently over the coconut milk to create a defined two-tone gradient.",
        "5. Garnish with a light dusting of Ceylon cinnamon."
      ],
      baristaNotes: "COCO POUR’s high natural fat content prevents the milk from splitting when hitting acidic light-roast espresso."
    },
    smoothie: {
      title: "Tropical Glow Smoothie Bowl",
      category: "Breakfast & Wellness",
      prep: "5 Minutes",
      ingredients: [
        "180ml COCO POUR Coconut Milk",
        "1 cup Frozen Alphonso mango chunks",
        "1/2 cup Frozen pink pitaya (dragonfruit)",
        "Handful baby spinach",
        "Toppings: Chia seeds, toasted coconut flakes, kiwi"
      ],
      instructions: [
        "1. Add COCO POUR into blender base first.",
        "2. Add frozen mango, pitaya, and spinach.",
        "3. Blend on low speed, tamping down until an ultra-thick, soft-serve ice cream texture is reached.",
        "4. Scoop into a chilled coconut bowl.",
        "5. Top with toasted coconut flakes, sliced kiwi, and organic chia seeds."
      ],
      baristaNotes: "Natural MCTs emulsify with frozen fruits for a velvety texture without adding bananas or protein powder."
    },
    curry: {
      title: "Aromatic Lemongrass Green Curry",
      category: "Gourmet Culinary",
      prep: "20 Minutes",
      ingredients: [
        "250ml COCO POUR Coconut Milk",
        "2 tbsp Authentic green curry paste",
        "1 stalk Fresh lemongrass, bruised",
        "4 Fresh kaffir lime leaves",
        "200g Crispy tofu or plant protein",
        "1 cup Baby eggplant and bamboo shoots"
      ],
      instructions: [
        "1. In a heavy wok, gently heat 3 tbsp of COCO POUR over medium heat until natural coconut oil begins to separate.",
        "2. Add the curry paste and fry for 2 minutes until fragrant.",
        "3. Pour in the remaining COCO POUR, bruised lemongrass, and kaffir lime leaves. Bring to a gentle simmer.",
        "4. Add vegetables and protein, simmering for 8 minutes until tender.",
        "5. Season with sea salt and serve immediately with jasmine rice."
      ],
      baristaNotes: "COCO POUR is heat-stable and will not break into greasy layers under culinary wok temperatures."
    }
  };

  const openRecipeModal = (key) => {
    const data = recipeDatabase[key];
    if (!data || !recipeModal || !recipeModalBody) return;

    recipeModalBody.innerHTML = `
      <div class="section-tag">${data.category} • ${data.prep}</div>
      <h3 class="modal-title">${data.title}</h3>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 22px;">Crafted with pure COCO POUR cold-pressed coconut milk.</p>

      <h4 style="font-family: var(--font-heading); color: var(--dark-navy); margin-bottom: 10px;">Ingredients</h4>
      <ul style="margin-left: 20px; margin-bottom: 20px; font-size: 0.92rem; color: var(--text-muted); line-height: 1.7;">
        ${data.ingredients.map(i => `<li>${i}</li>`).join('')}
      </ul>

      <h4 style="font-family: var(--font-heading); color: var(--dark-navy); margin-bottom: 10px;">Preparation</h4>
      <ol style="margin-left: 20px; margin-bottom: 20px; font-size: 0.92rem; color: var(--text-muted); line-height: 1.7;">
        ${data.instructions.map(step => `<li>${step}</li>`).join('')}
      </ol>

      <div style="background: var(--coconut-cream); padding: 16px 20px; border-radius: var(--radius-sm); border-left: 4px solid var(--vibrant-blue);">
        <strong style="color: var(--dark-navy); font-size: 0.9rem;">Barista Note:</strong>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 4px;">${data.baristaNotes}</p>
      </div>
    `;

    recipeModal.classList.add('active');
    recipeModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  recipeOpenButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-recipe');
      openRecipeModal(key);
    });
  });

  const closeRecipeModal = () => {
    if (recipeModal) {
      recipeModal.classList.remove('active');
      recipeModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (recipeModalClose) recipeModalClose.addEventListener('click', closeRecipeModal);
  if (recipeModal) {
    recipeModal.addEventListener('click', (e) => {
      if (e.target === recipeModal) closeRecipeModal();
    });
  }

  // ========================================================================
  // 9. Nutrition Modal & Retailer Store Alert
  // ========================================================================
  const openNutritionBtn = document.getElementById('open-nutrition-btn');
  const nutritionModal = document.getElementById('nutrition-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');
  const promoLocateBtn = document.getElementById('promo-locate-btn');

  const openModal = () => {
    if (nutritionModal) {
      nutritionModal.classList.add('active');
      nutritionModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    if (nutritionModal) {
      nutritionModal.classList.remove('active');
      nutritionModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (openNutritionBtn) openNutritionBtn.addEventListener('click', openModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (nutritionModal) {
    nutritionModal.addEventListener('click', (e) => {
      if (e.target === nutritionModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeRecipeModal();
    }
  });

  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', () => {
      closeModal();
      const promoSection = document.getElementById('promo');
      if (promoSection) promoSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (promoLocateBtn) {
    promoLocateBtn.addEventListener('click', () => {
      alert('COCO POUR is currently stocked in the refrigerated beverage section at Whole Foods Market, Sprouts Farmers Market, Erewhon, and select Target stores nationwide!');
    });
  }

  // ========================================================================
  // 10. Newsletter Form Validation
  // ========================================================================
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const newsletterFeedback = document.getElementById('newsletter-feedback');

  if (newsletterForm && newsletterEmail && newsletterFeedback) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailValue = newsletterEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailValue) {
        newsletterFeedback.className = 'newsletter-feedback error';
        newsletterFeedback.textContent = 'Please enter your email address.';
        newsletterEmail.focus();
        return;
      }

      if (!emailRegex.test(emailValue)) {
        newsletterFeedback.className = 'newsletter-feedback error';
        newsletterFeedback.textContent = 'Please enter a valid email address (e.g., hello@example.com).';
        newsletterEmail.focus();
        return;
      }

      newsletterFeedback.className = 'newsletter-feedback success';
      newsletterFeedback.textContent = '✓ Thank you for subscribing! Welcome to the COCO POUR community.';
      newsletterEmail.value = '';

      setTimeout(() => {
        newsletterFeedback.textContent = '';
      }, 6000);
    });
  }

  // ========================================================================
  // 11. Back to Top Button
  // ========================================================================
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
