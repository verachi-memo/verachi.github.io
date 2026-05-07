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
    if (!header || !menuToggle || !nav) {
      return;
    }

    const nextState = mobileNavQuery.matches ? open : false;

    header.dataset.menuOpen = String(nextState);
    menuToggle.setAttribute('aria-expanded', String(nextState));
    nav.hidden = mobileNavQuery.matches ? !nextState : false;
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

  const revealTargets = document.querySelectorAll('[data-observe]');
  if (reducedMotionQuery.matches) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  } else if (!('IntersectionObserver' in window)) {
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
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.12
    });

    revealTargets.forEach((element) => observer.observe(element));
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
      history.pushState(null, '', href);
    });
  });

  const usecaseTabs = document.querySelectorAll('[data-usecase-tab]');
  const usecasePanels = document.querySelectorAll('[data-usecase-panel]');

  const setUsecasePanel = (panelId) => {
    usecaseTabs.forEach((tab) => {
      const isActive = tab.dataset.usecaseTab === panelId;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    usecasePanels.forEach((panel) => {
      const isActive = panel.dataset.usecasePanel === panelId;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  };

  if (usecaseTabs.length > 0 && usecasePanels.length > 0) {
    usecaseTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const panelId = tab.dataset.usecaseTab;
        if (!panelId) {
          return;
        }

        setUsecasePanel(panelId);
      });
    });

    setUsecasePanel('ide');
  }

  const billingToggleButtons = document.querySelectorAll('[data-billing-toggle]');
  const pricingAmounts = document.querySelectorAll('.pricing-amount[data-price-month][data-price-quarter][data-price-year]');
  const pricingCadences = document.querySelectorAll('.pricing-cadence[data-cadence-month][data-cadence-quarter][data-cadence-year]');

  const setBillingCadence = (cadence) => {
    const priceKey = cadence === 'year' ? 'priceYear' : cadence === 'month' ? 'priceMonth' : 'priceQuarter';
    const cadenceKey = cadence === 'year' ? 'cadenceYear' : cadence === 'month' ? 'cadenceMonth' : 'cadenceQuarter';

    billingToggleButtons.forEach((button) => {
      const isActive = button.dataset.billingToggle === cadence;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    pricingAmounts.forEach((element) => {
      element.textContent = element.dataset[priceKey] || element.textContent;
    });

    pricingCadences.forEach((element) => {
      element.textContent = element.dataset[cadenceKey] || element.textContent;
    });
  };

  if (billingToggleButtons.length > 0) {
    billingToggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextCadence = button.dataset.billingToggle;
        if (!nextCadence) {
          return;
        }

        setBillingCadence(nextCadence);
      });
    });

    setBillingCadence('month');
  }


  /* ============================================================
     SAVINGS CALCULATOR — Interactive ROI graph (Chart.js)
     ============================================================ */
  const orgSizeInput = document.getElementById('org-size');
  const hoursLostInput = document.getElementById('hours-lost');
  const salaryInput = document.getElementById('salary');
  
  const orgSizeVal = document.getElementById('org-size-val');
  const hoursLostVal = document.getElementById('hours-lost-val');
  const salaryVal = document.getElementById('salary-val');
  
  const annualSavingsEl = document.getElementById('annual-savings');
  const roiEl = document.getElementById('roi-multiplier');
  const pricingNoteEl = document.getElementById('pricing-note');
  const savingsChartEl = document.getElementById('savingsChart');

  if (orgSizeInput && hoursLostInput && salaryInput && savingsChartEl) {
      let chart;

      function getPricingTier(size) {
          if (size < 50) return { price: 49, label: 'Pilot' };
          if (size < 250) return { price: 29, label: 'Growth' };
          return { price: 15, label: 'Enterprise' };
      }

      function initChart() {
          const ctx = savingsChartEl.getContext('2d');
          
          const accentGrad = ctx.createLinearGradient(0, 0, 0, 400);
          accentGrad.addColorStop(0, 'rgba(143, 217, 255, 0.3)'); // accent
          accentGrad.addColorStop(1, 'rgba(143, 217, 255, 0)');

          const grayGrad = ctx.createLinearGradient(0, 0, 0, 400);
          grayGrad.addColorStop(0, 'rgba(171, 194, 229, 0.1)'); // ink-3 roughly
          grayGrad.addColorStop(1, 'rgba(171, 194, 229, 0)');

          chart = new Chart(ctx, {
              type: 'line',
              data: {
                  labels: ['Month 1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'Year 1'],
                  datasets: [
                      {
                          label: 'Manual Context Cost',
                          data: [],
                          borderColor: 'rgba(171, 194, 229, 0.4)',
                          borderWidth: 2,
                          pointRadius: 0,
                          fill: true,
                          backgroundColor: grayGrad,
                          tension: 0.4,
                          borderDash: [4, 4]
                      },
                      {
                          label: 'Verachi Context Cost',
                          data: [],
                          borderColor: '#8fd9ff', // accent strong
                          borderWidth: 3,
                          pointRadius: 0,
                          pointHoverRadius: 6,
                          fill: '-1',
                          backgroundColor: 'rgba(143, 217, 255, 0.15)',
                          tension: 0.4
                      }
                  ]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { intersect: false, mode: 'index' },
                  plugins: {
                      legend: { display: false },
                      tooltip: {
                          backgroundColor: 'rgba(11, 20, 35, 0.95)',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderWidth: 1,
                          padding: 12,
                          titleFont: { size: 12, weight: 'bold', family: '"Manrope", sans-serif' },
                          bodyFont: { size: 12, family: '"Manrope", sans-serif' },
                          callbacks: {
                              label: (context) => ` ${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
                          }
                      }
                  },
                  scales: {
                      y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(255, 255, 255, 0.05)' },
                          ticks: {
                              color: 'rgba(171, 194, 229, 0.4)',
                              font: { size: 10, family: '"JetBrains Mono", monospace' },
                              callback: (val) => {
                                  if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
                                  if (val >= 1000) return '$' + (val / 1000) + 'k';
                                  return '$' + val;
                              }
                          }
                      },
                      x: {
                          grid: { display: false },
                          ticks: { color: 'rgba(171, 194, 229, 0.4)', font: { size: 10, family: '"Manrope", sans-serif' } }
                      }
                  },
                  animations: {
                      y: { duration: 400, easing: 'easeOutQuart' },
                      x: { duration: 0 }
                  }
              }
          });
      }

      function calculateData() {
          const orgSize = parseInt(orgSizeInput.value);
          const hoursLost = parseInt(hoursLostInput.value);
          const salary = parseInt(salaryInput.value) * 1000;
          
          const tier = getPricingTier(orgSize);
          const verachiSeatCost = tier.price;
          
          const hourlyRate = salary / 2080; 
          const monthlyWastePerDev = hoursLost * hourlyRate * 4.33; 
          
          const legacyData = [];
          const verachiData = [];
          
          let totalWasteRecovered = 0;
          let totalSoftwareCost = 0;
          let totalBaselineWaste = 0;

          for (let i = 0; i < 12; i++) {
              const monthBaseline = (monthlyWastePerDev * orgSize) * Math.pow(1.015, i);
              legacyData.push(Math.round(monthBaseline));
              totalBaselineWaste += monthBaseline;

              let efficiency = 0.80; 
              if (i === 0) efficiency = 0.20;
              else if (i === 1) efficiency = 0.45;
              else if (i === 2) efficiency = 0.65;

              const wasteRecovered = monthBaseline * efficiency;
              const monthlySoftwareCost = orgSize * verachiSeatCost;
              
              const monthVerachiTotal = (monthBaseline - wasteRecovered) + monthlySoftwareCost;
              
              verachiData.push(Math.round(monthVerachiTotal));
              totalWasteRecovered += wasteRecovered;
              totalSoftwareCost += monthlySoftwareCost;
          }

          const annualNetSavings = totalWasteRecovered - totalSoftwareCost;
          const roiFactor = (totalWasteRecovered / totalSoftwareCost).toFixed(1);

          animateValue(annualSavingsEl, annualNetSavings, "$");
          roiEl.innerText = `${roiFactor}x`;
          
          orgSizeVal.innerText = orgSize.toLocaleString();
          hoursLostVal.innerText = `${hoursLost}h`;
          salaryVal.innerText = `$${salaryInput.value}k`;
          
          const percentValOrg = ((orgSize - orgSizeInput.min) / (orgSizeInput.max - orgSizeInput.min)) * 100;
          orgSizeInput.style.background = `linear-gradient(90deg, var(--ink-0) ${percentValOrg}%, var(--surface-2) ${percentValOrg}%)`;
          
          const percentValHours = ((hoursLost - hoursLostInput.min) / (hoursLostInput.max - hoursLostInput.min)) * 100;
          hoursLostInput.style.background = `linear-gradient(90deg, var(--ink-0) ${percentValHours}%, var(--surface-2) ${percentValHours}%)`;

          const percentValSalary = ((salaryInput.value - salaryInput.min) / (salaryInput.max - salaryInput.min)) * 100;
          salaryInput.style.background = `linear-gradient(90deg, var(--ink-0) ${percentValSalary}%, var(--surface-2) ${percentValSalary}%)`;

          pricingNoteEl.innerHTML = `<span class="note-highlight">${tier.label} rollout</span> with illustrative software cost assumptions included`;

          chart.data.datasets[0].data = legacyData;
          chart.data.datasets[1].data = verachiData;
          
          chart.update();
      }

      function animateValue(obj, value, prefix = "") {
          const start = parseInt(obj.innerText.replace(/[^0-9]/g, '')) || 0;
          const duration = 600;
          let startTime = null;

          const step = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(easeProgress * (value - start) + start);
              obj.innerHTML = prefix + current.toLocaleString();
              if (progress < 1) window.requestAnimationFrame(step);
          };
          window.requestAnimationFrame(step);
      }

      [orgSizeInput, hoursLostInput, salaryInput].forEach(input => {
          input.addEventListener('input', calculateData);
      });

      initChart();
      calculateData();
  }


  /* ============================================================
     CONTACT FORM — Multi-layered spam prevention + Verachi API
     ============================================================ */

  const CONTACT_FORM_ENDPOINT =
    window.VERACHI_CONTACT_ENDPOINT || 'https://app.verachi.io/api/contact';

  // ── Free email domains to block (B2B form) ─────────────────
  const FREE_EMAIL_DOMAINS = new Set([
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.jp',
    'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
    'aol.com', 'icloud.com', 'me.com', 'mac.com',
    'mail.com', 'protonmail.com', 'proton.me', 'zoho.com',
    'yandex.com', 'gmx.com', 'gmx.net', 'fastmail.com',
    'tutanota.com', 'hey.com', 'inbox.com', 'qq.com',
    '163.com', '126.com', 'naver.com', 'daum.net',
  ]);

  const MIN_SUBMIT_TIME_MS = 3000; // 3 seconds minimum before submit

  const contactForm = document.getElementById('contactForm');
  const cfLoadedAt = document.getElementById('cf_loaded_at');
  const cfError = document.getElementById('cfError');
  const cfSuccess = document.getElementById('cfSuccess');
  const cfSubmit = document.getElementById('cfSubmit');

  if (contactForm && cfLoadedAt) {
    // Record page load time for time-based check
    cfLoadedAt.value = Date.now().toString();

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Reset error
      cfError.hidden = true;
      cfError.textContent = '';
      contactForm.classList.add('was-validated');

      // Helper to restore the submit button from loading state
      const submitText = cfSubmit.querySelector('.cf-submit-text');
      const submitLoading = cfSubmit.querySelector('.cf-submit-loading');
      const resetButton = () => {
        submitText.hidden = false;
        submitLoading.hidden = true;
        cfSubmit.disabled = false;
      };

      const showSuccess = () => {
        contactForm.hidden = true;
        cfSuccess.hidden = false;
      };

      // 1. Honeypot check
      const honeypot = document.getElementById('cf_website');
      if (honeypot && honeypot.value) {
        // Bot detected — show fake success
        contactForm.hidden = true;
        cfSuccess.hidden = false;
        return;
      }

      // 2. Time-based check
      const loadedAt = parseInt(cfLoadedAt.value, 10);
      if (Date.now() - loadedAt < MIN_SUBMIT_TIME_MS) {
        // Too fast — likely bot, show fake success
        contactForm.hidden = true;
        cfSuccess.hidden = false;
        return;
      }

      // 3. HTML5 validation
      if (!contactForm.checkValidity()) {
        cfError.textContent = 'Please fill in all required fields.';
        cfError.hidden = false;
        resetButton();
        return;
      }

      // 4. Work-email validation
      const emailInput = document.getElementById('cf_email');
      const emailDomain = (emailInput.value.split('@')[1] || '').toLowerCase().trim();
      if (FREE_EMAIL_DOMAINS.has(emailDomain)) {
        cfError.textContent = 'Please use your work email. Free email providers (Gmail, Yahoo, etc.) are not accepted.';
        cfError.hidden = false;
        emailInput.focus();
        resetButton();
        return;
      }

      // Collect form data
      const formData = {
        name: document.getElementById('cf_name').value.trim(),
        email: emailInput.value.trim(),
        title: document.getElementById('cf_title').value.trim(),
        company: document.getElementById('cf_company').value.trim(),
        company_size: document.getElementById('cf_company_size').value,
        industry: document.getElementById('cf_industry').value,
        country: document.getElementById('cf_country').value,
        needs: document.getElementById('cf_needs').value.trim(),
        website: honeypot?.value || '',
        _loaded_at: cfLoadedAt.value,
        sourceUrl: window.location.href,
      };

      // Show loading state
      submitText.hidden = true;
      submitLoading.hidden = false;
      cfSubmit.disabled = true;

      try {
        const response = await fetch(CONTACT_FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          cfError.textContent =
            payload?.error?.message || 'We could not send your request. Please try again.';
          cfError.hidden = false;
          resetButton();
          return;
        }
      } catch (error) {
        cfError.textContent = 'We could not send your request. Please try again.';
        cfError.hidden = false;
        resetButton();
        return;
      }

      showSuccess();

      // Track conversion when the request is accepted.
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          event_category: 'contact',
          event_label: formData.company_size,
        });
      }

      resetButton();
    });
  }


  /* ============================================================
     HERO CYCLING — Rotate through grounded context examples
     ============================================================ */

  const heroCycleExamples = [
    {
      query: 'What decisions affected this project?',
      result: 'The reporting rollout changed after the team decided to support customer-specific exports. Verachi links the decision, the related Jira work, and the later implementation discussion in one cited view.',
      source: 'Decision record + Jira + Slack + meeting notes',
      confidence: 94,
      confidenceLabel: 'Grounded answer',
    },
    {
      query: 'Summarize the context behind this change.',
      result: 'Verachi pulls together the original decision, the linked project, and the source conversation so the summary explains <strong>what changed and why</strong> without losing the evidence trail.',
      source: 'Decision detail + project context + linked artifacts',
      confidence: 92,
      confidenceLabel: 'Cited summary',
    },
    {
      query: 'What related decisions should I review first?',
      result: 'The current project depends on <strong>three related decisions</strong> across billing, exports, and approval workflow. Verachi groups them so the team can follow the context path quickly.',
      source: 'Related decisions + project graph',
      confidence: 91,
      confidenceLabel: 'Related context',
    },
    {
      query: 'What changed since last week\'s plan?',
      result: 'Customer-requested reporting scope was added in two epics after kickoff. Verachi shows the cited source trail so the team can see <strong>when the plan changed</strong> and who needs the context.',
      source: 'Jira + meeting notes + customer requests',
      confidence: 93,
      confidenceLabel: 'Timeline grounded',
    },
  ];

  const heroQuery = document.querySelector('[data-hero-query]');
  const heroResult = document.querySelector('[data-hero-result]');
  const heroSource = document.querySelector('[data-hero-source]');
  const heroConfidence = document.querySelector('[data-hero-confidence]');
  const heroConfidenceText = document.querySelector('[data-hero-confidence-text]');
  const heroCycleContainer = document.querySelector('[data-hero-cycle]');

  if (heroQuery && heroResult && heroSource && heroCycleContainer && heroCycleExamples.length > 1) {
    let heroIndex = 0;
    const HERO_CYCLE_INTERVAL = 10000;
    const HERO_FADE_DURATION = 500;

    const heroProgress = document.querySelector('[data-hero-progress]');

    // Set the CSS variable so the animation duration matches the JS interval
    if (heroProgress) {
      heroProgress.parentElement.style.setProperty('--hero-cycle-duration', `${HERO_CYCLE_INTERVAL / 1000}s`);
    }

    const startProgress = () => {
      if (!heroProgress) return;
      // Restart CSS animation by removing and re-adding the class
      heroProgress.classList.remove('is-running');
      // Force a reflow so the browser registers the removal
      void heroProgress.offsetWidth;
      heroProgress.classList.add('is-running');
    };

    const cycleHero = () => {
      heroIndex = (heroIndex + 1) % heroCycleExamples.length;
      const example = heroCycleExamples[heroIndex];

      // Fade out
      heroCycleContainer.style.opacity = '0';
      heroCycleContainer.style.transform = 'translateY(8px)';

      setTimeout(() => {
        // Update content
        heroQuery.textContent = example.query;
        heroResult.innerHTML = `<p>${example.result}</p>`;
        heroSource.textContent = example.source;
        if (heroConfidence) {
          heroConfidence.style.width = `${example.confidence}%`;
        }
        if (heroConfidenceText) {
          heroConfidenceText.textContent = example.confidenceLabel || `${example.confidence}% confidence`;
        }

        // Fade in
        heroCycleContainer.style.opacity = '1';
        heroCycleContainer.style.transform = 'translateY(0)';

        // Restart the progress bar for the next cycle
        startProgress();
      }, HERO_FADE_DURATION);
    };

    // Smooth fade transition
    heroCycleContainer.style.transition = `opacity ${HERO_FADE_DURATION}ms ease, transform ${HERO_FADE_DURATION}ms ease`;

    // Start the first progress bar fill immediately
    startProgress();

    setInterval(cycleHero, HERO_CYCLE_INTERVAL);
  }
});
