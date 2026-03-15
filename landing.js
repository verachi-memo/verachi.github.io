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

  const revealTargets = document.querySelectorAll('[data-reveal], [data-observe]');
  if (reducedMotionQuery.matches) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  } else if (!('IntersectionObserver' in window)) {
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
      history.pushState(null, '', href);
    });
  });


  /* ============================================================
     SAVINGS CALCULATOR — Interactive ROI graph
     ============================================================ */
  const calcTeamSize = document.getElementById('calcTeamSize');
  const calcHoursWeek = document.getElementById('calcHoursWeek');
  const calcHourlyRate = document.getElementById('calcHourlyRate');
  const calcTeamSizeValue = document.getElementById('calcTeamSizeValue');
  const calcHoursWeekValue = document.getElementById('calcHoursWeekValue');
  const calcHourlyRateValue = document.getElementById('calcHourlyRateValue');
  const calcAnnualSavings = document.getElementById('calcAnnualSavings');
  const calcHoursReclaimed = document.getElementById('calcHoursReclaimed');
  const savingsCanvas = document.getElementById('savingsCanvas');

  if (calcTeamSize && calcHoursWeek && calcHourlyRate && savingsCanvas) {
    const ctx = savingsCanvas.getContext('2d');
    const currencyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const numberFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
    const REDUCTION = 0.6;
    const PIVOT_MONTH = 6;

    // Pair each slider with its number input
    const sliderPairs = [
      { slider: calcTeamSize, input: calcTeamSizeValue },
      { slider: calcHoursWeek, input: calcHoursWeekValue },
      { slider: calcHourlyRate, input: calcHourlyRateValue },
    ];

    const setPercent = (pair) => {
      const min = parseInt(pair.slider.min, 10) || 0;
      const max = parseInt(pair.slider.max, 10) || 100;
      const val = parseInt(pair.slider.value, 10) || min;
      const percent = ((val - min) / (max - min)) * 100;
      pair.slider.style.setProperty('--val', `${percent}%`);
    };

    // Sync slider → number input, unlock at max
    const syncSliderToInput = (pair) => {
      const val = parseInt(pair.slider.value, 10);
      const max = parseInt(pair.slider.max, 10);
      pair.input.value = val;
      if (val >= max) {
        pair.input.removeAttribute('readonly');
      } else {
        pair.input.setAttribute('readonly', '');
      }
      setPercent(pair);
    };

    // Sync number input → slider (clamp to slider range)
    const syncInputToSlider = (pair) => {
      let val = parseInt(pair.input.value, 10);
      if (isNaN(val) || val < 1) {
        val = 1;
        pair.input.value = val;
      }
      const max = parseInt(pair.slider.max, 10);
      pair.slider.value = Math.min(val, max);
      setPercent(pair);
    };

    // Get the effective value (from number input, which may exceed slider max)
    const getVal = (pair) => {
      const v = parseInt(pair.input.value, 10);
      return isNaN(v) || v < 1 ? 1 : v;
    };

    // Animation state
    const state = {
      team: getVal(sliderPairs[0]),
      hours: getVal(sliderPairs[1]),
      rate: getVal(sliderPairs[2])
    };
    
    let animFrame = null;

    const animateGraph = () => {
      let needsUpdate = false;
      const targetTeam = getVal(sliderPairs[0]);
      const targetHours = getVal(sliderPairs[1]);
      const targetRate = getVal(sliderPairs[2]);
      
      const ease = 0.15;
      const updateVal = (current, target) => {
        if (Math.abs(target - current) < 0.05) return target;
        needsUpdate = true;
        return current + (target - current) * ease;
      };
      
      state.team = updateVal(state.team, targetTeam);
      state.hours = updateVal(state.hours, targetHours);
      state.rate = updateVal(state.rate, targetRate);
      
      renderGraph(state.team, state.hours, state.rate);
      
      if (needsUpdate) {
        animFrame = requestAnimationFrame(animateGraph);
      } else {
        animFrame = null;
      }
    };

    const drawGraph = () => {
      if (!animFrame) animFrame = requestAnimationFrame(animateGraph);
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = savingsCanvas.getBoundingClientRect();
      savingsCanvas.width = rect.width * dpr;
      savingsCanvas.height = rect.width * 0.56 * dpr;
      savingsCanvas.style.height = (rect.width * 0.56) + 'px';
      ctx.scale(dpr, dpr);
    };

    const renderGraph = (team, hours, rate) => {
      // Compute KPIs
      const weeklyCost = team * hours * rate;
      const annualCost = weeklyCost * 52;
      const annualSaved = annualCost * REDUCTION;
      const hoursReclaimed = team * hours * REDUCTION * 52;
      calcAnnualSavings.textContent = currencyFmt.format(annualSaved);
      calcHoursReclaimed.textContent = numberFmt.format(hoursReclaimed);

      // Canvas dimensions (CSS pixels)
      const dpr = window.devicePixelRatio || 1;
      const W = savingsCanvas.width / dpr || 600;
      const H = savingsCanvas.height / dpr || 340;

      // Margins
      const ml = 64, mr = 24, mt = 32, mb = 44;
      const gw = W - ml - mr;
      const gh = H - mt - mb;

      ctx.clearRect(0, 0, Math.max(W, 1000), Math.max(H, 1000));

      if (gw <= 0 || gh <= 0) return;

      // Monthly cost data
      const monthlyCost = weeklyCost * 4.33;
      const months = 12;
      const maxCost = monthlyCost * (months + 1);

      const xForMonth = (m) => ml + (m / months) * gw;
      const yForCost = (c) => mt + (maxCost > 0 ? gh - (c / maxCost) * gh : gh);

      // Grid lines
      ctx.strokeStyle = 'rgba(171, 194, 229, 0.07)';
      ctx.lineWidth = 1;
      const gridSteps = 5;
      for (let i = 0; i <= gridSteps; i++) {
        const y = mt + (gh / gridSteps) * i;
        ctx.beginPath();
        ctx.moveTo(ml, y);
        ctx.lineTo(W - mr, y);
        ctx.stroke();
      }

      // Y-axis labels
      ctx.fillStyle = 'rgba(163, 177, 200, 0.5)';
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= gridSteps; i++) {
        const val = maxCost - (maxCost / gridSteps) * i;
        const y = mt + (gh / gridSteps) * i;
        const label = val >= 1000 ? '$' + Math.round(val / 1000) + 'k' : '$' + Math.round(val);
        ctx.fillText(label, ml - 10, y);
      }

      // X-axis labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let m = 1; m <= months; m++) {
        ctx.fillText('M' + m, xForMonth(m), H - mb + 12);
      }

      // Build data points
      const withoutPoints = [];
      const withPoints = [];
      let cumWithout = 0;
      let cumWith = 0;
      for (let m = 0; m <= months; m++) {
        if (m > 0) {
          cumWithout += monthlyCost;
          if (m <= PIVOT_MONTH) {
            cumWith += monthlyCost;
          } else {
            cumWith += monthlyCost * (1 - REDUCTION);
          }
        }
        withoutPoints.push({ x: xForMonth(m), y: yForCost(cumWithout) });
        withPoints.push({ x: xForMonth(m), y: yForCost(cumWith) });
      }

      // Savings fill (area between lines after pivot)
      const pivotIdx = PIVOT_MONTH;
      ctx.beginPath();
      ctx.moveTo(withoutPoints[pivotIdx].x, withoutPoints[pivotIdx].y);
      for (let i = pivotIdx; i < withoutPoints.length; i++) {
        ctx.lineTo(withoutPoints[i].x, withoutPoints[i].y);
      }
      for (let i = withPoints.length - 1; i >= pivotIdx; i--) {
        ctx.lineTo(withPoints[i].x, withPoints[i].y);
      }
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(0, mt, 0, mt + gh);
      fillGrad.addColorStop(0, 'rgba(132, 241, 212, 0.12)');
      fillGrad.addColorStop(1, 'rgba(85, 196, 255, 0.04)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Without Verachi line (full)
      ctx.beginPath();
      ctx.moveTo(withoutPoints[0].x, withoutPoints[0].y);
      for (let i = 1; i < withoutPoints.length; i++) {
        ctx.lineTo(withoutPoints[i].x, withoutPoints[i].y);
      }
      ctx.strokeStyle = '#f6a693';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // With Verachi line (same as without until pivot, then diverges)
      ctx.beginPath();
      ctx.moveTo(withPoints[0].x, withPoints[0].y);
      for (let i = 1; i <= pivotIdx; i++) {
        ctx.lineTo(withPoints[i].x, withPoints[i].y);
      }
      ctx.strokeStyle = '#f6a693';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(withPoints[pivotIdx].x, withPoints[pivotIdx].y);
      for (let i = pivotIdx + 1; i < withPoints.length; i++) {
        ctx.lineTo(withPoints[i].x, withPoints[i].y);
      }
      const lineGrad = ctx.createLinearGradient(withPoints[pivotIdx].x, 0, withPoints[withPoints.length - 1].x, 0);
      lineGrad.addColorStop(0, '#8fd9ff');
      lineGrad.addColorStop(1, '#84f1d4');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pivot dashed line
      const pivotX = xForMonth(PIVOT_MONTH);
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(245, 247, 251, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pivotX, mt);
      ctx.lineTo(pivotX, mt + gh);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pivot label
      ctx.fillStyle = 'rgba(245, 247, 251, 0.45)';
      ctx.font = '700 9px "Manrope", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('START USING VERACHI', pivotX, mt - 8);

      // Legend labels at end of lines
      const lastIdx = withoutPoints.length - 1;

      ctx.fillStyle = '#f6a693';
      ctx.font = '600 10px "Manrope", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Without Verachi', withoutPoints[lastIdx].x - gw * 0.28, withoutPoints[lastIdx].y - 12);

      ctx.fillStyle = '#84f1d4';
      ctx.fillText('With Verachi', withPoints[lastIdx].x - gw * 0.22, withPoints[lastIdx].y + 14);

      // "YOUR SAVINGS" label in middle of shaded area
      const midMonth = Math.round((PIVOT_MONTH + months) / 2);
      const savingsLabelY = (withoutPoints[midMonth].y + withPoints[midMonth].y) / 2;
      ctx.fillStyle = 'rgba(132, 241, 212, 0.35)';
      ctx.font = '800 11px "Manrope", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '0.08em';
      ctx.fillText('YOUR SAVINGS', xForMonth(midMonth), savingsLabelY);
    };

    // Initial sync
    sliderPairs.forEach(syncSliderToInput);
    
    // Set initial animation state safely after sync
    state.team = getVal(sliderPairs[0]);
    state.hours = getVal(sliderPairs[1]);
    state.rate = getVal(sliderPairs[2]);
    
    resizeCanvas();
    renderGraph(state.team, state.hours, state.rate);

    // Slider → input sync + redraw
    sliderPairs.forEach((pair) => {
      pair.slider.addEventListener('input', () => {
        syncSliderToInput(pair);
        drawGraph();
      });
    });

    // Number input → slider sync + redraw
    sliderPairs.forEach((pair) => {
      pair.input.addEventListener('input', () => {
        syncInputToSlider(pair);
        drawGraph();
      });

      // Validate on blur: ensure always a positive number
      pair.input.addEventListener('blur', () => {
        let val = parseInt(pair.input.value, 10);
        if (isNaN(val) || val < 1) {
          val = parseInt(pair.slider.min, 10) || 1;
          pair.input.value = val;
        }
        syncInputToSlider(pair);
        drawGraph();
      });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resizeCanvas(); drawGraph(); }, 100);
    });
  }


  /* ============================================================
     CONTACT FORM — Multi-layered spam prevention + Google Forms
     ============================================================ */

  // ── Google Forms configuration ──────────────────────────────
  // To wire up Google Forms:
  // 1. Create a Google Form with matching fields
  // 2. Open the form preview, view page source
  // 3. Find the <form action="..."> URL and each <input name="entry.XXXX">
  // 4. Fill in the config below
  const GOOGLE_FORM_CONFIG = {
    actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdUs3xM0Z_9zR-62EH_8QOp35mvRw5053NUwcDTTzLofrK46w/formResponse',
    fields: {
      name:         'entry.328464235',
      email:        'entry.1157589296',
      title:        'entry.1626000907',
      company:      'entry.1204361996',
      company_size: 'entry.1296119212',
      industry:     'entry.342561304',
      country:      'entry.484466495',
      needs:        'entry.714681676',
    }
  };

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
        return;
      }

      // 4. Work-email validation
      const emailInput = document.getElementById('cf_email');
      const emailDomain = (emailInput.value.split('@')[1] || '').toLowerCase().trim();
      if (FREE_EMAIL_DOMAINS.has(emailDomain)) {
        cfError.textContent = 'Please use your work email. Free email providers (Gmail, Yahoo, etc.) are not accepted.';
        cfError.hidden = false;
        emailInput.focus();
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
      };

      // Show loading state
      const submitText = cfSubmit.querySelector('.cf-submit-text');
      const submitLoading = cfSubmit.querySelector('.cf-submit-loading');
      submitText.hidden = true;
      submitLoading.hidden = false;
      cfSubmit.disabled = true;

      try {
        // 5. Submit to Google Forms (if configured)
        if (GOOGLE_FORM_CONFIG.actionUrl) {
          const gfData = new FormData();
          for (const [key, entryId] of Object.entries(GOOGLE_FORM_CONFIG.fields)) {
            if (entryId && formData[key] !== undefined) {
              gfData.append(entryId, formData[key]);
            }
          }

          await fetch(GOOGLE_FORM_CONFIG.actionUrl, {
            method: 'POST',
            mode: 'no-cors', // Google Forms doesn't support CORS
            body: gfData,
          });
        }

        // Success
        contactForm.hidden = true;
        cfSuccess.hidden = false;

        // Track conversion in GA
        if (typeof gtag === 'function') {
          gtag('event', 'generate_lead', {
            event_category: 'contact',
            event_label: formData.company_size,
          });
        }

      } catch (_error) {
        // Even on network error, show success (Google Forms no-cors
        // always appears as an opaque response / error anyway)
        contactForm.hidden = true;
        cfSuccess.hidden = false;
      }
    });
  }
});

