/* =============================================================================
   Verachi — Landing interactions
   Vanilla JS, no dependencies. Progressive enhancement: everything degrades
   gracefully without JS, and motion respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";
  // Signals to the inline head failsafe that app.js loaded successfully.
  window.__verachiApp = true;

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------------------------- Header on scroll --------------------------- */
  var header = $("#siteHeader");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------ Theme toggle ----------------------------- */
  var themeToggle = $("#themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("verachi-theme", next); } catch (e) {}
    });
  }

  /* ------------------------- Analytics (consent-gated) ------------------------ */
  // GA only loads after explicit consent (or a saved accept). Honors Do Not Track.
  // No inline scripts are used, so the strict CSP still applies.
  var GA_ID = 'G-NHXTJ2NZMT';
  var CONSENT_KEY = 'verachi-consent';
  var dnt = (navigator.doNotTrack === '1' || window.doNotTrack === '1' ||
    navigator.msDoNotTrack === '1' || navigator.doNotTrack === 'yes');

  function loadAnalytics() {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  var consentBanner = $('#consentBanner');
  function setConsent(choice) {
    try { localStorage.setItem(CONSENT_KEY, choice); } catch (e) {}
    if (consentBanner) {
      consentBanner.hidden = true;
      consentBanner.setAttribute('aria-hidden', 'true');
      consentBanner.classList.remove('show');
    }
    if (choice === 'accepted') loadAnalytics();
  }

  if (consentBanner) {
    var storedConsent = null;
    try { storedConsent = localStorage.getItem(CONSENT_KEY); } catch (e) {}

    if (storedConsent === 'accepted') {
      loadAnalytics();
    } else if (storedConsent === 'declined' || dnt) {
      // No analytics, no banner.
    } else {
      // Reveal the banner shortly after load so it doesn't fight first paint.
      setTimeout(function () {
        consentBanner.hidden = false;
        consentBanner.setAttribute('aria-hidden', 'false');
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(function () { consentBanner.classList.add('show'); });
        } else {
          consentBanner.classList.add('show');
        }
      }, 600);
    }

    var acceptBtn = $('#consentAccept');
    var declineBtn = $('#consentDecline');
    if (acceptBtn) acceptBtn.addEventListener('click', function () { setConsent('accepted'); });
    if (declineBtn) declineBtn.addEventListener('click', function () { setConsent('declined'); });
  }

  /* ------------------------------ Mobile menu ------------------------------ */
  var menuToggle = $("#menuToggle");
  var mobileMenu = $("#mobileMenu");
  function setMenu(open) {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      setMenu(!mobileMenu.classList.contains("open"));
    });
    $all("a", mobileMenu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  /* ---------------------------- Scroll reveal & split headings ------------- */
  // Helper to split text nodes into words wrapped in .split-word spans for clipping masks
  function prepareSplitWords(el) {
    function process(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        var parent = node.parentNode;
        var text = node.textContent;
        var words = text.split(/(\s+)/);
        var fragment = document.createDocumentFragment();

        words.forEach(function (part) {
          if (!part) return;
          if (/\s+/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
          } else {
            var wSpan = document.createElement("span");
            wSpan.className = "split-word";
            var inner = document.createElement("span");
            inner.textContent = part;
            wSpan.appendChild(inner);
            fragment.appendChild(wSpan);
          }
        });
        parent.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === "SCRIPT" || node.tagName === "STYLE" || node.classList.contains("split-word")) return;
        var children = Array.prototype.slice.call(node.childNodes);
        children.forEach(process);
      }
    }

    var originalChildren = Array.prototype.slice.call(el.childNodes);
    originalChildren.forEach(process);
  }

  // Pre-split the text elements marked with data-split
  $all("[data-split]").forEach(function (el) {
    prepareSplitWords(el);
  });

  var animated = $all("[data-anim]");
  animated.forEach(function (el) {
    var d = el.getAttribute("data-d");
    if (d) el.style.setProperty("--d", d + "ms");
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    animated.forEach(function (el) {
      el.classList.add("in");
      $all(".split-word", el).forEach(function (word) {
        word.classList.add("in");
      });
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          // If the animated block (or its children) has split words, animate them
          var splitWords = $all(".split-word", entry.target);
          if (splitWords.length > 0) {
            splitWords.forEach(function (word, index) {
              setTimeout(function () {
                word.classList.add("in");
              }, index * 35); // stagger delay
            });
          }
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    animated.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------- Ask Verachi demo ---------------------------- */
  var chatAnswer = $("#chatAnswer");
  var chatCites = $("#chatCites");
  var chatDemo = $("#chatDemo");
  var ANSWER =
    "For pilot cohorts only. Fraud-review coverage for high-risk payment methods isn't complete, and the retry queue can delay confirmation — so the risk outweighs the rollout speed this sprint. Sarah Chen owns the rollout; the flag comes off once RISK-211 is mitigated.";

  function revealCites() {
    if (chatCites) chatCites.hidden = false;
  }

  function runChat() {
    if (!chatAnswer) return;
    if (reduceMotion) {
      chatAnswer.textContent = ANSWER;
      revealCites();
      return;
    }
    // Brief "thinking", then type out the answer.
    setTimeout(function () {
      chatAnswer.textContent = "";
      var caret = document.createElement("span");
      caret.className = "cursor";
      var textNode = document.createTextNode("");
      chatAnswer.appendChild(textNode);
      chatAnswer.appendChild(caret);
      var i = 0;
      (function type() {
        if (i <= ANSWER.length) {
          textNode.nodeValue = ANSWER.slice(0, i);
          i += 1;
          setTimeout(type, 16);
        } else {
          // Let the cursor blink for a short time (3s) before fading out
          setTimeout(function () {
            if (caret.parentNode) {
              caret.style.transition = "opacity 0.5s ease";
              caret.style.opacity = "0";
              setTimeout(function () {
                if (caret.parentNode) caret.parentNode.removeChild(caret);
              }, 500);
            }
          }, 3000);
          revealCites();
        }
      })();
    }, 850);
  }

  if (chatDemo && chatAnswer) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      runChat();
    } else {
      var chatIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runChat();
            chatIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      chatIO.observe(chatDemo);
    }
  }

  /* ----------------------------- Plan selection ---------------------------- */
  var planInput = $("#cf_plan");
  var planValue = $("#cfPlanValue");
  $all("[data-plan]").forEach(function (el) {
    el.addEventListener("click", function () {
      var plan = el.getAttribute("data-plan");
      if (planInput) planInput.value = plan + " inquiry";
      if (planValue) planValue.textContent = plan + " inquiry";
    });
  });

  /* ------------------------------ Contact form ----------------------------- */
  var form = $("#contactForm");
  var loadedAt = $("#cf_loaded_at");
  if (loadedAt) loadedAt.value = String(Date.now());
  var sourceUrl = $("#cf_source_url");
  if (sourceUrl) sourceUrl.value = window.location.href;

  if (form) {
    var submitBtn = $("#cfSubmit");
    var btnText = $(".cf-submit-text", form);
    var btnLoad = $(".cf-submit-loading", form);
    var errorEl = $("#cfError");
    var successEl = $("#cfSuccess");

    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.hidden = false;
    }
    function clearError() {
      if (errorEl) { errorEl.hidden = true; errorEl.textContent = ""; }
    }
    function setLoading(on) {
      if (submitBtn) submitBtn.disabled = on;
      if (btnText) btnText.hidden = on;
      if (btnLoad) btnLoad.hidden = !on;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearError();

      // Honeypot — bots fill hidden fields. Pretend success, do nothing.
      var hp = $("#cf_website");
      if (hp && hp.value) { return; }

      var name = $("#cf_name");
      var email = $("#cf_email");
      var company = $("#cf_company");
      var needs = $("#cf_needs");
      var requiredFields = [name, email, company, needs];

      var missingField = null;
      var hasMissingField = false;
      for (var i = 0; i < requiredFields.length; i += 1) {
        if (!requiredFields[i] || !requiredFields[i].value.trim()) {
          missingField = requiredFields[i];
          hasMissingField = true;
          break;
        }
      }
      if (hasMissingField) {
        showError("Please fill in your name, work email, company, and what you need help with.");
        if (missingField) missingField.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError("That email address doesn't look right — please double-check it.");
        email.focus();
        return;
      }

      setLoading(true);

      var body = new URLSearchParams();
      $all("input, textarea, select", form).forEach(function (field) {
        if (field.name) body.append(field.name, field.value);
      });

      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
        body: body.toString()
      })
        .then(function (res) {
          return res.text().then(function (text) {
            var payload = null;
            if (text) {
              try { payload = JSON.parse(text); } catch (err) {}
            }
            if (!res.ok) {
              var message = payload && payload.error && payload.error.message
                ? payload.error.message
                : "Request failed: " + res.status;
              var requestError = new Error(message);
              requestError.fromServer = true;
              throw requestError;
            }
            return payload;
          });
        })
        .then(function () {
          form.hidden = true;
          if (successEl) {
            successEl.hidden = false;
            successEl.focus();
          }
        })
        .catch(function (error) {
          setLoading(false);
          var fallback = "Something went wrong sending that. Please email hello@verachi.io and we'll follow up.";
          var message = error && error.fromServer && error.message && !/^Request failed:/.test(error.message)
            ? error.message
            : fallback;
          showError(message);
        });
    });
  }

  /* -------------------------- Scroll Progress fallback ---------------------- */
  var scrollProgress = $("#scroll-progress");
  if (scrollProgress && !CSS.supports("animation-timeline", "scroll()")) {
    var tick = false;
    window.addEventListener("scroll", function () {
      if (!tick) {
        window.requestAnimationFrame(function () {
          var scrollable = document.documentElement.scrollHeight - window.innerHeight;
          var scrolled = window.scrollY;
          var progressPercentage = scrollable > 0 ? (scrolled / scrollable) : 0;
          scrollProgress.style.transform = "scaleX(" + progressPercentage + ")";
          tick = false;
        });
        tick = true;
      }
    }, { passive: true });
  }

  /* --------------------------- 3D Card Hover Tilt --------------------------- */
  if (window.innerWidth > 768 && !reduceMotion) {
    $all("[data-tilt]").forEach(function (el) {
      var max = 5; // max degrees of tilt
      var handleMove = function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(1000px) rotateY(" + (px * max) + "deg) rotateX(" + (-py * max) + "deg) scale3d(1.02, 1.02, 1.02) translateY(-2px)";
        el.style.boxShadow = "var(--shadow-float)";
      };
      var handleLeave = function () {
        el.style.transform = "";
        el.style.boxShadow = "";
      };
      el.addEventListener("mousemove", handleMove, { passive: true });
      el.addEventListener("mouseleave", handleLeave, { passive: true });
    });
  }

  /* --------------------------- Magnetic Buttons ----------------------------- */
  if (window.innerWidth > 768 && !reduceMotion) {
    $all("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.getAttribute("data-magnetic-strength")) || 0.3;
      var handleMove = function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * strength;
        var y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
      };
      var handleLeave = function () {
        el.style.transform = "";
      };
      el.addEventListener("mousemove", handleMove, { passive: true });
      el.addEventListener("mouseleave", handleLeave, { passive: true });
    });
  }

  /* --------------------------- Interactive Canvas Graph --------------------- */
  (function initCanvas() {
    var canvas = $("#heroCanvas");
    var container = $(".hero-media");
    var card = $(".record-card", container);
    if (!canvas || !container || !card || reduceMotion) return;

    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var width = 0, height = 0;
    var mouse = { x: null, y: null, active: false };

    // Node particles configuration
    var particles = [];
    var particleTypes = ['slack', 'jira', 'github'];
    var colors = {
      slack: { border: '', fill: '' },
      jira: { border: '', fill: '' },
      github: { border: '', fill: '' },
      line: ''
    };

    function updateThemeColors() {
      var rootStyle = getComputedStyle(document.documentElement);
      colors.slack.border = rootStyle.getPropertyValue('--slack').trim() || '#611f69';
      colors.slack.fill = rootStyle.getPropertyValue('--slack-wash').trim() || '#efe4f0';
      colors.jira.border = rootStyle.getPropertyValue('--jira').trim() || '#0c5fd4';
      colors.jira.fill = rootStyle.getPropertyValue('--jira-wash').trim() || '#e1ebf8';
      colors.github.border = rootStyle.getPropertyValue('--github').trim() || '#1f2328';
      colors.github.fill = rootStyle.getPropertyValue('--github-wash').trim() || '#e6e4e2';
      colors.line = rootStyle.getPropertyValue('--line-strong').trim() || '#b3a48d';
    }

    updateThemeColors();

    var themeToggle = $("#themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        setTimeout(updateThemeColors, 50);
      });
    }

    function resize() {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.scale(dpr, dpr);
      
      initParticles();
    }

    function initParticles() {
      particles = [];
      var numParticles = 6;
      
      var cardLeft = card.offsetLeft;
      var cardTop = card.offsetTop;
      var cardW = card.offsetWidth;
      var cardH = card.offsetHeight;

      // Define floating zones around the card
      var zones = [
        { minX: 10, maxX: cardLeft - 20, minY: 20, maxY: height - 20 },
        { minX: cardLeft + cardW + 20, maxX: width - 10, minY: 20, maxY: height - 20 },
        { minX: 20, maxX: width - 20, minY: 10, maxY: cardTop - 20 },
        { minX: 20, maxX: width - 20, minY: cardTop + cardH + 20, maxY: height - 10 }
      ];

      for (var i = 0; i < numParticles; i++) {
        var zone = zones[i % zones.length];
        if (zone.maxX <= zone.minX) {
          zone = { minX: 0, maxX: width, minY: 0, maxY: height };
        }
        var px = zone.minX + Math.random() * (zone.maxX - zone.minX);
        var py = zone.minY + Math.random() * (zone.maxY - zone.minY);

        var type = particleTypes[i % particleTypes.length];
        var label = type.charAt(0).toUpperCase();

        particles.push({
          x: px,
          y: py,
          baseX: px,
          baseY: py,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 12 + Math.random() * 4,
          type: type,
          label: label,
          angle: Math.random() * Math.PI * 2,
          speed: 0.003 + Math.random() * 0.003,
          orbitRadius: 8 + Math.random() * 12,
          photonProgress: Math.random()
        });
      }
    }

    container.addEventListener("mousemove", function (e) {
      var rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }, { passive: true });

    container.addEventListener("mouseleave", function () {
      mouse.x = null;
      mouse.y = null;
      mouse.active = false;
    }, { passive: true });

    var citations = $all(".reveal-cite", card);

    function draw() {
      ctx.clearRect(0, 0, width, height);

      var cardLeft = card.offsetLeft;
      var cardTop = card.offsetTop;
      var cardW = card.offsetWidth;
      var cardH = card.offsetHeight;
      var cardRight = cardLeft + cardW;
      var cardBottom = cardTop + cardH;

      var targetPoints = [];
      if (citations.length > 0) {
        var containerRect = container.getBoundingClientRect();
        citations.forEach(function (el, index) {
          var elRect = el.getBoundingClientRect();
          targetPoints.push({
            x: elRect.left - containerRect.left + 8,
            y: elRect.top - containerRect.top + elRect.height / 2,
            type: index === 0 ? 'slack' : (index === 1 ? 'jira' : 'github')
          });
        });
      }

      particles.forEach(function (p) {
        p.angle += p.speed;
        var targetX = p.baseX + Math.cos(p.angle) * p.orbitRadius;
        var targetY = p.baseY + Math.sin(p.angle) * p.orbitRadius;

        if (mouse.active) {
          var dx = mouse.x - p.x;
          var dy = mouse.y - p.y;
          var dist = Math.hypot(dx, dy);
          var pullRadius = 150;
          if (dist < pullRadius) {
            var force = (pullRadius - dist) / pullRadius;
            targetX += (mouse.x - p.x) * force * 0.4;
            targetY += (mouse.y - p.y) * force * 0.4;
          }
        }

        p.x += (targetX - p.x) * 0.05;
        p.y += (targetY - p.y) * 0.05;

        var buffer = p.radius + 8;
        if (p.x > cardLeft - buffer && p.x < cardRight + buffer &&
            p.y > cardTop - buffer && p.y < cardBottom + buffer) {
          var distToLeft = Math.abs(p.x - cardLeft);
          var distToRight = Math.abs(p.x - cardRight);
          var distToTop = Math.abs(p.y - cardTop);
          var distToBottom = Math.abs(p.y - cardBottom);
          var minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

          if (minDist === distToLeft) p.x = cardLeft - buffer;
          else if (minDist === distToRight) p.x = cardRight + buffer;
          else if (minDist === distToTop) p.y = cardTop - buffer;
          else p.y = cardBottom + buffer;
        }

        if (p.x < buffer) p.x = buffer;
        if (p.x > width - buffer) p.x = width - buffer;
        if (p.y < buffer) p.y = buffer;
        if (p.y > height - buffer) p.y = height - buffer;

        var target = targetPoints.find(function (t) { return t.type === p.type; });
        if (target) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = colors.line;
          ctx.lineWidth = 0.75;
          ctx.setLineDash([3, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          p.photonProgress += 0.005;
          if (p.photonProgress > 1) p.photonProgress = 0;
          
          var photonX = p.x + (target.x - p.x) * p.photonProgress;
          var photonY = p.y + (target.y - p.y) * p.photonProgress;
          ctx.beginPath();
          ctx.arc(photonX, photonY, 2, 0, Math.PI * 2);
          ctx.fillStyle = colors[p.type].border;
          ctx.fill();
        }

        var c = colors[p.type];
        
        ctx.shadowColor = 'rgba(27, 25, 21, 0.06)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = c.fill;
        ctx.strokeStyle = c.border;
        ctx.lineWidth = 1.2;
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = c.border;
        var rootStyle = getComputedStyle(document.documentElement);
        ctx.font = "bold 10px " + rootStyle.getPropertyValue('--font-mono');
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.label, p.x, p.y + 0.5);
      });

      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    requestAnimationFrame(draw);
  })();
})();
