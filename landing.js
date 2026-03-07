document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('[data-header]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header Scroll State
  const updateHeader = () => {
    if (header) {
      header.dataset.scrolled = String(window.scrollY > 20);
    }
  };
  
  let ticking = false;
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

  // Unified Reveal System
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
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

  const animatedElements = document.querySelectorAll('[data-reveal], [data-observe]');
  
  if (reduceMotion) {
    animatedElements.forEach(el => el.classList.add('is-visible'));
  } else {
    const reveals = document.querySelectorAll('[data-reveal]');
    setTimeout(() => {
      reveals.forEach(el => el.classList.add('is-visible'));
    }, 100);

    const observes = document.querySelectorAll('[data-observe]');
    observes.forEach(el => observer.observe(el));
  }

  // Interactive Parallax for Hero Elements
  const heroArea = document.querySelector('.hero');
  const floatNodes = document.querySelectorAll('.tool-node');
  const codeSnippets = document.querySelectorAll('.code-snippet');
  
  if (heroArea && !reduceMotion) {
    heroArea.addEventListener('mousemove', (e) => {
      const rect = heroArea.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Moving elements subtly based on mouse position
      floatNodes.forEach((node, index) => {
        const factor = (index + 1) * 3;
        const moveX = ((x - centerX) / centerX) * factor;
        const moveY = ((y - centerY) / centerY) * factor;
        node.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      codeSnippets.forEach((snippet, index) => {
        const factor = (index + 1) * -4; // Opposite direction
        const moveX = ((x - centerX) / centerX) * factor;
        const moveY = ((y - centerY) / centerY) * factor;
        snippet.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    });

    heroArea.addEventListener('mouseleave', () => {
      floatNodes.forEach(node => node.style.transform = '');
      codeSnippets.forEach(snippet => snippet.style.transform = '');
    });
  }

  // Mobile Menu
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
        nav.style.left = '24px';
        nav.style.right = '24px';
        nav.style.background = 'var(--surface-color)';
        nav.style.padding = '24px';
        nav.style.borderRadius = '12px';
        nav.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)';
        nav.style.border = '1px solid var(--border-subtle)';
      } else {
        nav.style.display = '';
        nav.style.position = '';
        nav.style.top = '';
        nav.style.left = '';
        nav.style.right = '';
        nav.style.background = '';
        nav.style.padding = '';
        nav.style.boxShadow = '';
        nav.style.border = '';
      }
    });
  }
});