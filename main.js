/**
 * ============================================================
 * BEAN & BLOOM CAFÉ — MAIN JAVASCRIPT
 * Premium Café Website
 * Location: Jubilee Hills, Hyderabad
 * Libraries: GSAP, ScrollTrigger, Lenis, SplitType
 * ============================================================
 */

/* ──────────────────────────────────────────────────────────
0. CORE INIT & ANIMATION BOOTSTRAP
────────────────────────────────────────────────────────── */
function initCore() {
  initNav();
  initMenuFilter();
  initGuestsSelector();
  initReservationForm();
}

function initAnimationsWhenReady() {
  setTimeout(() => {
    try {
      if (typeof gsap !== 'undefined') {
        if (typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
        }

        initLoader();
        initCursor();
        initSignatureImageAnimations();
        initTestimonials();
      } else {
        const loader = document.getElementById('loader');

        if (loader) {
          loader.classList.add('is-hidden');
        }

        document.body.style.overflow = '';
      }
    } catch (err) {
      console.warn('Animation initialization notice:', err);

      const loader = document.getElementById('loader');

      if (loader) {
        loader.classList.add('is-hidden');
      }

      document.body.style.overflow = '';
    }
  }, 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCore();
    initAnimationsWhenReady();
  });
} else {
  initCore();
  initAnimationsWhenReady();
}


/* ──────────────────────────────────────────────────────────
1. PAGE LOADER
────────────────────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loader-fill');

  if (!loader || !fill) {
    initLenis();
    initAnimations();
    return;
  }

  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18;

    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      fill.style.width = '100%';

      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.7,
          ease: 'power2.inOut',

          onComplete: () => {
            loader.classList.add('is-hidden');
            document.body.style.overflow = '';

            initLenis();
            initAnimations();
          }
        });
      }, 400);
    } else {
      fill.style.width = progress + '%';
    }
  }, 120);

  document.body.style.overflow = 'hidden';
}


/* ──────────────────────────────────────────────────────────
2. LENIS SMOOTH SCROLL
────────────────────────────────────────────────────────── */
let lenisInstance;

function initLenis() {
  if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') {
    return;
  }

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2
  });

  gsap.ticker.add((time) => {
    if (lenisInstance) {
      lenisInstance.raf(time * 1000);
    }
  });

  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');

      if (!href || href === '#') return;

      const target = document.querySelector(href);

      if (target && lenisInstance) {
        e.preventDefault();

        lenisInstance.scrollTo(target, {
          offset: -80,
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });

        closeMobileMenu();
      }
    });
  });
}


/* ──────────────────────────────────────────────────────────
3. ALL SCROLL ANIMATIONS
────────────────────────────────────────────────────────── */
function initAnimations() {
  if (typeof gsap === 'undefined') return;

  animateHeroEntrance();
  initTextReveal();
  initFadeReveal();
  initSlideUpReveal();
  initClipReveal();
  initHeroParallax();
  initAtmosphereParallax();
  initMagneticButtons();
  initGalleryReveal();
  initMenuCardsReveal();

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
}


/* ── A. Hero entrance ─────────────────────────────────────── */
function animateHeroEntrance() {
  const tl = gsap.timeline({ delay: 0.1 });

  const heroImg = document.querySelector('#hero-img');

  if (heroImg) {
    tl.fromTo(
      heroImg,
      { scale: 1.12 },
      {
        scale: 1,
        duration: 1.8,
        ease: 'power3.out'
      }
    );
  }

  const heroOverlay = document.querySelector('.hero-overlay');

  if (heroOverlay) {
    tl.fromTo(
      heroOverlay,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out'
      },
      '-=1.8'
    );
  }

  const eyebrow = document.querySelector('.hero-eyebrow');

  if (eyebrow) {
    tl.fromTo(
      eyebrow,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      },
      '-=0.6'
    );
  }

  const titleLines = document.querySelectorAll('.hero-title-line');

  if (titleLines.length > 0 && typeof SplitType !== 'undefined') {
    titleLines.forEach(line => {
      new SplitType(line, { types: 'words' });
    });

    const words = document.querySelectorAll('.hero-title-line .word');

    tl.fromTo(
      words,
      { y: '110%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.06
      },
      '-=0.4'
    );
  }

  const tagline = document.querySelector('.hero-tagline');

  if (tagline) {
    tl.fromTo(
      tagline,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      },
      '-=0.5'
    );
  }

  const ctaButtons = document.querySelectorAll('.hero-cta .btn');

  if (ctaButtons.length) {
    tl.fromTo(
      ctaButtons,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12
      },
      '-=0.5'
    );
  }

  const scrollIndicator = document.querySelector('#scroll-indicator');

  if (scrollIndicator) {
    tl.fromTo(
      scrollIndicator,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      },
      '-=0.3'
    );
  }
}


/* ── B. Text split reveal ────────────────────────────────── */
function initTextReveal() {
  if (typeof SplitType === 'undefined') return;

  const textEls = document.querySelectorAll('.reveal-text');

  textEls.forEach(el => {
    if (el.closest('.hero')) return;

    const splitType = el.dataset.split || 'words';
    const split = new SplitType(el, { types: splitType });

    const targets =
      splitType === 'chars'
        ? split.chars
        : split.words;

    if (!targets || targets.length === 0) return;

    targets.forEach(t => {
      const wrapper = document.createElement('span');

      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.verticalAlign = 'bottom';

      if (t.parentNode) {
        t.parentNode.insertBefore(wrapper, t);
        wrapper.appendChild(t);
      }
    });

    gsap.fromTo(
      targets,
      { y: '110%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.9,
        ease: 'power4.out',
        stagger: splitType === 'chars' ? 0.025 : 0.06,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}


/* ── C. Fade reveal ──────────────────────────────────────── */
function initFadeReveal() {
  const fadeEls = document.querySelectorAll('.reveal-fade');

  fadeEls.forEach(el => {
    if (el.closest('.hero')) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}


/* ── D. Slide-up reveal ─────────────────────────────────── */
function initSlideUpReveal() {
  const upEls = document.querySelectorAll('.reveal-up');

  upEls.forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: (i % 3) * 0.08,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}


/* ── E. Clip reveal ────────────────────────────────────── */
function initClipReveal() {
  const clipEls = document.querySelectorAll('.clip-reveal');

  clipEls.forEach(el => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );

    const img = el.querySelector('img');

    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.1 },
        {
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        }
      );
    }
  });
}


/* ── F. Hero parallax ───────────────────────────────────── */
function initHeroParallax() {
  const heroWrap = document.querySelector('#hero-img-wrap');
  const hero = document.querySelector('.hero');

  if (!heroWrap || !hero) return;

  gsap.to(heroWrap, {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2
    }
  });
}


/* ── G. Atmosphere parallax ─────────────────────────────── */
function initAtmosphereParallax() {
  const elements = document.querySelectorAll(
    '.atmosphere-img, .atmosphere-shape, .parallax'
  );

  elements.forEach(el => {
    gsap.to(el, {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2
      }
    });
  });
}


/* ── G1. Signature dishes image animations ──────────────── */
function initSignatureImageAnimations() {
  const signatureItems = document.querySelectorAll('.signature-item');

  signatureItems.forEach(item => {
    const wrap = item.querySelector('.signature-image-wrap');
    const img = item.querySelector('.signature-img');

    if (!wrap || !img) return;

    gsap.fromTo(
      img,
      { yPercent: -10, scale: 1.18 },
      {
        yPercent: 10,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      }
    );
  });
}


/* ── H. Magnetic button effect ─────────────────────────── */
function initMagneticButtons() {
  const magneticEls = document.querySelectorAll('.magnetic');

  magneticEls.forEach(el => {
    const xTo = gsap.quickTo(el, 'x', {
      duration: 0.4,
      ease: 'power3.out'
    });

    const yTo = gsap.quickTo(el, 'y', {
      duration: 0.4,
      ease: 'power3.out'
    });

    let rafId = null;
    let targetX = 0;
    let targetY = 0;

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const maxDist =
        Math.max(rect.width, rect.height) * 0.7;

      const distance =
        Math.sqrt(dx * dx + dy * dy);

      const pull =
        Math.max(0, 1 - distance / maxDist);

      targetX = dx * pull * 0.45;
      targetY = dy * pull * 0.45;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          xTo(targetX);
          yTo(targetY);
          rafId = null;
        });
      }
    });

    el.addEventListener('mouseleave', () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1.2, 0.5)'
      });
    });
  });
}


/* ── I. Gallery stagger reveal ──────────────────────────── */
function initGalleryReveal() {
  const galleryItems =
    document.querySelectorAll('.gallery-item');

  const gallery =
    document.querySelector('#gallery-masonry');

  if (!galleryItems.length || !gallery) return;

  gsap.fromTo(
    galleryItems,
    {
      opacity: 0,
      y: 40,
      scale: 0.96
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.10,
      scrollTrigger: {
        trigger: gallery,
        start: 'top 85%',
        once: true
      }
    }
  );
}


/* ── J. Menu cards stagger ──────────────────────────────── */
function initMenuCardsReveal() {
  const cards =
    document.querySelectorAll('.menu-card');

  const grid =
    document.querySelector('#menu-grid');

  if (!cards.length || !grid) return;

  gsap.fromTo(
    cards,
    {
      opacity: 0,
      y: 40
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: grid,
        start: 'top 88%',
        once: true
      }
    }
  );
}


/* ──────────────────────────────────────────────────────────
4. CUSTOM CURSOR
────────────────────────────────────────────────────────── */
function initCursor() {
  const cursor = document.getElementById('cursor');

  if (!cursor) return;

  if (window.matchMedia('(hover: hover)').matches) {
    cursor.style.display = 'block';

    let mouseX = 0;
    let mouseY = 0;

    let dotX = 0;
    let dotY = 0;

    let ringX = 0;
    let ringY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');

    function animateCursor() {
      dotX += (mouseX - dotX) * 0.85;
      dotY += (mouseY - dotY) * 0.85;

      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      if (dot) {
        dot.style.transform =
          `translate(${dotX}px, ${dotY}px)`;
      }

      if (ring) {
        ring.style.transform =
          `translate(${ringX}px, ${ringY}px)`;
      }

      requestAnimationFrame(animateCursor);
    }

    animateCursor();

    const hoverTargets =
      'a, button, .menu-tab, .btn, .menu-card, .gallery-item, .testimonial-btn, .guests-btn';

    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });

      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });

    document.querySelectorAll(
      'p, h1, h2, h3, blockquote'
    ).forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-text');
      });

      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-text');
      });
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
    });
  } else {
    cursor.style.display = 'none';
  }
}


/* ──────────────────────────────────────────────────────────
5. NAVIGATION
────────────────────────────────────────────────────────── */
function initNav() {
  const navbar =
    document.getElementById('navbar');

  const hamburger =
    document.getElementById('nav-hamburger');

  const mobileMenu =
    document.getElementById('mobile-menu');

  const closeBtn =
    document.getElementById('mobile-menu-close');

  const mobileLinks =
    document.querySelectorAll('.mobile-link');

  if (!navbar) return;

  const sections =
    Array.from(document.querySelectorAll('section[id]'));

  const navLinks =
    Array.from(document.querySelectorAll('.nav-link'));

  let scrollRAF = null;
  let lastScrollY = -1;

  const handleScroll = () => {
    if (scrollRAF) return;

    scrollRAF = requestAnimationFrame(() => {
      scrollRAF = null;

      const y = window.scrollY;

      if (y === lastScrollY) return;

      lastScrollY = y;

      navbar.classList.toggle(
        'scrolled',
        y > 60
      );

      let current = '';

      for (let i = sections.length - 1; i >= 0; i--) {
        if (
          sections[i]
            .getBoundingClientRect()
            .top < 200
        ) {
          current = sections[i].id;
          break;
        }
      }

      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === '#' + current
        );
      });
    });
  };

  window.addEventListener(
    'scroll',
    handleScroll,
    { passive: true }
  );

  handleScroll();

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (!mobileMenu) return;

      const isOpen =
        mobileMenu.classList.contains('open');

      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener(
      'click',
      closeMobileMenu
    );
  }

  mobileLinks.forEach(link => {
    link.addEventListener(
      'click',
      closeMobileMenu
    );
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });
}


function openMobileMenu() {
  const mobileMenu =
    document.getElementById('mobile-menu');

  const hamburger =
    document.getElementById('nav-hamburger');

  if (!mobileMenu) return;

  mobileMenu.classList.add('open');

  if (hamburger) {
    hamburger.setAttribute(
      'aria-expanded',
      'true'
    );
  }

  document.body.style.overflow = 'hidden';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo(
      '.mobile-link',
      {
        opacity: 0,
        x: -24
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.07,
        delay: 0.15
      }
    );
  }
}


function closeMobileMenu() {
  const mobileMenu =
    document.getElementById('mobile-menu');

  const hamburger =
    document.getElementById('nav-hamburger');

  if (!mobileMenu) return;

  mobileMenu.classList.remove('open');

  if (hamburger) {
    hamburger.setAttribute(
      'aria-expanded',
      'false'
    );
  }

  document.body.style.overflow = '';
}


/* ──────────────────────────────────────────────────────────
6. MENU FILTER TABS
────────────────────────────────────────────────────────── */
function initMenuFilter() {
  const tabs =
    document.querySelectorAll('.menu-tab');

  const cards =
    document.querySelectorAll('.menu-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute(
          'aria-selected',
          'false'
        );
      });

      tab.classList.add('active');

      tab.setAttribute(
        'aria-selected',
        'true'
      );

      const filter = tab.dataset.filter;

      cards.forEach((card, i) => {
        const category =
          card.dataset.category;

        const show =
          filter === 'all' ||
          category === filter;

        if (show) {
          card.style.display = '';

          if (typeof gsap !== 'undefined') {
            gsap.fromTo(
              card,
              {
                opacity: 0,
                y: 20,
                scale: 0.97
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                ease: 'power3.out',
                delay: i * 0.04
              }
            );
          }
        } else {
          if (typeof gsap !== 'undefined') {
            gsap.to(card, {
              opacity: 0,
              y: 10,
              duration: 0.3,
              ease: 'power2.in',

              onComplete: () => {
                card.style.display = 'none';
              }
            });
          } else {
            card.style.display = 'none';
          }
        }
      });
    });
  });
}


/* ──────────────────────────────────────────────────────────
7. TESTIMONIALS SLIDER
────────────────────────────────────────────────────────── */
function initTestimonials() {
  const track =
    document.getElementById('testimonials-track');

  const prevBtn =
    document.getElementById('testimonial-prev');

  const nextBtn =
    document.getElementById('testimonial-next');

  const dotsContainer =
    document.getElementById('testimonials-dots');

  if (!track) return;

  const cards =
    track.querySelectorAll('.testimonial-card');

  const total = cards.length;

  if (!total) return;

  let current = 0;
  let autoplayTimer;

  const getVisible = () =>
    window.innerWidth < 640 ? 1 : 2;

  const createDots = () => {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';

    const visible = getVisible();

    const totalSlides =
      Math.ceil(total / visible);

    for (let i = 0; i < totalSlides; i++) {
      const dot =
        document.createElement('button');

      dot.className =
        'testimonial-dot';

      dot.setAttribute(
        'role',
        'tab'
      );

      dot.setAttribute(
        'aria-label',
        `Go to slide ${i + 1}`
      );

      dot.setAttribute(
        'aria-selected',
        i === 0 ? 'true' : 'false'
      );

      if (i === 0) {
        dot.classList.add('active');
      }

      dot.addEventListener(
        'click',
        () => goTo(i * visible)
      );

      dotsContainer.appendChild(dot);
    }
  };

  const updateDots = () => {
    if (!dotsContainer) return;

    const visible = getVisible();

    const dots =
      dotsContainer.querySelectorAll(
        '.testimonial-dot'
      );

    const activeIndex =
      Math.floor(current / visible);

    dots.forEach((dot, i) => {
      dot.classList.toggle(
        'active',
        i === activeIndex
      );

      dot.setAttribute(
        'aria-selected',
        i === activeIndex
          ? 'true'
          : 'false'
      );
    });
  };

  const goTo = index => {
    const visible = getVisible();

    const max =
      Math.max(0, total - visible);

    current = Math.min(
      Math.max(0, index),
      max
    );

    if (!cards[0]) return;

    const cardWidth =
      cards[0].offsetWidth;

    const gapStr =
      getComputedStyle(track).columnGap;

    const gap =
      parseFloat(gapStr) || 32;

    const offset =
      current * (cardWidth + gap);

    if (typeof gsap !== 'undefined') {
      gsap.to(track, {
        x: -offset,
        duration: 0.7,
        ease: 'power3.out'
      });
    } else {
      track.style.transform =
        `translateX(-${offset}px)`;
    }

    updateDots();
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goTo(current - getVisible());
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goTo(current + getVisible());
      resetAutoplay();
    });
  }

  const startAutoplay = () => {
    clearInterval(autoplayTimer);

    autoplayTimer = setInterval(() => {
      const visible = getVisible();

      const max =
        Math.max(0, total - visible);

      if (current + visible > max) {
        goTo(0);
      } else {
        goTo(current + visible);
      }
    }, 5000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayTimer);
    startAutoplay();
  };

  let startX = 0;

  track.addEventListener(
    'touchstart',
    e => {
      startX = e.touches[0].clientX;
    },
    { passive: true }
  );

  track.addEventListener(
    'touchend',
    e => {
      const diff =
        startX -
        e.changedTouches[0].clientX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goTo(
            current + getVisible()
          );
        } else {
          goTo(
            current - getVisible()
          );
        }
      }

      resetAutoplay();
    }
  );

  createDots();
  goTo(0);
  startAutoplay();

  let resizeTimer = null;

  window.addEventListener('resize', () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    resizeTimer = setTimeout(() => {
      createDots();
      goTo(0);
    }, 150);
  });
}


/* ──────────────────────────────────────────────────────────
8. GUESTS SELECTOR
────────────────────────────────────────────────────────── */
function initGuestsSelector() {
  const minusBtn =
    document.getElementById('guests-minus');

  const plusBtn =
    document.getElementById('guests-plus');

  const countDisplay =
    document.getElementById('guests-count');

  const hiddenInput =
    document.getElementById('res-guests');

  if (!minusBtn || !plusBtn) return;

  let guests = 2;

  const MIN = 1;
  const MAX = 12;

  const update = () => {
    if (countDisplay) {
      countDisplay.textContent = guests;
    }

    if (hiddenInput) {
      hiddenInput.value = guests;
    }

    minusBtn.disabled =
      guests <= MIN;

    plusBtn.disabled =
      guests >= MAX;

    if (
      typeof gsap !== 'undefined' &&
      countDisplay
    ) {
      gsap.fromTo(
        countDisplay,
        {
          scale: 1.3,
          color: '#5A3E36'
        },
        {
          scale: 1,
          color: '#1C1410',
          duration: 0.3,
          ease: 'back.out(3)'
        }
      );
    }
  };

  update();

  minusBtn.addEventListener(
    'click',
    e => {
      e.preventDefault();

      if (guests > MIN) {
        guests--;
        update();
      }
    }
  );

  plusBtn.addEventListener(
    'click',
    e => {
      e.preventDefault();

      if (guests < MAX) {
        guests++;
        update();
      }
    }
  );
}


/* ──────────────────────────────────────────────────────────
9. RESERVATION FORM
────────────────────────────────────────────────────────── */
function initReservationForm() {
  const form =
    document.getElementById('reservation-form');

  const success =
    document.getElementById('form-success');

  const submit =
    document.getElementById('res-submit');

  if (!form || !success) return;

  const dateInput =
    document.getElementById('res-date');

  if (dateInput) {
    const today =
      new Date().toISOString().split('T')[0];

    dateInput.min = today;
  }

  const clearFormError = () => {
    const existingErr =
      form.querySelector('.form-error');

    if (existingErr) {
      existingErr.remove();
    }
  };

  const showValidationError = msg => {
    clearFormError();

    const errorMsg =
      document.createElement('div');

    errorMsg.className =
      'form-error';

    errorMsg.setAttribute(
      'role',
      'alert'
    );

    errorMsg.textContent = msg;

    if (submit) {
      form.insertBefore(
        errorMsg,
        submit
      );
    } else {
      form.appendChild(errorMsg);
    }
  };

  const showSuccessView = () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(form, {
        opacity: 0,
        y: -15,
        duration: 0.3,
        ease: 'power2.in',

        onComplete: () => {
          form.hidden = true;
          form.style.display = 'none';

          success.hidden = false;
          success.style.display = 'block';

          gsap.fromTo(
            success,
            {
              opacity: 0,
              y: 15
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power3.out'
            }
          );

          gsap.fromTo(
            '.form-success-icon',
            {
              scale: 0,
              rotation: -30
            },
            {
              scale: 1,
              rotation: 0,
              duration: 0.4,
              ease: 'back.out(2)',
              delay: 0.05
            }
          );
        }
      });
    } else {
      form.hidden = true;
      form.style.display = 'none';

      success.hidden = false;
      success.style.display = 'block';
      success.style.opacity = '1';
    }
  };

  const resetFormView = () => {
    form.reset();

    clearFormError();

    form.hidden = false;
    form.style.display = 'flex';
    form.style.opacity = '1';

    success.hidden = true;
    success.style.display = 'none';

    if (submit) {
      submit.disabled = false;

      const btnText =
        submit.querySelector('.btn-text');

      if (btnText) {
        btnText.textContent =
          'Confirm Reservation';
      }
    }

    const guests =
      document.getElementById('res-guests');

    const guestsCount =
      document.getElementById('guests-count');

    if (guests) {
      guests.value = '2';
    }

    if (guestsCount) {
      guestsCount.textContent = '2';
    }
  };

  const anotherBtn =
    document.getElementById('res-another-btn');

  if (anotherBtn) {
    anotherBtn.addEventListener(
      'click',
      resetFormView
    );
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    clearFormError();

    const name =
      document.getElementById('res-name');

    const email =
      document.getElementById('res-email');

    const date =
      document.getElementById('res-date');

    const time =
      document.getElementById('res-time');

    const fields = [
      {
        el: name,
        label: 'Full Name'
      },
      {
        el: email,
        label: 'Email Address'
      },
      {
        el: date,
        label: 'Date'
      },
      {
        el: time,
        label: 'Time'
      }
    ];

    const missingLabels = [];

    fields.forEach(({ el, label }) => {
      if (
        !el ||
        !el.value ||
        !el.value.trim()
      ) {
        missingLabels.push(label);

        if (el) {
          shakeField(el);
        }
      }
    });

    if (missingLabels.length > 0) {
      showValidationError(
        `Please complete all required fields: ${missingLabels.join(', ')}.`
      );

      return;
    }

    const btnText =
      submit
        ? submit.querySelector('.btn-text')
        : null;

    if (btnText) {
      btnText.textContent =
        'Processing…';
    }

    if (submit) {
      submit.disabled = true;
    }

    const nowIso =
      new Date().toISOString();

    /*
     * ==========================================================
     * RESERVATION DATA
     * ==========================================================
     *
     * Firestore generates the final document ID.
     * The ID will become the official reservation ID.
     */
    const reservationData = {
      reservationId: '',

      customerName:
        name.value.trim(),

      name:
        name.value.trim(),

      email:
        email.value.trim(),

      phone:
        document.getElementById('res-phone')
          ? document
              .getElementById('res-phone')
              .value
              .trim()
          : '',

      date:
        date.value,

      time:
        time.value,

      guests:
        parseInt(
          document.getElementById('res-guests')
            ? document
                .getElementById('res-guests')
                .value
            : '2',
          10
        ) || 2,

      specialRequest:
        document.getElementById('res-notes')
          ? document
              .getElementById('res-notes')
              .value
              .trim()
          : '',

      notes:
        document.getElementById('res-notes')
          ? document
              .getElementById('res-notes')
              .value
              .trim()
          : '',

      status: 'pending',

      emailStatus: 'pending',

      cafeName:
        'Bean & Bloom Café',

      cafeCity:
        'Hyderabad',

      cafeArea:
        'Jubilee Hills',

      cafeAddress:
        '12, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',

      cafePhone:
        '+91 40 4852 7190',

      cafeEmail:
        'hello@beanandbloomcafe.com',

      cafeInstagram:
        '@beanandbloomcafe',

      createdAt:
        nowIso,

      updatedAt:
        nowIso
    };

    /*
     * ==========================================================
     * LOCAL BACKUP
     * ==========================================================
     *
     * Keep the existing localStorage functionality.
     */
    try {
      const existing =
        JSON.parse(
          localStorage.getItem(
            'bean_bloom_reservations'
          ) || '[]'
        );

      existing.push(
        reservationData
      );

      localStorage.setItem(
        'bean_bloom_reservations',
        JSON.stringify(existing)
      );
    } catch (err) {
      console.warn(
        'LocalStorage save warning:',
        err
      );
    }

    /*
     * ==========================================================
     * FIRESTORE SAVE
     * ==========================================================
     */

    const dbInstance =
      window.db ||
      window.firebaseDb ||
      (
        typeof db !== 'undefined'
          ? db
          : null
      );

    /*
     * Check Firebase connection
     */
    if (
      !dbInstance ||
      typeof dbInstance.collection !== 'function'
    ) {
      console.error(
        '❌ Firebase Firestore is not initialized.'
      );

      showValidationError(
        'Unable to connect to the reservation database. Please try again.'
      );

      showToast(
        'Firebase is not connected.',
        'error'
      );

      if (submit) {
        submit.disabled = false;
      }

      if (btnText) {
        btnText.textContent =
          'Confirm Reservation';
      }

      return;
    }

    console.log(
      'Saving reservation to Firestore:',
      reservationData
    );

    /*
     * ==========================================================
     * CREATE FIRESTORE DOCUMENT
     * ==========================================================
     */

    dbInstance
      .collection('reservations')
      .add(reservationData)

      .then(docRef => {

        /*
         * Firestore should return a document reference.
         */
        const firestoreDocId =
          docRef && docRef.id
            ? docRef.id
            : null;

        if (!firestoreDocId) {
          throw new Error(
            'Firestore created the reservation but did not return a document ID.'
          );
        }

        console.log(
          '✅ Reservation saved to Firestore.'
        );

        console.log(
          'Firestore Document ID:',
          firestoreDocId
        );

        /*
         * ======================================================
         * USE FIRESTORE DOCUMENT ID AS RESERVATION ID
         * ======================================================
         */

        reservationData.reservationId =
          firestoreDocId;

        /*
         * Update the Firestore document with its own ID.
         */
        return docRef
          .update({
            reservationId:
              firestoreDocId,

            updatedAt:
              new Date().toISOString()
          })

          .then(() => {

            console.log(
              '✅ Reservation ID updated:',
              firestoreDocId
            );

            /*
             * ==================================================
             * UPDATE LOCAL STORAGE
             * ==================================================
             */

            try {
              const existing =
                JSON.parse(
                  localStorage.getItem(
                    'bean_bloom_reservations'
                  ) || '[]'
                );

              const localIndex =
                existing.findIndex(item =>
                  item.createdAt ===
                  reservationData.createdAt
                );

              if (localIndex !== -1) {

                existing[localIndex] = {
                  ...existing[localIndex],

                  reservationId:
                    firestoreDocId,

                  updatedAt:
                    reservationData.updatedAt
                };

                localStorage.setItem(
                  'bean_bloom_reservations',
                  JSON.stringify(existing)
                );
              }

            } catch (err) {

              console.warn(
                'LocalStorage update warning:',
                err
              );

            }

            /*
             * ==================================================
             * SEND EMAIL
             * ==================================================
             *
             * EmailJS runs only after Firestore successfully
             * created the reservation.
             */

            sendEmailJS(
              reservationData,
              'confirmation',
              firestoreDocId
            );

            /*
             * ==================================================
             * SHOW SUCCESS
             * ==================================================
             */

            showToast(
              'Reservation created successfully!',
              'success'
            );

            showSuccessView();

            openSuccessModal(
              reservationData
            );
          });
      })

      /*
       * ========================================================
       * FIRESTORE ERROR
       * ========================================================
       */

      .catch(error => {

        console.error(
          '❌ Firestore reservation failed:',
          error
        );

        console.error(
          'Firestore error code:',
          error && error.code
            ? error.code
            : 'unknown'
        );

        console.error(
          'Firestore error message:',
          error && error.message
            ? error.message
            : error
        );

        /*
         * IMPORTANT:
         *
         * Do NOT show the success screen here.
         *
         * The reservation was not successfully saved to
         * Firestore.
         */

        showToast(
          'Reservation could not be saved. Please try again.',
          'error'
        );

        showValidationError(
          'We could not save your reservation. Please check your connection and try again.'
        );
      })

      /*
       * ========================================================
       * ALWAYS RESTORE BUTTON
       * ========================================================
       */

      .finally(() => {

        if (submit) {
          submit.disabled = false;
        }

        if (btnText) {
          btnText.textContent =
            'Confirm Reservation';
        }

      });

  });
}

/* ──────────────────────────────────────────────────────────
10. EMAILJS
────────────────────────────────────────────────────────── */

/**
 * sendEmailJS
 *
 * Sends reservation emails through EmailJS.
 *
 * Types:
 * confirmation
 * confirmed
 * cancelled
 * custom
 */
function sendEmailJS(
  res,
  type,
  docId,
  customBody
) {
  const cfg = window.EMAILJS_CONFIG;

  /*
   * Do not block the reservation if EmailJS is unavailable.
   * The Firestore reservation remains saved.
   */
  if (
    !cfg ||
    !cfg.publicKey ||
    !cfg.serviceId ||
    !cfg.templateId ||
    typeof emailjs === 'undefined'
  ) {
    console.info(
      '[EmailJS] Configuration/SDK unavailable — reservation remains saved and email was skipped.'
    );

    return Promise.resolve({
      sent: false,
      status: 'SKIPPED'
    });
  }

  const subjectMap = {
    confirmation:
      'Your Reservation Request — Bean & Bloom Café',

    confirmed:
      'Your Reservation is Confirmed — Bean & Bloom Café',

    cancelled:
      'Your Reservation Has Been Cancelled — Bean & Bloom Café',

    custom:
      'A Message from Bean & Bloom Café'
  };

  const bodyMap = {
    confirmation:
      'Thank you for choosing Bean & Bloom Café! We have received your reservation request and will confirm it shortly.',

    confirmed:
      'Great news! Your reservation has been confirmed by our team. We can’t wait to welcome you to Bean & Bloom Café!',

    cancelled:
      'We’re sorry to let you know that your reservation has been cancelled. Please contact Bean & Bloom Café if you would like to reschedule.',

    custom:
      customBody || ''
  };

  const customerEmail =
    res.email || '';

  const customerName =
    res.customerName ||
    res.name ||
    'Valued Guest';

  const reservationId =
    res.reservationId ||
    res.id ||
    docId ||
    'N/A';

  const reservationStatus =
    res.status ||
    (
      type === 'confirmed'
        ? 'confirmed'
        : type === 'cancelled'
          ? 'cancelled'
          : 'pending'
    );

  const templateParams = {

    /* Customer email */
    to_email:
      customerEmail,

    /* Reply button */
    reply_to:
      customerEmail,

    /* Customer details */
    customer_name:
      customerName,

    email:
      customerEmail,

    phone:
      res.phone ||
      'Not provided',

    /* Reservation details */
    reservation_id:
      reservationId,

    date:
      res.date ||
      'TBD',

    time:
      formatTime(res.time) ||
      res.time ||
      'TBD',

    guests:
      String(
        res.guests || 2
      ),

    special_request:
      res.specialRequest ||
      res.notes ||
      'None',

    status:
      reservationStatus,

    /* Email content */
    subject:
      subjectMap[type] ||
      subjectMap.confirmation,

    message:
      bodyMap[type] ||
      bodyMap.confirmation,

    message_body:
      bodyMap[type] ||
      bodyMap.confirmation,

    /* Café information */
    cafe_name:
      'Bean & Bloom Café',

    cafe_address:
      '12, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',

    cafe_phone:
      '+91 40 4852 7190',

    cafe_email:
      'hello@beanandbloomcafe.com',

    cafe_instagram:
      '@beanandbloomcafe',

    cafe_hours:
      '8 AM – 10 PM',

    cafe_city:
      'Hyderabad',

    cafe_area:
      'Jubilee Hills',

    maps_link:
      'https://maps.google.com/?q=12+Road+No+36+Jubilee+Hills+Hyderabad'
  };

  console.log(
    '[EmailJS] Sending reservation email to:',
    customerEmail
  );

  return emailjs
    .send(
      cfg.serviceId,
      cfg.templateId,
      templateParams
    )

    .then(response => {

      console.log(
        '✅ [EmailJS] Email sent successfully to',
        customerEmail,
        response.status,
        response.text
      );

      return {
        sent: true,
        status: 'Sent',
        response: response
      };
    })

    .catch(error => {

      console.error(
        '❌ [EmailJS] Email send failed. Reservation remains saved:',
        error
      );

      return {
        sent: false,
        status: 'Failed',
        error: error
      };
    });
}

/* Make EmailJS helper available to admin.js */
window.sendEmailJS =
  sendEmailJS;

/* ──────────────────────────────────────────────────────────
11. GLOBAL HELPER FUNCTIONS
────────────────────────────────────────────────────────── */

function formatTime(timeStr) {
  if (!timeStr) return '';

  if (timeStr.includes(':')) {
    return timeStr;
  }

  if (timeStr.length === 4) {
    let hours =
      parseInt(
        timeStr.substring(0, 2),
        10
      );

    const mins =
      timeStr.substring(2);

    const ampm =
      hours >= 12
        ? 'PM'
        : 'AM';

    hours =
      hours % 12 || 12;

    return `${hours}:${mins} ${ampm}`;
  }

  return timeStr;
}


function escapeHtml(str) {
  if (!str) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function showToast(
  message,
  type = 'info'
) {
  const container =
    document.getElementById(
      'toast-container'
    );

  if (!container) return;

  const toast =
    document.createElement('div');

  toast.className =
    `toast toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-weight: bold;">
      ${iconMap[type] || 'ℹ'}
    </span>
    <span>
      ${escapeHtml(message)}
    </span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform =
      'translateY(10px)';

    toast.style.transition =
      'opacity 0.3s, transform 0.3s';

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}


/* ──────────────────────────────────────────────────────────
12. RESERVATION SUCCESS MODAL
────────────────────────────────────────────────────────── */
function openSuccessModal(res) {
  const modal =
    document.getElementById(
      'reservation-success-modal'
    );

  if (!modal) return;

  const resIdEl =
    document.getElementById(
      'modal-res-id'
    );

  const nameEl =
    document.getElementById(
      'modal-res-name'
    );

  const dateEl =
    document.getElementById(
      'modal-res-date'
    );

  const timeEl =
    document.getElementById(
      'modal-res-time'
    );

  const guestsEl =
    document.getElementById(
      'modal-res-guests'
    );

  if (resIdEl) {
    resIdEl.textContent =
      res.reservationId ||
      res.id ||
      'CONFIRMED';
  }

  if (nameEl) {
    nameEl.textContent =
      res.customerName ||
      res.name ||
      'Valued Guest';
  }

  if (dateEl) {
    dateEl.textContent =
      res.date ||
      'Today';
  }

  if (timeEl) {
    timeEl.textContent =
      formatTime(res.time) ||
      res.time ||
      '';
  }

  if (guestsEl) {
    guestsEl.textContent =
      `${res.guests || 2} ${
        res.guests === 1
          ? 'Guest'
          : 'Guests'
      }`;
  }

  modal.hidden = false;

  modal.setAttribute(
    'aria-hidden',
    'false'
  );

  const closeIcon =
    document.getElementById(
      'res-modal-close-icon'
    );

  const viewBtn =
    document.getElementById(
      'res-modal-view-btn'
    );

  const homeBtn =
    document.getElementById(
      'res-modal-home-btn'
    );

  const closeModal = () => {
    modal.hidden = true;

    modal.setAttribute(
      'aria-hidden',
      'true'
    );
  };

  if (closeIcon) {
    closeIcon.onclick =
      closeModal;
  }

  if (viewBtn) {
    viewBtn.onclick = () => {
      closeModal();

      const resSec =
        document.getElementById(
          'reservation'
        );

      if (resSec) {
        if (lenisInstance) {
          lenisInstance.scrollTo(
            resSec,
            {
              offset: -80
            }
          );
        } else {
          resSec.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    };
  }

  if (homeBtn) {
    homeBtn.onclick = () => {
      closeModal();

      if (lenisInstance) {
        lenisInstance.scrollTo(0);
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    };
  }

  modal.addEventListener(
    'click',
    e => {
      if (e.target === modal) {
        closeModal();
      }
    }
  );
}


/* ──────────────────────────────────────────────────────────
13. FIELD VALIDATION ANIMATION
────────────────────────────────────────────────────────── */
function shakeField(field) {
  field.style.borderColor =
    '#B85C50';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo(
      field,
      { x: 0 },
      {
        x: 8,
        duration: 0.07,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 5
      }
    );
  }

  const clearBorder = () => {
    field.style.borderColor = '';
  };

  field.addEventListener(
    'input',
    clearBorder,
    { once: true }
  );

  field.addEventListener(
    'change',
    clearBorder,
    { once: true }
  );
}


/* ──────────────────────────────────────────────────────────
14. CAFÉ INFORMATION
────────────────────────────────────────────────────────── */

/*
 * Bean & Bloom Café
 *
 * City: Hyderabad
 * Area: Jubilee Hills
 * Address:
 * 12, Road No. 36,
 * Jubilee Hills,
 * Hyderabad, Telangana 500033
 *
 * Phone: +91 40 4852 7190
 * Email: hello@beanandbloomcafe.com
 * Instagram: @beanandbloomcafe
 * Opening Hours: 8 AM – 10 PM
 */


/* ============================================================
   15. EMAILJS CONFIGURATION
   ============================================================ */

window.EMAILJS_CONFIG = {
  publicKey: 'ruh_JG8FekoM88KLb',
  serviceId: 'service_thcrmx4',
  templateId: 'template_75hksxp'
};

if (typeof emailjs !== 'undefined') {
  emailjs.init({
    publicKey: window.EMAILJS_CONFIG.publicKey
  });

  console.log('[Bean & Bloom] EmailJS initialized.');
} else {
  console.warn(
    '[Bean & Bloom] EmailJS SDK is not loaded. Email sending will be skipped.'
  );
}