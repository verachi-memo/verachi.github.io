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


})();
