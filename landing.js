/**
 * Verachi subpage interactions.
 * Used by privacy.html, security.html, terms.html, and trust.html.
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
    if (!header || !menuToggle || !nav) {
      return;
    }

    const nextState = mobileNavQuery.matches ? open : false;
    header.dataset.menuOpen = String(nextState);
    document.body.dataset.menuOpen = String(nextState);
    menuToggle.setAttribute('aria-expanded', String(nextState));
    nav.hidden = mobileNavQuery.matches ? !nextState : false;
  };

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(() => {
      setHeaderScrollState();
      scrollTicking = false;
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
    nav.querySelectorAll('a').forEach((link) => {
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

    if (!header.contains(event.target)) {
      setMenuState(false);
    }
  });

  const syncMenuToViewport = () => {
    if (!mobileNavQuery.matches) {
      setMenuState(false);
    } else if (nav && menuToggle?.getAttribute('aria-expanded') !== 'true') {
      nav.hidden = true;
    }
  };

  if (typeof mobileNavQuery.addEventListener === 'function') {
    mobileNavQuery.addEventListener('change', syncMenuToViewport);
  } else {
    mobileNavQuery.addListener(syncMenuToViewport);
  }

  const revealTargets = document.querySelectorAll('[data-observe]');
  if (reducedMotionQuery.matches || !('IntersectionObserver' in window)) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        activeObserver.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.02,
    });

    revealTargets.forEach((element) => observer.observe(element));
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') {
        return;
      }

      const rawId = href.slice(1);
      const target = document.getElementById(decodeURIComponent(rawId));
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
        block: 'start',
      });
      history.pushState(null, '', href);
    });
  });
});
