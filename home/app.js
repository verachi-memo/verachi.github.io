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

/* ============================================================
   MOBILE MENU TOGGLE
   ============================================================ */
(function initMobileMenu() {
  const toggle = document.getElementById("mobileMenuToggle");
  const nav = document.getElementById("headerNav");
  const header = document.querySelector(".site-header");
  if (!toggle || !nav) return;

  const mobileQuery = window.matchMedia("(max-width: 720px)");

  function iconLine(svg, x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    svg.appendChild(line);
  }

  function createMenuIcon(open) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");

    if (open) {
      iconLine(svg, "18", "6", "6", "18");
      iconLine(svg, "6", "6", "18", "18");
    } else {
      iconLine(svg, "4", "7", "20", "7");
      iconLine(svg, "4", "12", "20", "12");
      iconLine(svg, "4", "17", "20", "17");
    }

    return svg;
  }

  function setMenuOpen(open) {
    const shouldOpen = mobileQuery.matches ? open : false;
    toggle.setAttribute("aria-expanded", String(shouldOpen));
    toggle.setAttribute("aria-label", shouldOpen ? "Close menu" : "Open menu");
    nav.hidden = !shouldOpen;
    if (header) header.classList.toggle("is-menu-open", shouldOpen);

    toggle.replaceChildren(createMenuIcon(shouldOpen));
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  // Close on nav link click
  nav.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  // On resize past breakpoint, ensure nav is visible on desktop and hidden on mobile
  function syncWithBreakpoint() {
    if (!mobileQuery.matches) {
      nav.hidden = false;
      toggle.setAttribute("aria-expanded", "false");
      if (header) header.classList.remove("is-menu-open");
    } else {
      // On mobile, nav should be hidden unless explicitly opened
      if (toggle.getAttribute("aria-expanded") !== "true") {
        nav.hidden = true;
        if (header) header.classList.remove("is-menu-open");
      }
    }
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncWithBreakpoint);
  } else {
    mobileQuery.addListener(syncWithBreakpoint);
  }

  // Initial sync
  syncWithBreakpoint();
})();

/* ============================================================
   EASED ANCHORS — slower, intentional in-page navigation
   ============================================================ */
(function initEasedAnchorScroll() {
  const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
  if (!anchors.length) return;

  let activeFrame = 0;

  function targetTop(target) {
    const styles = window.getComputedStyle(target);
    const marginTop = parseFloat(styles.scrollMarginTop || "0") || 0;
    return Math.max(0, target.getBoundingClientRect().top + window.scrollY - marginTop);
  }

  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  function scrollToTarget(target, sourceAnchor) {
    const startY = window.scrollY;
    const endY = targetTop(target);
    const distance = Math.abs(endY - startY);

    if (prefersReducedMotion.matches || distance < 4) {
      window.scrollTo(0, endY);
      if (sourceAnchor.classList.contains("skip-link")) {
        target.focus({ preventScroll: true });
      }
      return;
    }

    if (activeFrame) {
      window.cancelAnimationFrame(activeFrame);
      activeFrame = 0;
    }

    document.documentElement.classList.add("is-programmatic-scroll");
    const duration = Math.min(980, Math.max(540, distance * 0.38));
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + (endY - startY) * easeOutQuint(t));

      if (t < 1) {
        activeFrame = window.requestAnimationFrame(step);
        return;
      }

      activeFrame = 0;
      window.scrollTo(0, endY);
      document.documentElement.classList.remove("is-programmatic-scroll");
      if (sourceAnchor.classList.contains("skip-link")) {
        target.focus({ preventScroll: true });
      }
    }

    activeFrame = window.requestAnimationFrame(step);
  }

  anchors.forEach(anchor => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      let targetId = href.slice(1);
      try {
        targetId = decodeURIComponent(targetId);
      } catch {
        return;
      }

      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target, anchor);
      history.pushState(null, "", href);
    });
  });
})();


/* ============================================================
   ROI CALCULATOR — range sliders with max→input switch
   ============================================================ */
(function initROICalculator() {
  var teamSlider = document.getElementById("roiTeamSize");
  var hoursSlider = document.getElementById("roiHoursWasted");
  var salarySlider = document.getElementById("roiAvgSalary");
  if (!teamSlider || !hoursSlider || !salarySlider) return;

  var teamVal = document.getElementById("roiTeamSizeVal");
  var hoursVal = document.getElementById("roiHoursWastedVal");
  var salaryVal = document.getElementById("roiAvgSalaryVal");
  var elHoursLost = document.getElementById("roiHoursLost");
  var elCostLost = document.getElementById("roiCostLost");
  var elHoursSaved = document.getElementById("roiHoursSaved");
  var elSavings = document.getElementById("roiSavings");

  var WEEKS = 52, RECOVERY = 0.6;

  // Current effective values may exceed slider max through manual edits.
  var values = { team: 6, hours: 12, salary: 200000 };

  function fmtH(n) { return Math.round(n).toLocaleString("en-US") + " hrs"; }
  function fmtC(n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return "$" + Math.round(n / 1e3) + "K";
    return "$" + Math.round(n);
  }
  function fmtSalary(n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    return "$" + Math.round(n / 1e3) + "K";
  }

  function calc() {
    var rate = values.salary / (WEEKS * 40);
    var lost = values.team * values.hours * WEEKS;
    var costLost = lost * rate;
    
    animateNumberText(elHoursLost, lost, { formatter: fmtH });
    animateNumberText(elCostLost, costLost, { formatter: fmtC });
    animateNumberText(elHoursSaved, lost * RECOVERY, { formatter: fmtH });
    animateNumberText(elSavings, costLost * RECOVERY, { formatter: fmtC });
  }

  function updateDisplays() {
    if (teamVal) teamVal.textContent = values.team;
    if (hoursVal) hoursVal.textContent = values.hours;
    if (salaryVal) salaryVal.textContent = fmtSalary(values.salary);
  }

  function syncSliderFill(slider) {
    var min = parseFloat(slider.min) || 0;
    var max = parseFloat(slider.max) || 100;
    var val = parseFloat(slider.value) || min;
    var pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
    slider.style.setProperty("--range-progress", Math.min(Math.max(pct, 0), 100).toFixed(2) + "%");
  }

  function syncAllSliderFills() {
    [teamSlider, hoursSlider, salarySlider].forEach(syncSliderFill);
  }

  // Make slider output value clickable to enter custom unconstrained input
  function makeValEditable(outputEl, slider, key, formatter) {
    if (!outputEl || outputEl.tagName === "INPUT") return;

    outputEl.style.cursor = "pointer";
    outputEl.title = "Click to enter custom value";

    outputEl.addEventListener("click", function() {
      if (outputEl.tagName === "INPUT") return;

      var inp = document.createElement("input");
      inp.type = "number";
      inp.className = "roi-slider-value-input";
      inp.value = values[key];
      inp.min = "1";
      inp.id = outputEl.id;

      outputEl.replaceWith(inp);
      inp.focus();
      inp.select();

      // Update refs
      if (key === "team") teamVal = inp;
      if (key === "hours") hoursVal = inp;
      if (key === "salary") salaryVal = inp;

      inp.addEventListener("input", function() {
        values[key] = Math.max(1, parseInt(inp.value) || 1);
        var max = parseInt(slider.max);
        if (values[key] <= max) {
          slider.value = values[key];
          syncSliderFill(slider);
        } else {
          slider.value = max;
          syncSliderFill(slider);
        }
        calc();
      });

      inp.addEventListener("blur", function() {
        var out = document.createElement("output");
        out.className = "roi-slider-value";
        out.id = inp.id;
        out.textContent = formatter(values[key]);
        inp.replaceWith(out);

        if (key === "team") teamVal = out;
        if (key === "hours") hoursVal = out;
        if (key === "salary") salaryVal = out;

        var max = parseInt(slider.max);
        slider.value = Math.min(values[key], max);
        syncSliderFill(slider);

        // Keep editable recursively
        makeValEditable(out, slider, key, formatter);
      });
    });
  }

  // Slider event handlers
  teamSlider.addEventListener("input", function() {
    values.team = parseInt(teamSlider.value);
    syncSliderFill(teamSlider);
    if (teamVal) teamVal.textContent = values.team;
    calc();
  });

  hoursSlider.addEventListener("input", function() {
    values.hours = parseInt(hoursSlider.value);
    syncSliderFill(hoursSlider);
    if (hoursVal) hoursVal.textContent = values.hours;
    calc();
  });

  salarySlider.addEventListener("input", function() {
    values.salary = parseInt(salarySlider.value);
    syncSliderFill(salarySlider);
    if (salaryVal) salaryVal.textContent = fmtSalary(values.salary);
    calc();
  });

  makeValEditable(teamVal, teamSlider, "team", String);
  makeValEditable(hoursVal, hoursSlider, "hours", String);
  makeValEditable(salaryVal, salarySlider, "salary", fmtSalary);

  syncAllSliderFills();
  updateDisplays();
  calc();
})();

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function animateNumberText(el, targetValue, { duration = 650, formatter = v => `${Math.floor(v)}` } = {}) {
  if (!el) return;

  const startValue = (() => {
    if (el.dataset.value) {
      return Number(el.dataset.value) || 0;
    }
    const raw = (el.textContent || "").replace(/[^0-9]/g, "");
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  })();

  el.dataset.value = targetValue;

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
   SLACK CHANNEL MOCKS — switch channels in before/after panels
   ============================================================ */
(function initSlackChannelMocks() {
  const mocks = Array.from(document.querySelectorAll("[data-slack-mock]"));
  if (!mocks.length) return;

  const people = {
    maya: {
      name: "Maya Chen",
      title: "Product Lead",
      avatar: "./avatars/slack-maya.png",
    },
    alex: {
      name: "Alex Rivera",
      title: "Engineering Manager",
      avatar: "./avatars/slack-alex.png",
    },
    priya: {
      name: "Priya Shah",
      title: "Security Lead",
      avatar: "./avatars/slack-priya.png",
    },
    jordan: {
      name: "Jordan Lee",
      title: "QA Lead",
      avatar: "./avatars/slack-jordan.png",
    },
  };

  const channels = {
    before: {
      "launch-readiness": {
        status: "38 unread - decision unclear",
        messages: [
          ["maya", "9:42 AM", "Are we still holding checkout behind the fraud-review flag for the pilot?"],
          ["alex", "9:47 AM", "I remember a thread in #payments-risk, but the Jira ticket says the opposite."],
          ["priya", "10:03 AM", "The blocker is fraud review coverage. I need the exact decision before approving the launch note."],
        ],
      },
      "payments-risk": {
        status: "12 unread - owner unclear",
        messages: [
          ["alex", "9:31 AM", "The retry queue is still spiking on high-risk cards. Was the mitigation accepted or parked?"],
          ["priya", "9:36 AM", "I found a risk note in Jira, but no owner or closed-as reason."],
          ["maya", "9:51 AM", "Let's not unblock launch until someone confirms what changed since the last review."],
        ],
      },
      "security-review": {
        status: "7 unread - approval blocked",
        messages: [
          ["priya", "11:12 AM", "Can someone link the decision that scoped audit-log export out of the pilot?"],
          ["alex", "11:19 AM", "It was in a PR conversation, I think. Searching now."],
          ["jordan", "11:28 AM", "QA is waiting on this before we mark the evidence checklist complete."],
        ],
      },
      "customer-escalations": {
        status: "21 unread - repeated questions",
        messages: [
          ["maya", "1:06 PM", "Support is asking if we promised the customer a pilot date or only a readiness update."],
          ["jordan", "1:14 PM", "The answer changed twice in Slack. I don't know which one became final."],
          ["alex", "1:22 PM", "This is turning into a handoff risk. We need the final call before EOD."],
        ],
      },
    },
    after: {
      "launch-readiness": {
        status: "Verachi context attached",
        summary: {
          title: "Decision found",
          detail: "DEC-104 - checkout flag remains on for pilot cohorts",
          body: "Rationale: fraud-review coverage is not complete for high-risk payment methods. Related risk is still open and assigned to Security.",
          pills: ["Risk: at risk", "Owner: Priya", "Sources: Slack, Jira, PR"],
        },
        messages: [
          ["jordan", "10:06 AM", "That gives QA the launch rule. I'll update the pilot checklist against DEC-104."],
        ],
      },
      "payments-risk": {
        status: "Risk owner visible",
        summary: {
          title: "Risk found",
          detail: "RISK-211 - retry queue can delay pilot checkout",
          body: "Severity is at risk. Mitigation is assigned to Alex, with Priya as reviewer, and linked to the payment retry PR.",
          pills: ["Severity: at risk", "Owner: Alex", "Next: mitigation note"],
        },
        messages: [
          ["alex", "9:39 AM", "I have the owner now. I'll post the mitigation note and link the PR before standup."],
        ],
      },
      "security-review": {
        status: "Approval path clear",
        summary: {
          title: "Decision and control found",
          detail: "DEC-118 - audit-log export stays out of pilot scope",
          body: "The decision cites the security review and marks export scope as blocked until retention controls are approved.",
          pills: ["State: blocked", "Reviewer: Priya", "Evidence: 3 sources"],
        },
        messages: [
          ["priya", "11:21 AM", "This is enough for review. Keep export disabled and attach DEC-118 to the release note."],
        ],
      },
      "customer-escalations": {
        status: "Customer answer aligned",
        summary: {
          title: "Decision found",
          detail: "DEC-123 - send readiness update, not pilot date",
          body: "Support should share the readiness update after QA completes the checklist. No pilot date is committed yet.",
          pills: ["Risk: watch", "Owner: Maya", "Source: escalation thread"],
        },
        messages: [
          ["maya", "1:18 PM", "Good. I can give Support the exact wording and avoid another launch-date promise."],
        ],
      },
    },
  };

  function appendTextElement(parent, tagName, text, className) {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    el.textContent = text;
    parent.appendChild(el);
    return el;
  }

  function createMessageRow([personKey, time, body]) {
    const person = people[personKey];
    const row = document.createElement("div");
    row.className = "slack-message-row";

    const img = document.createElement("img");
    img.className = "slack-photo";
    img.src = person.avatar;
    img.alt = person.name;
    img.width = 40;
    img.height = 40;
    row.appendChild(img);

    const bodyWrap = document.createElement("div");
    const meta = document.createElement("div");
    meta.className = "slack-message-meta";
    appendTextElement(meta, "strong", person.name);
    appendTextElement(meta, "span", person.title);
    appendTextElement(meta, "span", time);
    bodyWrap.appendChild(meta);
    appendTextElement(bodyWrap, "p", body);
    row.appendChild(bodyWrap);

    return row;
  }

  function createSummary(summary) {
    if (!summary) return null;

    const wrap = document.createElement("div");
    wrap.className = "verachi-summary";

    const top = document.createElement("div");
    top.className = "verachi-summary-top";
    appendTextElement(top, "span", "V", "verachi-bot-mark");

    const textWrap = document.createElement("div");
    appendTextElement(textWrap, "strong", summary.title);
    appendTextElement(textWrap, "span", summary.detail);
    top.appendChild(textWrap);
    wrap.appendChild(top);

    appendTextElement(wrap, "p", summary.body);

    const pills = document.createElement("div");
    pills.className = "verachi-pills";
    pills.setAttribute("aria-label", "Verachi linked context");
    summary.pills.forEach((pill) => appendTextElement(pills, "span", pill));
    wrap.appendChild(pills);

    return wrap;
  }

  function createThreadContent(channelName, channel) {
    const fragment = document.createDocumentFragment();

    const header = document.createElement("div");
    header.className = "slack-thread-header";
    appendTextElement(header, "strong", `#${channelName}`);
    appendTextElement(header, "span", channel.status);
    fragment.appendChild(header);

    const summary = createSummary(channel.summary);
    if (summary) fragment.appendChild(summary);
    channel.messages.forEach((message) => fragment.appendChild(createMessageRow(message)));

    return fragment;
  }

  function renderChannel(mock, channelName) {
    const mode = mock.dataset.slackMock;
    const thread = mock.querySelector("[data-slack-thread]");
    const channel = channels[mode]?.[channelName];
    if (!thread || !channel) return;

    const alreadyActive = mock.querySelector(`.slack-channel.is-active[data-slack-channel="${channelName}"]`);
    if (alreadyActive) return;

    mock.querySelectorAll("[data-slack-channel]").forEach((button) => {
      const isActive = button.dataset.slackChannel === channelName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (prefersReducedMotion.matches) {
      thread.replaceChildren(createThreadContent(channelName, channel));
      return;
    }

    const token = `${Date.now()}-${Math.random()}`;
    thread.dataset.switchToken = token;
    thread.classList.add("is-switching");

    window.setTimeout(() => {
      if (thread.dataset.switchToken !== token) return;
      thread.replaceChildren(createThreadContent(channelName, channel));
      window.requestAnimationFrame(() => {
        thread.classList.remove("is-switching");
      });
    }, 120);
  }
  mocks.forEach((mock) => {
    mock.querySelectorAll("[data-slack-channel]").forEach((button) => {
      button.addEventListener("click", () => {
        const channelName = button.dataset.slackChannel;
        if (!channelName) return;
        mocks.forEach((m) => renderChannel(m, channelName));
      });
    });
  });
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
  const statEls = document.querySelectorAll(".recovered-stat");
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
  const fill = document.createElement("div");
  fill.className = "mobile-progress-fill";
  fill.id = "mobileProgressFill";
  bar.appendChild(fill);
  document.body.prepend(bar);

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
  const cfPlan = document.getElementById("cf_plan");
  const cfPlanNote = document.getElementById("cfPlanNote");
  const cfPlanValue = document.getElementById("cfPlanValue");

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
  const setPlan = (plan) => {
    const cleanPlan = plan || "General pilot";
    if (cfPlan) cfPlan.value = cleanPlan;
    if (cfPlanValue) {
      cfPlanValue.textContent = cleanPlan;
    } else if (cfPlanNote) {
      cfPlanNote.textContent = `Requesting: ${cleanPlan}`;
    }
  };

  document.querySelectorAll("[data-contact-plan]").forEach(link => {
    link.addEventListener("click", () => setPlan(link.getAttribute("data-contact-plan")));
  });

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
    cfSuccess.focus();
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

    // 2) HTML5 validation
    if (!contactForm.checkValidity()) {
      showError("Please fill in all required fields.");
      resetButton();
      return;
    }

    // 3) Work-email validation
    const emailInput = document.getElementById("cf_email");
    const emailDomain = (emailInput?.value.split("@")[1] || "").toLowerCase().trim();
    if (FREE_EMAIL_DOMAINS.has(emailDomain)) {
      showError("Please use your work email. Free email providers (Gmail, Yahoo, etc.) are not accepted.");
      emailInput?.focus?.();
      resetButton();
      return;
    }

    // 4) Time-based check
    const loadedAt = parseInt(cfLoadedAt.value, 10);
    if (Number.isFinite(loadedAt) && Date.now() - loadedAt < MIN_SUBMIT_TIME_MS) {
      showError("Please wait a moment and try again.");
      return;
    }

    const formData = {
      plan: cfPlan?.value || "General pilot",
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

    resetButton();
  });
})();

/* ============================================================
   10x DESIGN INTERACTION OVERHAULS — OPTION 1 (MATTE-PAPER)
   ============================================================ */

/* 1. Dynamic Background Mesh Gradient */
(function initMeshGradient() {
  if (prefersReducedMotion.matches) return;
  let frame = 0;
  window.addEventListener("mousemove", (e) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      document.body.style.setProperty("--bg-morph-x", x.toFixed(3));
      document.body.style.setProperty("--bg-morph-y", y.toFixed(3));
      frame = 0;
    });
  });
})();

/* 2. Scroll Header Contraction */
(function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  function checkScroll() {
    const isScrolled = window.scrollY > 50;
    header.classList.toggle("is-scrolled", isScrolled);
  }

  window.addEventListener("scroll", checkScroll, { passive: true });
  checkScroll();
})();

/* 3. Navigation Underline Slide Indicator */
(function initNavIndicator() {
  const nav = document.getElementById("headerNav");
  if (!nav) return;

  const line = document.createElement("div");
  line.className = "nav-indicator-line";
  nav.appendChild(line);

  const links = Array.from(nav.querySelectorAll("a"));

  links.forEach(link => {
    link.addEventListener("mouseenter", () => {
      if (prefersReducedMotion.matches) return;
      const rect = link.getBoundingClientRect();
      const parentRect = nav.getBoundingClientRect();
      line.style.width = `${rect.width}px`;
      line.style.left = `${rect.left - parentRect.left}px`;
      line.style.opacity = "1";
    });
  });

  nav.addEventListener("mouseleave", () => {
    line.style.opacity = "0";
  });
})();

/* 4. Proof Source Popover Tooltips (Ivory Outlines) */
(function initSourcePopovers() {
  const rows = document.querySelectorAll(".proof-source-row");
  rows.forEach(row => {
    const title = row.dataset.popoverTitle;
    const text = row.dataset.popoverText;
    const meta = row.dataset.popoverMeta;
    if (!title || !text) return;

    const popover = document.createElement("div");
    popover.className = "proof-popover glass-card";
    popover.setAttribute("role", "tooltip");

    const tEl = document.createElement("strong");
    tEl.textContent = title;
    const mEl = document.createElement("span");
    mEl.className = "popover-meta";
    mEl.textContent = meta;
    const pEl = document.createElement("p");
    pEl.textContent = text;

    popover.appendChild(tEl);
    popover.appendChild(mEl);
    popover.appendChild(pEl);
    row.appendChild(popover);
  });
})();
