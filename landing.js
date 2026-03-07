/**
 * Verachi Landing — Interaction Layer
 * Header state, reveal animations, mobile navigation, anchor scrolling
 */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.getElementById('mobileMenuToggle');
  const nav = document.getElementById('primaryNav');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileNavQuery = window.matchMedia('(max-width: 720px)');

  const setHeaderScrollState = () => {
    if (header) {
      header.dataset.scrolled = String(window.scrollY > 20);
    }
  };

  const setMenuState = (open) => {
    if (!header || !menuToggle) {
      return;
    }

    const nextState = mobileNavQuery.matches ? open : false;

    header.dataset.menuOpen = String(nextState);
    menuToggle.setAttribute('aria-expanded', String(nextState));
    document.body.dataset.menuOpen = String(nextState);
  };

  const syncMenuState = () => {
    if (!mobileNavQuery.matches) {
      setMenuState(false);
    }
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      setHeaderScrollState();
      ticking = false;
    });
  }, { passive: true });

  setHeaderScrollState();
  setMenuState(false);

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      setMenuState(!isExpanded);
    });
  }

  if (nav) {
    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!mobileNavQuery.matches || !header || header.dataset.menuOpen !== 'true') {
      return;
    }

    if (header.contains(event.target)) {
      return;
    }

    setMenuState(false);
  });

  const syncOnQueryChange = () => syncMenuState();
  if (typeof mobileNavQuery.addEventListener === 'function') {
    mobileNavQuery.addEventListener('change', syncOnQueryChange);
  } else {
    mobileNavQuery.addListener(syncOnQueryChange);
  }

  const revealTargets = document.querySelectorAll('[data-reveal], [data-observe]');
  if (reducedMotionQuery.matches) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  } else {
    window.requestAnimationFrame(() => {
      document.querySelectorAll('[data-reveal]').forEach((element) => {
        element.classList.add('is-visible');
      });
    });

    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        activeObserver.unobserve(entry.target);
      });
    }, {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.12
    });

    document.querySelectorAll('[data-observe]').forEach((element) => observer.observe(element));
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') {
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });
});
