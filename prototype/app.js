/* ============================================================
   BACKGROUND MORPH — slowly animate body gradients
   ============================================================ */
(function bgMorph() {
  const body = document.body;
  let phase = 0;
  function step(ts) {
    phase = (ts / 40000) * Math.PI * 2;
    body.style.setProperty('--bg-morph-x', Math.sin(phase));
    body.style.setProperty('--bg-morph-y', Math.cos(phase * 0.7));
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();

/* ============================================================
   DATA — Team members
   ============================================================ */
const TEAM = [
  { name: "Tom Reeves",      role: "Product Manager",     salary: 225000, initials: "TR", color: "hsl(215,60%,50%)" },
  { name: "Helena Park",     role: "Engineering Lead",    salary: 250000, initials: "HP", color: "hsl(280,50%,55%)" },
  { name: "Marcus Chen",     role: "Senior Engineer",     salary: 210000, initials: "MC", color: "hsl(165,50%,45%)" },
  { name: "Priya Sharma",    role: "Senior Engineer",     salary: 195000, initials: "PS", color: "hsl(340,55%,55%)" },
  { name: "James Okafor",    role: "DevOps / Platform",   salary: 205000, initials: "JO", color: "hsl(30,60%,50%)" },
  { name: "Anika Lindqvist", role: "QA Lead",             salary: 180000, initials: "AL", color: "hsl(190,55%,50%)" },
];

const TOTAL_SALARY = TEAM.reduce((s, t) => s + t.salary, 0);
const HOURLY_RATE = (TOTAL_SALARY * 1.25) / 2080; // loaded rate across all
const PER_SECOND = HOURLY_RATE / 3600;

/* ============================================================
   UNIFIED FEED — full narrative from chaos to resolution
   Variable per-message delays for realistic pacing.
   ============================================================ */
const UNIFIED_MSGS = [
  // ── Chaos phase: team discovers the overlap ──
  { who: "Tom Reeves",    where: "Slack",   icon: "slack",   delay: 2000,  text: "Hey, does anyone know why we changed the auth flow for the billing service? I can't find the original decision anywhere.", costBump: 54 },
  { who: "Helena Park",   where: "Slack",   icon: "slack",   delay: 3200,  text: "I think Marcus decided that in a thread 2 weeks ago? Let me search...", costBump: 60 },
  { who: "Marcus Chen",   where: "GitHub",  icon: "github",  delay: 4800,  text: "Opened PR #247: <code>refactor: migrate billing to JWT tokens</code>", cost: "$72/hr", costBump: 420 },
  { who: "Priya Sharma",  where: "Jira",    icon: "jira",    delay: 2600,  text: "Created ticket ENG-1142: \"Investigate auth token migration for billing\"", cost: "$68/hr", costBump: 117 },
  { who: "James Okafor",  where: "GitHub",  icon: "github",  delay: 3800,  text: "Opened PR #249: <code>feat: add JWT auth to billing-service</code>", cost: "$71/hr", costBump: 426 },
  { who: "Tom Reeves",    where: "Slack",   icon: "slack",   delay: 1500,  text: "@helena wait, James is also working on this? I thought Marcus was handling it.", costBump: 36 },
  { who: "Helena Park",   where: "Slack",   icon: "slack",   delay: 3500,  text: "Looks like we have two PRs for the same thing. Let me check who started first...", costBump: 80 },
  { who: "Anika Lindqvist", where: "Slack", icon: "slack",   delay: 2500,  text: "I already wrote integration tests for Marcus's approach. Are those still valid?", costBump: 43 },

  // ── Scramble phase: cost becomes visible ──
  { who: "Tom Reeves",    where: "Slack",   icon: "slack",   delay: 5000,  text: "Emergency: product review is tomorrow. Can someone summarize what state billing auth is in?", costBump: 54 },
  { who: "Helena Park",   where: "Slack",   icon: "slack",   delay: 4200,  text: "I've been reading through 47 Slack messages and 3 Jira threads for the last 40 minutes trying to figure this out.", cost: "$83/hr", costBump: 83 },
  { who: "Marcus Chen",   where: "GitHub",  icon: "github",  delay: 5500,  text: "Closed PR #247 — duplicate of James's PR #249. 6 hours of work discarded.", cost: "$420 wasted", costBump: 630 },
  { who: "Priya Sharma",  where: "Jira",    icon: "jira",    delay: 2800,  text: "Moved ENG-1142 to 'Blocked'. Waiting on Helena's investigation into which approach is correct.", costBump: 47 },
  { who: "James Okafor",  where: "Slack",   icon: "slack",   delay: 3600,  text: "I found a screenshot of a whiteboard from 3 weeks ago but I don't know if it's still the plan.", cost: "$71/hr", costBump: 71 },
  { who: "Anika Lindqvist", where: "Jira",  icon: "jira",    delay: 4000,  text: "My test suite is now broken because Marcus's branch was abandoned. Re-writing from James's branch.", cost: "$62/hr", costBump: 186 },
  { who: "Helena Park",   where: "Slack",   icon: "slack",   delay: 6000,  text: "OK — after an hour of archaeology, I believe the decision was made in a thread that I wasn't tagged on. The decision was never recorded anywhere formal.", cost: "$83/hr lost", costBump: 125 },
  { who: "Tom Reeves",    where: "Slack",   icon: "slack",   delay: 3000,  text: "So we've burned ~2 days of senior engineer time because a decision wasn't captured. And this isn't the first time.", costBump: 36 },
  { who: "Priya Sharma",  where: "Slack",   icon: "slack",   delay: 2500,  text: "This happens every sprint. It's not a one-time thing, Tom.", costBump: 23 },

  // ── Pivot: team tries Verachi ──
  { who: "Tom Reeves",    where: "Slack",   icon: "verachi", delay: 6500,  text: "<code>@verachi</code> What was the decision on billing auth migration?", saving: "0 min", saveBump: 0 },
  { who: "Verachi",       where: "Verachi", icon: "verachi", delay: 1800,  text: "The team decided on March 12 to migrate billing-service to JWT tokens (replacing session cookies). The decision was made by Helena Park and Marcus Chen in the #eng-platform thread, linked to Jira epic ENG-1100.", saving: "Answered in 4 sec", saveBump: 125 },
  { who: "Verachi",       where: "Verachi", icon: "verachi", delay: 1200,  text: "Sources: <code>Slack #eng-platform Mar 12</code> · <code>Jira ENG-1100</code> · <code>Meeting notes: Platform sync</code> — Confidence: 97%", saving: "Full citation trail", saveBump: 80 },
  { who: "Helena Park",   where: "Verachi", icon: "verachi", delay: 2200,  text: "The decision record already shows Marcus as the owner. No need to re-investigate.", saving: "40 min saved", saveBump: 83 },
  { who: "James Okafor",  where: "Verachi", icon: "verachi", delay: 3000,  text: "Verachi flagged the overlap before I started my PR — it surfaced Marcus's existing branch in my IDE.", saving: "6 hrs saved", saveBump: 426 },
  { who: "Anika Lindqvist", where: "Verachi", icon: "verachi", delay: 2500, text: "I can see the linked test plan directly from the decision record. No guessing which branch to test against.", saving: "2 hrs saved", saveBump: 186 },
  { who: "Priya Sharma",  where: "Jira",    icon: "verachi", delay: 3200,  text: "ENG-1142 was never created — Verachi's PR check would have caught the duplication before any work began.", saving: "$420 not wasted", saveBump: 420 },
  { who: "Tom Reeves",    where: "Slack",   icon: "verachi", delay: 4000,  text: "Product review is ready. One question got us the full context. No archaeology needed.", saving: "Half-day saved", saveBump: 540 },
];


/* ============================================================
   RENDER — Team roster
   ============================================================ */
const rosterEl = document.getElementById("teamRoster");
TEAM.forEach((m, i) => {
  const div = document.createElement("div");
  div.className = "team-member";
  div.dataset.index = i;
  div.innerHTML = `
    <div class="member-avatar" style="background:${m.color}22; border:1px solid ${m.color}44; color:${m.color}">${m.initials}</div>
    <div class="member-info">
      <span class="member-name">${m.name}</span>
      <span class="member-role">${m.role}</span>
    </div>
    <!-- salary badge omitted -->
  `;
  rosterEl.appendChild(div);

  setTimeout(() => div.classList.add("visible"), 200 + i * 120);
});


/* ============================================================
   FEED RENDERER — staggered item reveal
   ============================================================ */
function renderFeed(containerId, messages, options = {}) {
  const container = document.getElementById(containerId);
  let revealed = 0;
  let observer;

  function revealNext() {
    if (revealed >= messages.length) return;

    const msg = messages[revealed];
    const stageEl = document.getElementById(options.stageId);
    const composingEl = stageEl ? stageEl._composingEl : null;
    const statusEl = document.getElementById(options.statusId);

    function createAndShowItem() {
      const item = document.createElement("div");
      item.className = "activity-item" + (msg.cost ? " highlight-cost" : "");

      const iconClass = `icon-${msg.icon}`;
      const iconLabel = msg.icon === "slack" ? "S" : msg.icon === "jira" ? "J" : msg.icon === "github" ? "G" : "V";

      let costHtml = "";
      if (msg.cost) {
        costHtml = `<div class="activity-cost">↓ ${msg.cost}</div>`;
      }
      if (msg.saving) {
        costHtml = `<div class="activity-saving">↑ ${msg.saving}</div>`;
      }

      const member = TEAM.find(t => t.name === msg.who);
      const memberMeta = member
        ? `<span class="activity-meta"> · ${member.role}</span>`
        : "";

      item.innerHTML = `
        <div class="activity-icon ${iconClass}">${iconLabel}</div>
        <div class="activity-content">
          <div class="activity-header">
            <span class="activity-who">${msg.who}${memberMeta}</span>
            <span class="activity-where">${msg.where}</span>
          </div>
          <div class="activity-text">${msg.text}</div>
          ${costHtml}
        </div>
      `;

      container.appendChild(item);
      const previousLive = container.querySelector(".activity-item.live-current");
      if (previousLive) previousLive.classList.remove("live-current");
      item.classList.add("live-current");

      const progressEl = document.getElementById(options.progressId);
      if (stageEl) stageEl.classList.add("stage-live");
      if (statusEl) {
        statusEl.textContent = msg.saving
          ? `${msg.who} resolved context via ${msg.where}`
          : `${msg.who} updated ${msg.where}`;
      }
      if (progressEl) progressEl.style.width = `${((revealed + 1) / messages.length) * 100}%`;

      if (options.highlightTeam !== false) {
        const memberIdx = TEAM.findIndex(t => t.name === msg.who);
        if (memberIdx >= 0) {
          const memberEl = rosterEl.querySelector(`[data-index="${memberIdx}"]`);
          if (memberEl) {
            memberEl.classList.add("active");
            if (msg.saving) memberEl.classList.add("is-solving");
            setTimeout(() => {
              memberEl.classList.remove("active", "is-solving");
            }, 2000);
          }
        }
      }

      if (msg.costBump && msg.costBump > 0) {
        bumpCost(msg.costBump);
      }
      if (msg.saveBump && msg.saveBump > 0) {
        bumpSaved(msg.saveBump);
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => item.classList.add("show"));
      });

      revealed++;

      const parentBody = container.closest(".activity-body");
      if (parentBody) {
        parentBody.scrollTo({ top: parentBody.scrollHeight, behavior: "smooth" });
      }
    }

    // Show composing dots first if first item, then reveal
    if (composingEl && revealed > 0 && statusEl) {
      const originalStatus = statusEl.textContent;
      statusEl.textContent = 'composing...';
      composingEl.classList.add('active');
      setTimeout(() => {
        composingEl.classList.remove('active');
        statusEl.textContent = originalStatus;
        createAndShowItem();
      }, prefersReducedMotion.matches ? 100 : 450);
    } else {
      // First item appears immediately, or no composing el
      if (composingEl) composingEl.classList.remove('active');
      createAndShowItem();
    }
  }

  // Observe when the section enters view, then start the feed
  const section = container.closest(".step-section") || container.closest("section");
  if (section) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.disconnect();
          // Start staggered reveal with per-message variable delays
          let cumulative = prefersReducedMotion.matches ? 0 : (options.initialDelay || 800);
          for (let i = 0; i < messages.length; i++) {
            const msgDelay = prefersReducedMotion.matches ? 80 : (messages[i].delay || options.interval || 1200);
            setTimeout(revealNext, cumulative);
            cumulative += msgDelay;
          }
        }
      });
    }, { threshold: 0.2 });
    observer.observe(section);
  }
}


/* ============================================================
   COST COUNTER — event-driven, bumps on each message
   ============================================================ */
const counterEl = document.getElementById("headerCost");
const costValueEl = document.getElementById("costValue");
const costMeterFillEl = document.getElementById("costMeterFill");
const costLabelEl = document.getElementById("costLabel");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let counterStarted = false;
let displayedCost = 0;
let targetCost = 0;
let displayedSaved = 0;
let targetSaved = 0;
let savingsMode = false;
let animatingCost = false;

function formatCost(val) {
  if (val >= 1000) return "$" + (val / 1000).toFixed(1) + "K";
  return "$" + Math.floor(val).toLocaleString();
}

function updateCostMeter() {
  if (!costMeterFillEl) return;
  const current = savingsMode ? targetSaved : targetCost;
  const max = savingsMode ? 2000 : 2200;
  const pct = Math.max(0, Math.min((current / max) * 100, 100));
  costMeterFillEl.style.width = `${pct}%`;
}

// Smooth count-up animation
function animateCounter() {
  if (!animatingCost) return;

  if (savingsMode) {
    const diff = targetSaved - displayedSaved;
    if (Math.abs(diff) < 1) {
      displayedSaved = targetSaved;
      animatingCost = false;
    } else {
      displayedSaved += diff * 0.06;
    }
    costValueEl.textContent = formatCost(displayedSaved);
  } else {
    const diff = targetCost - displayedCost;
    if (Math.abs(diff) < 1) {
      displayedCost = targetCost;
      animatingCost = false;
    } else {
      displayedCost += diff * 0.06;
    }
    costValueEl.textContent = formatCost(displayedCost);
  }

  updateCostMeter();
  if (animatingCost) requestAnimationFrame(animateCounter);
}

function bumpCost(amount) {
  if (amount <= 0) return;
  targetCost += amount;
  // Trigger pulse
  counterEl.classList.remove("bump");
  void counterEl.offsetWidth; // force reflow
  counterEl.classList.add("bump");
  if (!animatingCost) {
    animatingCost = true;
    requestAnimationFrame(animateCounter);
  }
  updateCostMeter();
}

function bumpSaved(amount) {
  if (amount <= 0) return;
  targetSaved += amount;
  counterEl.classList.remove("bump");
  void counterEl.offsetWidth;
  counterEl.classList.add("bump");
  if (!animatingCost) {
    animatingCost = true;
    requestAnimationFrame(animateCounter);
  }
  updateCostMeter();
}

// Show/hide cost in header based on problem section visibility
const problemSection = document.getElementById("problemSection");
const problemVisObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const rect = entry.target.getBoundingClientRect();
    const isBelow = rect.top > window.innerHeight;

    if (entry.isIntersecting) {
      counterEl.classList.add("visible");
      if (!counterStarted) {
        counterStarted = true;
      }
    } else if (isBelow) {
      counterEl.classList.remove("visible");
    }
  });
}, { threshold: 0.05 });
problemVisObserver.observe(problemSection);

// Toggle savings mode when solution sentinel enters/exits view
const solveSentinel = document.getElementById("solveSectionSentinel");
const solveObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      savingsMode = true;
      counterEl.classList.add("is-saving");
      if (costLabelEl) costLabelEl.textContent = "Recovered";
      updateCostMeter();
    } else {
      const rect = entry.target.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.5) {
        savingsMode = false;
        counterEl.classList.remove("is-saving");
        if (costLabelEl) costLabelEl.textContent = "Context cost today";
        updateCostMeter();
      }
    }
  });
}, { threshold: 0.1 });
solveObserver.observe(solveSentinel);


/* ============================================================
   INIT FEEDS
   ============================================================ */
renderFeed("problemFeedList", UNIFIED_MSGS, {
  initialDelay: 900,
  stageId: "problemStage",
  statusId: "problemStatus",
  progressId: "problemProgress",
});


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
  { id: "heroSection",    dotId: "dot-hero",    cls: "" },
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
  const packets = [0, 1, 2, 3].map(i => document.getElementById(`cpacket-${i}`));
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
          animatePacket(packets[i], i);
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

  function animatePacket(packet, index) {
    const line = lines[index];
    const x1 = parseFloat(line.getAttribute("x1"));
    const y1 = parseFloat(line.getAttribute("y1"));
    const x2 = parseFloat(line.getAttribute("x2"));
    const y2 = parseFloat(line.getAttribute("y2"));

    function setPacketPosition(t) {
      const cx = x1 + (x2 - x1) * t;
      const cy = y1 + (y2 - y1) * t;
      packet.style.setProperty("--packet-x", `${(cx / 420) * 100}%`);
      packet.style.setProperty("--packet-y", `${(cy / 420) * 100}%`);
      packet.style.setProperty("--packet-opacity", t < 0.08 || t > 0.92 ? "0.22" : "0.88");
    }

    if (prefersReducedMotion.matches) {
      setPacketPosition(0.76);
      packet.style.setProperty("--packet-opacity", "0.88");
      packet.classList.add("active");
      return;
    }

    let progress = 0;
    let speed = 0.008 + Math.random() * 0.004;
    setPacketPosition(progress);
    packet.classList.add("active");
    function step(ts) {
      progress += speed;
      if (progress > 1) progress = 0;
      setPacketPosition(progress);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
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
   3D TILT — cards lean toward cursor
   ============================================================ */
(function init3DTilt() {
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
   PARALLAX — step numbers drift slower than content
   ============================================================ */
(function initParallax() {
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
   STEP DOT ANTICIPATION — dots glow before section arrives
   ============================================================ */
(function initDotAnticipation() {
  const progressSections = [
    { id: "heroSection",    dotId: "dot-hero" },
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
   FEED COMPOSING INDICATOR — typing dots before each item
   ============================================================ */
(function initComposingIndicator() {
  const stages = [
    { stageId: 'problemStage', chromeSelector: '.activity-chrome' },
  ];

  stages.forEach(({ stageId, chromeSelector }) => {
    const stage = document.getElementById(stageId);
    if (!stage) return;
    const chrome = stage.querySelector(chromeSelector);
    if (!chrome) return;
    const status = chrome.querySelector('.chrome-status');
    if (!status) return;

    const composing = document.createElement('span');
    composing.className = 'chrome-composing';
    composing.innerHTML = '<span class="chrome-composing-dot"></span><span class="chrome-composing-dot"></span><span class="chrome-composing-dot"></span>';
    status.insertAdjacentElement('afterend', composing);

    // Store reference on stage for feed renderer
    stage._composingEl = composing;
  });
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
