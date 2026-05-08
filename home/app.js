/* ============================================================
   Verachi landing page interactions (home/)
   - Keeps motion subtle and opt-out via prefers-reduced-motion
   - Avoids "blank page until JS" by eagerly revealing in-view nodes
   - Drives the Problem activity feed + Connect orbit sequence
   - Submits contact form to Verachi API with spam protection
   ============================================================ */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toMoney(value) {
  return `$${Math.floor(value).toLocaleString()}`;
}

function animateNumberText(el, targetValue, { duration = 650, formatter = v => `${Math.floor(v)}` } = {}) {
  if (!el) return;

  const startValue = (() => {
    const raw = (el.textContent || "").replace(/[^0-9]/g, "");
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  })();

  if (prefersReducedMotion.matches || duration <= 0) {
    el.textContent = formatter(targetValue);
    return;
  }

  const startTime = performance.now();

  function tick(now) {
    const t = clamp((now - startTime) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = startValue + (targetValue - startValue) * eased;
    el.textContent = formatter(current);
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function setHeaderCostState({ mode, label, value, fillPct }) {
  const headerCost = document.getElementById("headerCost");
  const costLabel = document.getElementById("costLabel");
  const costValue = document.getElementById("costValue");
  const costFill = document.getElementById("costMeterFill");

  if (!headerCost || !costLabel || !costValue || !costFill) return;

  headerCost.classList.add("visible");
  headerCost.classList.toggle("is-saving", mode === "saving");

  costLabel.textContent = label;
  animateNumberText(costValue, value, { formatter: toMoney, duration: 700 });
  costFill.style.width = `${clamp(fillPct, 0, 100).toFixed(0)}%`;

  headerCost.classList.add("bump");
  window.setTimeout(() => headerCost.classList.remove("bump"), 520);
}

/* ============================================================
   ENTRANCE MOTION — add .in-view to elements as they enter
   ============================================================ */
(function initEntranceMotion() {
  const els = Array.from(document.querySelectorAll("[data-anim]"));
  if (!els.length) return;

  if (prefersReducedMotion.matches) {
    els.forEach(el => el.classList.add("in-view"));
    return;
  }

  function isAlreadyVisible(el) {
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight || 0;
    return rect.top < viewH * 0.86 && rect.bottom > viewH * 0.08;
  }

  // Eagerly reveal anything already in view (important for deep-links / fast paints).
  els.forEach(el => {
    if (isAlreadyVisible(el)) el.classList.add("in-view");
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  els.forEach(el => observer.observe(el));
})();

/* ============================================================
   PROBLEM STAGE — live activity feed + header cost meter
   ============================================================ */
(function initProblemStage() {
  const stage = document.getElementById("problemStage");
  const feedList = document.getElementById("problemFeedList");
  const statusEl = document.getElementById("problemStatus");
  const progressEl = document.getElementById("problemProgress");

  if (!stage || !feedList || !statusEl || !progressEl) return;

  const yearlyCost = Number(document.getElementById("statCostLost")?.dataset?.target || 0) || 187200;
  const yearlySavings = Number(document.getElementById("statSavings")?.dataset?.target || 0) || 112320;

  const toolIconSource = {
    slack: "#onode-0 svg",
    jira: "#onode-1 svg",
    github: "#onode-2 svg",
    teams: "#onode-3 svg",
  };

  const toolIconClass = {
    slack: "icon-color-slack",
    jira: "icon-color-jira",
    github: "icon-color-github",
    teams: "icon-color-teams",
  };

  function cloneToolSvg(tool) {
    const source = document.querySelector(toolIconSource[tool]);
    if (!source) return null;
    const clone = source.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("aria-label");
    return clone;
  }

  function appendItem({ tool, person, cost, title, body, meta }) {
    const item = document.createElement("div");
    item.className = "activity-item live-current";

    const icon = document.createElement("div");
    icon.className = `activity-item-icon ${toolIconClass[tool] || ""}`.trim();
    const svg = cloneToolSvg(tool);
    if (svg) icon.appendChild(svg);

    const content = document.createElement("div");
    
    // Person row
    const personRow = document.createElement("div");
    personRow.className = "activity-item-person";
    personRow.innerHTML = `
      <div class="person-details">
        <span class="person-name">${person.name}</span>
        <span class="person-title">${person.title}</span>
        <span class="person-salary">$${Math.round(person.salary / 1000)}k/yr</span>
      </div>
      <div class="event-cost" aria-label="Cost of event">
        +$${cost.toLocaleString()} lost
      </div>
    `;

    const titleRow = document.createElement("div");
    titleRow.className = "activity-item-title";

    const strong = document.createElement("strong");
    strong.textContent = title;

    const metaEl = document.createElement("span");
    metaEl.className = "activity-item-meta";
    metaEl.textContent = meta;

    titleRow.appendChild(strong);
    titleRow.appendChild(metaEl);

    const bodyEl = document.createElement("div");
    bodyEl.className = "activity-item-body";
    bodyEl.textContent = body;

    content.appendChild(personRow);
    content.appendChild(titleRow);
    content.appendChild(bodyEl);

    // Demote previous "current" item.
    const prev = feedList.querySelector(".activity-item.live-current");
    if (prev) prev.classList.remove("live-current");

    item.appendChild(icon);
    item.appendChild(content);
    feedList.appendChild(item);
  }

  const events = [
    {
      tool: "slack",
      person: { name: "Sarah", title: "Product Manager", salary: 185000 },
      cost: 320,
      title: "Same question, again",
      meta: "Slack · #delivery",
      body: "“Did we decide to ship read-only Jira write-backs for the pilot?”",
    },
    {
      tool: "jira",
      person: { name: "David", title: "Engineering Lead", salary: 210000 },
      cost: 540,
      title: "Ticket reopened",
      meta: "Jira · ENG-1824",
      body: "Acceptance criteria updated — but the original decision isn’t linked anywhere.",
    },
    {
      tool: "github",
      person: { name: "Elena", title: "Senior Staff Engineer", salary: 245000 },
      cost: 850,
      title: "PR drift",
      meta: "GitHub · PR #482",
      body: "Implementation diverged from the initial rationale; reviewers are reconstructing the why from threads.",
    },
    {
      tool: "teams",
      person: { name: "Marcus", title: "QA Lead", salary: 160000 },
      cost: 210,
      title: "Dependency question",
      meta: "Teams · Standup",
      body: "“Who owns the blocker? Which team signed off?” — context scattered across tools.",
    },
    {
      tool: "slack",
      person: { name: "Sarah", title: "Product Manager", salary: 185000 },
      cost: 480,
      title: "Decision archaeology",
      meta: "Slack · thread",
      body: "Links to three old messages, two tickets, and a PR… still no single source of truth.",
    },
    {
      tool: "jira",
      person: { name: "James", title: "Design Director", salary: 200000 },
      cost: 650,
      title: "Scope changes",
      meta: "Jira · EPIC-77",
      body: "Timeline shifted. The decision and tradeoffs weren’t captured, so the team repeats the debate.",
    },
    {
      tool: "github",
      person: { name: "David", title: "Engineering Lead", salary: 210000 },
      cost: 1100,
      title: "Risk surfaces late",
      meta: "GitHub · checks",
      body: "A risky change lands because the original constraints were never visible to reviewers.",
    },
    {
      tool: "teams",
      person: { name: "Elena", title: "Senior Staff Engineer", salary: 245000 },
      cost: 380,
      title: "Escalation ping",
      meta: "Teams · incident",
      body: "A launch question escalates — everyone asks the same “what did we decide?”",
    },
  ];

  let started = false;

  async function run() {
    started = true;
    stage.classList.add("stage-live");
    statusEl.textContent = "capturing";

    const baseDelay = prefersReducedMotion.matches ? 0 : 840;
    let costSoFar = 0;

    setHeaderCostState({
      mode: "cost",
      label: "Context cost / year",
      value: 0,
      fillPct: 0,
    });

    for (let i = 0; i < events.length; i++) {
      appendItem(events[i]);

      const pct = ((i + 1) / events.length) * 100;
      progressEl.style.width = `${pct.toFixed(0)}%`;

      costSoFar = Math.round((yearlyCost * (i + 1)) / events.length);
      setHeaderCostState({
        mode: "cost",
        label: "Context cost / year",
        value: costSoFar,
        fillPct: pct,
      });

      await sleep(baseDelay);
    }

    statusEl.textContent = "captured";
    stage.classList.remove("stage-live");

    // Preload the "savings" state so it’s ready when the user reaches Connect.
    stage.dataset.yearlySavings = String(yearlySavings);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || started) return;
      run();
    });
  }, { threshold: 0.35 });

  observer.observe(stage);
})();

/* ============================================================
   CONNECT ORBIT — staged reveal + optional particle streams
   ============================================================ */
(function initConnectAnimation() {
  const connectSection = document.getElementById("connectSection");
  if (!connectSection) return;

  const orbitCenter = document.getElementById("orbitCenter");
  const nodes = [0, 1, 2, 3].map(i => document.getElementById(`onode-${i}`));
  const lines = [0, 1, 2, 3].map(i => document.getElementById(`conn-${i}`));
  const packets = [0, 1, 2, 3].map(i => document.getElementById(`cpacket-${i}`));
  const cards = Array.from(document.querySelectorAll(".integration-card"));
  const statusBar = document.getElementById("connectStatus");

  const timeouts = new Set();
  const particleStops = [];

  function later(fn, delay) {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, delay);
    timeouts.add(id);
  }

  function stopAllParticles() {
    particleStops.splice(0).forEach(stop => {
      try { stop(); } catch { /* ignore */ }
    });
  }

  function clearScheduled() {
    timeouts.forEach(id => window.clearTimeout(id));
    timeouts.clear();
  }

  function startParticleStream(index) {
    const line = lines[index];
    const container = document.getElementById("particles-container");
    if (!line || !container) return () => {};

    const x1 = parseFloat(line.getAttribute("x1"));
    const y1 = parseFloat(line.getAttribute("y1"));
    const x2 = parseFloat(line.getAttribute("x2"));
    const y2 = parseFloat(line.getAttribute("y2"));

    let stopped = false;
    let timeoutId = null;

    function spawnParticle() {
      if (stopped) return;

      const particle = document.createElement("div");
      particle.className = `stream-particle stream-particle-${index} active`;
      container.appendChild(particle);

      let progress = 0;
      const speed = 0.006 + Math.random() * 0.006;

      function step() {
        if (stopped) {
          particle.remove();
          return;
        }

        progress += speed;
        if (progress > 1) {
          particle.remove();
          return;
        }

        const cx = x1 + (x2 - x1) * progress;
        const cy = y1 + (y2 - y1) * progress;
        particle.style.left = `${(cx / 420) * 100}%`;
        particle.style.top = `${(cy / 420) * 100}%`;

        // Fade at ends
        if (progress < 0.12) {
          particle.style.opacity = (progress / 0.12).toFixed(2);
        } else if (progress > 0.88) {
          particle.style.opacity = (1 - (progress - 0.88) / 0.12).toFixed(2);
        } else {
          particle.style.opacity = "1";
        }

        requestAnimationFrame(step);
      }

      requestAnimationFrame(step);

      const nextDelay = 320 + Math.random() * 1100;
      timeoutId = window.setTimeout(spawnParticle, nextDelay);
    }

    spawnParticle();

    return () => {
      stopped = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }

  let animated = false;

  function runConnectSequence() {
    const isReduced = prefersReducedMotion.matches;
    const baseDelay = isReduced ? 0 : 380;
    const stagger = isReduced ? 40 : 280;

    // Center logo
    later(() => orbitCenter?.classList.add("active"), baseDelay);

    // Nodes appear
    nodes.forEach((node, i) => {
      later(() => node?.classList.add("active"), baseDelay + 520 + i * stagger);
    });

    // Lines draw + packets appear + optional particles
    lines.forEach((line, i) => {
      later(() => {
        line?.classList.add("drawn");
        packets[i]?.classList.add("visible");
        later(() => {
          nodes[i]?.classList.add("connected");
          if (!isReduced) particleStops.push(startParticleStream(i));
        }, isReduced ? 0 : 380);
      }, baseDelay + 1500 + i * stagger);
    });

    // Integration cards
    cards.forEach((card, i) => {
      later(() => card.classList.add("visible"), baseDelay + 2800 + i * (isReduced ? 40 : 180));
    });

    // Status bar
    later(() => statusBar?.classList.add("visible"), baseDelay + (isReduced ? 180 : 3600));

    // Update the header "savings" state once the connect section has "landed".
    later(() => {
      const yearlySavings = Number(document.getElementById("statSavings")?.dataset?.target || 0) || 112320;
      setHeaderCostState({
        mode: "saving",
        label: "Recovered / year",
        value: yearlySavings,
        fillPct: 100,
      });
    }, baseDelay + (isReduced ? 200 : 3800));
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animated) {
          animated = true;
          runConnectSequence();
        }
        return;
      }

      // Out of view: stop particle churn to save CPU.
      stopAllParticles();
      clearScheduled();
    });
  }, { threshold: 0.22 });

  observer.observe(connectSection);
})();

/* ============================================================
   COUNT-UP — animate stat numbers when they enter view
   ============================================================ */
(function initCountUp() {
  const statEls = document.querySelectorAll(".comparison-stat, .recovered-stat");
  if (!statEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;

      const targetVal = Number(el.dataset.target || "");
      if (!Number.isFinite(targetVal) || targetVal <= 0) return;

      const originalText = el.textContent.trim();
      const isCurrency = originalText.includes("$");
      const isHours = originalText.toLowerCase().includes("hrs");

      const formatter = (val) => {
        const n = Math.floor(val);
        if (isCurrency) return `$${n.toLocaleString()}`;
        if (isHours) return `${n.toLocaleString()} hrs`;
        return n.toLocaleString();
      };

      animateNumberText(el, targetVal, { duration: 1400, formatter });

      // Restore original copy (e.g. "~$187K") to keep the page honest and scannable.
      window.setTimeout(() => { el.textContent = originalText; }, prefersReducedMotion.matches ? 0 : 1600);
    });
  }, { threshold: 0.2 });

  statEls.forEach(el => observer.observe(el));
})();

/* ============================================================
   MOBILE PROGRESS BAR — horizontal bar (tiny affordance)
   ============================================================ */
(function initMobileProgress() {
  if (window.innerWidth > 720) return;

  const bar = document.createElement("div");
  bar.className = "mobile-progress";
  bar.innerHTML = '<div class="mobile-progress-fill" id="mobileProgressFill"></div>';
  document.body.prepend(bar);

  const fill = document.getElementById("mobileProgressFill");
  if (!fill) return;

  function updateMobileProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    fill.style.width = pct + "%";
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateMobileProgress();
      ticking = false;
    });
  }, { passive: true });

  updateMobileProgress();
})();

/* ============================================================
   MOBILE HEADER AUTO-HIDE — save vertical space
   ============================================================ */
(function initHeaderAutoHide() {
  if (window.innerWidth > 720) return;

  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastScroll = window.scrollY;
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 120) {
        header.classList.add("header-hidden");
      } else {
        header.classList.remove("header-hidden");
      }
      lastScroll = currentScroll;
      ticking = false;
    });
  }, { passive: true });
})();

/* ============================================================
   CONTACT FORM — spam protection + Verachi API
   ============================================================ */
(function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  const cfLoadedAt = document.getElementById("cf_loaded_at");
  const cfError = document.getElementById("cfError");
  const cfSuccess = document.getElementById("cfSuccess");
  const cfSubmit = document.getElementById("cfSubmit");

  if (!contactForm || !cfLoadedAt || !cfError || !cfSuccess || !cfSubmit) return;

  const CONTACT_FORM_ENDPOINT =
    window.VERACHI_CONTACT_ENDPOINT || "https://app.verachi.io/api/contact";

  const FREE_EMAIL_DOMAINS = new Set([
    "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.jp",
    "hotmail.com", "outlook.com", "live.com", "msn.com",
    "aol.com", "icloud.com", "me.com", "mac.com",
    "mail.com", "protonmail.com", "proton.me", "zoho.com",
    "yandex.com", "gmx.com", "gmx.net", "fastmail.com",
    "tutanota.com", "hey.com", "inbox.com", "qq.com",
    "163.com", "126.com", "naver.com", "daum.net",
  ]);

  const MIN_SUBMIT_TIME_MS = 3000;

  cfLoadedAt.value = Date.now().toString();

  const submitText = cfSubmit.querySelector(".cf-submit-text");
  const submitLoading = cfSubmit.querySelector(".cf-submit-loading");

  const resetButton = () => {
    if (submitText) submitText.hidden = false;
    if (submitLoading) submitLoading.hidden = true;
    cfSubmit.disabled = false;
  };

  const showError = (msg) => {
    cfError.textContent = msg;
    cfError.hidden = false;
  };

  const showSuccess = () => {
    contactForm.hidden = true;
    cfSuccess.hidden = false;
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    cfError.hidden = true;
    cfError.textContent = "";
    contactForm.classList.add("was-validated");

    // 1) Honeypot
    const honeypot = document.getElementById("cf_website");
    if (honeypot && honeypot.value) {
      showSuccess();
      return;
    }

    // 2) Time-based check
    const loadedAt = parseInt(cfLoadedAt.value, 10);
    if (Number.isFinite(loadedAt) && Date.now() - loadedAt < MIN_SUBMIT_TIME_MS) {
      showSuccess();
      return;
    }

    // 3) HTML5 validation
    if (!contactForm.checkValidity()) {
      showError("Please fill in all required fields.");
      resetButton();
      return;
    }

    // 4) Work-email validation
    const emailInput = document.getElementById("cf_email");
    const emailDomain = (emailInput?.value.split("@")[1] || "").toLowerCase().trim();
    if (FREE_EMAIL_DOMAINS.has(emailDomain)) {
      showError("Please use your work email. Free email providers (Gmail, Yahoo, etc.) are not accepted.");
      emailInput?.focus?.();
      resetButton();
      return;
    }

    const formData = {
      name: document.getElementById("cf_name")?.value.trim(),
      email: emailInput?.value.trim(),
      title: document.getElementById("cf_title")?.value.trim(),
      company: document.getElementById("cf_company")?.value.trim(),
      company_size: document.getElementById("cf_company_size")?.value,
      industry: document.getElementById("cf_industry")?.value,
      country: document.getElementById("cf_country")?.value,
      needs: document.getElementById("cf_needs")?.value.trim(),
      website: honeypot?.value || "",
      _loaded_at: cfLoadedAt.value,
      sourceUrl: window.location.href,
    };

    // Loading state
    if (submitText) submitText.hidden = true;
    if (submitLoading) submitLoading.hidden = false;
    cfSubmit.disabled = true;

    try {
      const response = await fetch(CONTACT_FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        showError(payload?.error?.message || "We could not send your request. Please try again.");
        resetButton();
        return;
      }
    } catch {
      showError("We could not send your request. Please try again.");
      resetButton();
      return;
    }

    showSuccess();

    if (typeof gtag === "function") {
      gtag("event", "generate_lead", {
        event_category: "contact",
        event_label: formData.company_size || "",
      });
    }

    resetButton();
  });
})();

