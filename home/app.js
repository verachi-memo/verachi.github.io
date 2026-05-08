/* ============================================================
   BACKGROUND MORPH — disabled for performance
   ============================================================ */
// (function bgMorph() { ... })();

/* ============================================================
   SCATTERED FRAGMENTS FLOATING EFFECT
   ============================================================ */
(function initScatteredParallax() {
  const stage = document.getElementById("scatteredStage");
  if (!stage) return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) return;

  const fragments = stage.querySelectorAll(".sc-fragment");
  if (!fragments.length) return;

  let mouseX = 0;
  let mouseY = 0;
  let ticking = false;

  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    mouseY = (e.clientY - rect.top) / rect.height - 0.5;

    if (!ticking) {
      requestAnimationFrame(() => {
        fragments.forEach((frag, i) => {
          const depth = (i + 1) * 0.15;
          const tx = mouseX * depth * -60;
          const ty = mouseY * depth * -60;
          frag.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });

  stage.addEventListener("mouseleave", () => {
    fragments.forEach(frag => {
      frag.style.transform = "translate3d(0, 0, 0)";
    });
  });
})();


/* ============================================================
   INTERSECTION OBSERVER — generic fade-up
   ============================================================ */
const animEls = document.querySelectorAll("[data-anim]");
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
animEls.forEach(el => animObserver.observe(el));


/* ============================================================
   STEP PROGRESS DOTS
   ============================================================ */
const sections = [
  { id: "heroSection", dotId: "dot-hero", cls: "" },
  { id: "problemSection", dotId: "dot-problem", cls: "active-problem" },
  { id: "connectSection", dotId: "dot-connect", cls: "active-connect" },
];

const stepObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const sec = sections.find(s => s.id === entry.target.id);
    if (!sec) return;
    const dot = document.getElementById(sec.dotId);
    if (entry.isIntersecting) {
      dot.className = "step-dot " + sec.cls;
    } else {
      dot.className = "step-dot";
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => {
  const el = document.getElementById(s.id);
  if (el) stepObserver.observe(el);
});


/* ============================================================
   STEP 4 — Connect orbit animation
   ============================================================ */
(function initConnectAnimation() {
  const connectSection = document.getElementById("connectSection");
  if (!connectSection) return;

  const orbitCenter = document.getElementById("orbitCenter");
  const nodes = [0, 1, 2, 3].map(i => document.getElementById(`onode-${i}`));
  const lines = [0, 1, 2, 3].map(i => document.getElementById(`conn-${i}`));
  const cards = document.querySelectorAll(".integration-card");
  const statusBar = document.getElementById("connectStatus");
  let animated = false;

  const connectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        runConnectSequence();
      }
    });
  }, { threshold: 0.25 });
  connectObserver.observe(connectSection);

  function runConnectSequence() {
    const isReduced = prefersReducedMotion.matches;
    const baseDelay = isReduced ? 0 : 400;
    const stagger = isReduced ? 50 : 300;

    // 1. Show center logo
    setTimeout(() => {
      orbitCenter.classList.add("active");
    }, baseDelay);

    // 2. Show nodes one by one
    nodes.forEach((node, i) => {
      setTimeout(() => {
        node.classList.add("active");
      }, baseDelay + 500 + i * stagger);
    });

    // 3. Draw connection lines
    lines.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add("drawn");
        // Move contextual value from each existing tool into Verachi.
        setTimeout(() => {
          nodes[i].classList.add("connected");
          if (!isReduced) {
            startParticleStream(i);
          }
        }, isReduced ? 0 : 400);
      }, baseDelay + 1600 + i * stagger);
    });

    // 4. Show integration cards
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add("visible");
      }, baseDelay + 3000 + i * (isReduced ? 50 : 200));
    });

    // 5. Show status bar
    setTimeout(() => {
      statusBar.classList.add("visible");
    }, baseDelay + (isReduced ? 200 : 4000));
  }

  function startParticleStream(index) {
    const line = lines[index];
    const x1 = parseFloat(line.getAttribute("x1"));
    const y1 = parseFloat(line.getAttribute("y1"));
    const x2 = parseFloat(line.getAttribute("x2"));
    const y2 = parseFloat(line.getAttribute("y2"));
    const container = document.getElementById("particles-container");
    if (!container) return;

    function spawnParticle() {
      // Create particle
      const particle = document.createElement("div");
      particle.className = `stream-particle stream-particle-${index}`;
      container.appendChild(particle);

      let progress = 0;
      let speed = 0.005 + Math.random() * 0.005;

      function step() {
        progress += speed;
        if (progress > 1) {
          particle.remove();
          return;
        }

        // Slight fade at ends
        if (progress < 0.1) {
          particle.style.opacity = (progress / 0.1).toFixed(2);
        } else if (progress > 0.9) {
          particle.style.opacity = (1 - (progress - 0.9) / 0.1).toFixed(2);
        } else {
          particle.style.opacity = 1;
        }

        const cx = x1 + (x2 - x1) * progress;
        const cy = y1 + (y2 - y1) * progress;
        particle.style.left = `${(cx / 420) * 100}%`;
        particle.style.top = `${(cy / 420) * 100}%`;

        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);

      // Schedule next particle
      const nextDelay = 300 + Math.random() * 1200;
      setTimeout(spawnParticle, nextDelay);
    }

    // Initial spawn
    spawnParticle();
  }
})();


/* ============================================================
   COUNT-UP — animate stat numbers when they enter view
   ============================================================ */
(function initCountUp() {
  const statEls = document.querySelectorAll('.hero-impact-stat, .comparison-stat, .recovered-stat');
  if (!statEls.length) return;

  function extractNumber(el) {
    const target = el.dataset.target;
    if (target) return parseFloat(target);
    const cleaned = el.textContent.trim().replace(/[$,~Kk]/g, '');
    const match = cleaned.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  }

  function formatValue(val, originalText) {
    const isCurrency = originalText.includes('$');
    const isHours = originalText.toLowerCase().includes('hrs');
    if (isCurrency) {
      return '$' + Math.floor(val).toLocaleString();
    }
    if (isHours) {
      return Math.floor(val).toLocaleString() + ' hrs';
    }
    return Math.floor(val).toLocaleString();
  }

  const countUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countUpObserver.unobserve(entry.target);
      const el = entry.target;
      const originalText = el.textContent.trim();
      const targetVal = extractNumber(el);
      if (targetVal === null || targetVal === 0) return;

      const duration = 1800;
      const startTime = performance.now();

      function tick(ts) {
        const elapsed = ts - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out curve
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = targetVal * eased;
        el.textContent = formatValue(current, originalText);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = originalText;
        }
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.2 });

  statEls.forEach(el => countUpObserver.observe(el));
})();


/* ============================================================
   3D TILT — cards lean toward cursor (disabled for performance)
   ============================================================ */
(function init3DTilt() {
  return; // disabled for performance
  if (prefersReducedMotion.matches) return;
  const cards = document.querySelectorAll('.comparison-card, .hero-panel-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      card.style.boxShadow = `
        ${-rotateY * 4}px ${rotateX * 4}px 30px rgba(52,49,44,0.1),
        0 20px 60px rgba(52,49,44,0.08)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.boxShadow = '';
      card.style.transition = 'transform 0.5s ease-out, box-shadow 0.5s ease-out';
      card.addEventListener('transitionend', function handler() {
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out, border-color var(--dur) var(--ease)';
        card.removeEventListener('transitionend', handler);
      });
    });
  });
})();


/* ============================================================
   PARALLAX — step numbers drift slower than content (disabled)
   ============================================================ */
(function initParallax() {
  return; // disabled for performance
  if (prefersReducedMotion.matches) return;
  const stepContainers = document.querySelectorAll('.container[data-step]');
  if (!stepContainers.length) return;

  function updateParallax() {
    stepContainers.forEach(container => {
      const rect = container.getBoundingClientRect();
      const viewCenter = window.innerHeight / 2;
      const elCenter = rect.top + rect.height / 2;
      const offset = (elCenter - viewCenter) / window.innerHeight;
      container.style.setProperty('--step-offset', offset * 30);
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { updateParallax(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  updateParallax();
})();


/* ============================================================
   STEP DOT ANTICIPATION — dots glow before section arrives (disabled)
   ============================================================ */
(function initDotAnticipation() {
  return; // disabled for performance
  const progressSections = [
    { id: "heroSection", dotId: "dot-hero" },
    { id: "problemSection", dotId: "dot-problem" },
    { id: "connectSection", dotId: "dot-connect" },
  ];

  function updateAnticipation() {
    progressSections.forEach(sec => {
      const el = document.getElementById(sec.id);
      const dot = document.getElementById(sec.dotId);
      if (!el || !dot) return;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height * 0.3 - window.innerHeight * 0.5);
      const anticipation = Math.max(0, 1 - dist / 400);
      dot.style.boxShadow = anticipation > 0
        ? `0 0 0 ${6 + anticipation * 10}px rgba(49,95,90,${0.04 + anticipation * 0.1})`
        : '';
      dot.style.transform = `scale(${1 + anticipation * 0.15})`;
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { updateAnticipation(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
})();





/* ============================================================
   MOBILE PROGRESS BAR — horizontal bar instead of dots
   ============================================================ */
(function initMobileProgress() {
  if (window.innerWidth > 720) return;
  const bar = document.createElement('div');
  bar.className = 'mobile-progress';
  bar.innerHTML = '<div class="mobile-progress-fill" id="mobileProgressFill"></div>';
  document.body.prepend(bar);

  const fill = document.getElementById('mobileProgressFill');
  const progressSections = ['heroSection', 'problemSection', 'connectSection'];

  function updateMobileProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    fill.style.width = pct + '%';
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { updateMobileProgress(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
})();


/* ============================================================
   MOBILE HEADER AUTO-HIDE — save vertical space on scroll
   ============================================================ */
(function initHeaderAutoHide() {
  if (window.innerWidth > 720) return;
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        if (currentScroll > lastScroll && currentScroll > 120) {
          header.classList.add('header-hidden');
        } else {
          header.classList.remove('header-hidden');
        }
        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ============================================================
   PARALLAX CSS VARIABLE — wire step-offset to ::before
   ============================================================ */
(function initStepParallaxVar() {
  const style = document.createElement('style');
  style.textContent = `
    .container[data-step]::before {
      transform: translateY(calc(var(--step-offset, 0) * 1px));
    }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   CONTACT FORM — validation + submission
   ============================================================ */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('cfSubmit');
  const submitText = form.querySelector('.cf-submit-text');
  const submitLoading = form.querySelector('.cf-submit-loading');
  const errorEl = document.getElementById('cfError');
  const successEl = document.getElementById('cfSuccess');
  const honeypot = document.getElementById('cf_website');
  const loadedAt = document.getElementById('cf_loaded_at');

  // Record load time for bot detection
  if (loadedAt) loadedAt.value = Date.now().toString();

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function hideError() {
    errorEl.hidden = true;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideError();

    // Honeypot check
    if (honeypot && honeypot.value) return;

    // Time check (bots submit too fast)
    if (loadedAt && loadedAt.value) {
      const elapsed = Date.now() - parseInt(loadedAt.value, 10);
      if (elapsed < 3000) return;
    }

    // Add validation class for CSS states
    form.classList.add('was-validated');

    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    let firstInvalid = null;
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) {
      showError('Please fill in all required fields.');
      firstInvalid.focus();
      return;
    }

    // Validate email
    const emailField = document.getElementById('cf_email');
    if (emailField && !validateEmail(emailField.value)) {
      showError('Please enter a valid work email address.');
      emailField.focus();
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    if (submitText) submitText.hidden = true;
    if (submitLoading) submitLoading.hidden = false;

    // Simulate submission (replace with real endpoint)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Log form data (placeholder for real API call)
      const formData = new FormData(form);
      console.log('Demo request submitted:', Object.fromEntries(formData));

      // Show success
      form.hidden = true;
      if (successEl) successEl.hidden = false;
    } catch (err) {
      showError('Something went wrong. Please try again or email us directly.');
      submitBtn.disabled = false;
      if (submitText) submitText.hidden = false;
      if (submitLoading) submitLoading.hidden = true;
    }
  });
})();

