/**
 * Verachi Landing — Interaction Layer
 * Scroll reveals, header state, mobile menu
 */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('[data-header]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===========================
     Header Scroll State
     =========================== */
  let ticking = false;
  const updateHeader = () => {
    if (header) {
      header.dataset.scrolled = String(window.scrollY > 30);
    }
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  updateHeader();


  /* ===========================
     Scroll Reveal System
     =========================== */
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  if (reduceMotion) {
    document.querySelectorAll('[data-reveal], [data-observe]')
      .forEach(el => el.classList.add('is-visible'));
  } else {
    // Hero elements: reveal immediately with stagger
    setTimeout(() => {
      document.querySelectorAll('[data-reveal]')
        .forEach(el => el.classList.add('is-visible'));
    }, 100);

    // Scroll-triggered elements
    document.querySelectorAll('[data-observe]')
      .forEach(el => observer.observe(el));
  }


  /* ===========================
     Mobile Menu
     =========================== */
  const menuToggle = document.getElementById('mobileMenuToggle');
  const nav = document.getElementById('primaryNav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));

      if (!expanded) {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '100%';
        nav.style.left = '16px';
        nav.style.right = '16px';
        nav.style.background = 'rgba(12, 13, 18, 0.95)';
        nav.style.backdropFilter = 'blur(20px)';
        nav.style.WebkitBackdropFilter = 'blur(20px)';
        nav.style.padding = '20px';
        nav.style.borderRadius = '10px';
        nav.style.boxShadow = '0 16px 48px rgba(0,0,0,0.5)';
        nav.style.border = '1px solid rgba(255,255,255,0.08)';
        nav.style.gap = '14px';
        nav.style.zIndex = '200';
      } else {
        Object.assign(nav.style, {
          display: '', flexDirection: '', position: '', top: '',
          left: '', right: '', background: '', backdropFilter: '',
          WebkitBackdropFilter: '', padding: '', borderRadius: '',
          boxShadow: '', border: '', gap: '', zIndex: ''
        });
      }
    });
  }


  /* ===========================
     Smooth Scroll for Anchors
     =========================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Close mobile menu if open
        if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true') {
          menuToggle.click();
        }
      }
    });
  });
});