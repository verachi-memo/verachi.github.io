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
    if (!header || !menuToggle) {
      return;
    }

    const nextState = mobileNavQuery.matches ? open : false;

    header.dataset.menuOpen = String(nextState);
    menuToggle.setAttribute('aria-expanded', String(nextState));
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
    });
  });

  // ---- Hero Carousel ----
  const carousel = document.getElementById('heroCarousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.hero-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let autoTimer = null;
    let isPaused = false;

    const SLIDE_INTERVAL = 4500;

    const goToSlide = (index) => {
      slides.forEach((slide) => {
        slide.classList.remove('is-active');
      });
      dots.forEach((dot) => {
        dot.classList.remove('is-active');
        dot.setAttribute('aria-selected', 'false');
      });

      currentSlide = index;
      slides[currentSlide].classList.add('is-active');
      dots[currentSlide].classList.add('is-active');
      dots[currentSlide].setAttribute('aria-selected', 'true');
    };

    const nextSlide = () => {
      goToSlide((currentSlide + 1) % totalSlides);
    };

    const startAutoAdvance = () => {
      stopAutoAdvance();
      if (!reducedMotionQuery.matches && !isPaused) {
        autoTimer = setInterval(nextSlide, SLIDE_INTERVAL);
      }
    };

    const stopAutoAdvance = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    };

    // Dot clicks
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.dot, 10);
        if (index !== currentSlide) {
          goToSlide(index);
          startAutoAdvance();
        }
      });
    });

    // Pause on hover / focus
    carousel.addEventListener('mouseenter', () => {
      isPaused = true;
      stopAutoAdvance();
    });

    carousel.addEventListener('mouseleave', () => {
      isPaused = false;
      startAutoAdvance();
    });

    carousel.addEventListener('focusin', () => {
      isPaused = true;
      stopAutoAdvance();
    });

    carousel.addEventListener('focusout', () => {
      isPaused = false;
      startAutoAdvance();
    });

    // Reduced motion: show query slide (index 2) statically
    if (reducedMotionQuery.matches) {
      goToSlide(2);
    } else {
      goToSlide(0);
      startAutoAdvance();
    }

    // React to preference change at runtime
    const handleMotionChange = () => {
      if (reducedMotionQuery.matches) {
        stopAutoAdvance();
        goToSlide(2);
      } else {
        startAutoAdvance();
      }
    };

    if (typeof reducedMotionQuery.addEventListener === 'function') {
      reducedMotionQuery.addEventListener('change', handleMotionChange);
    } else {
      reducedMotionQuery.addListener(handleMotionChange);
    }
  }

  // ---- ROI Calculator ----
  const engineersSlider = document.getElementById('engineers');
  const rateSlider = document.getElementById('hourly-rate');
  const hoursSlider = document.getElementById('hours-lost');
  
  if (engineersSlider && rateSlider && hoursSlider) {
    const engineersVal = document.getElementById('engineers-val');
    const rateVal = document.getElementById('rate-val');
    const hoursVal = document.getElementById('hours-val');
    
    const engineersInput = document.getElementById('engineers-input');
    const rateInput = document.getElementById('hourly-rate-input');
    const hoursInput = document.getElementById('hours-lost-input');

    const moneySavedEl = document.getElementById('money-saved');
    const timeSavedEl = document.getElementById('time-saved');

    let engineers = parseInt(engineersSlider.value, 10);
    let rate = parseInt(rateSlider.value, 10);
    let hours = parseInt(hoursSlider.value, 10);

    const updateDisplay = () => {
      // Engineers
      const maxEngineers = parseInt(engineersSlider.max, 10);
      if (engineers >= maxEngineers && engineersInput.style.display !== 'block') {
        engineersVal.style.display = 'none';
        engineersInput.style.display = 'block';
        engineersInput.value = engineers;
      } else if (engineers < maxEngineers) {
        engineersVal.style.display = 'block';
        engineersInput.style.display = 'none';
        engineersVal.textContent = engineers;
      }

      // Rate
      const maxRate = parseInt(rateSlider.max, 10);
      if (rate >= maxRate && rateInput.style.display !== 'block') {
        rateVal.style.display = 'none';
        rateInput.style.display = 'block';
        rateInput.value = rate;
      } else if (rate < maxRate) {
        rateVal.style.display = 'block';
        rateInput.style.display = 'none';
        rateVal.textContent = `$${rate}`;
      }

      // Hours
      const maxHours = parseInt(hoursSlider.max, 10);
      if (hours >= maxHours && hoursInput.style.display !== 'block') {
        hoursVal.style.display = 'none';
        hoursInput.style.display = 'block';
        hoursInput.value = hours;
      } else if (hours < maxHours) {
        hoursVal.style.display = 'block';
        hoursInput.style.display = 'none';
        hoursVal.textContent = `${hours} hrs`;
      }

      // Calculate
      const totalHoursSaved = engineers * hours * 52;
      const totalMoneySaved = totalHoursSaved * rate;

      timeSavedEl.textContent = totalHoursSaved.toLocaleString();
      moneySavedEl.textContent = `$${totalMoneySaved.toLocaleString()}`;
    };

    const handleSliderInput = (e) => {
      if (e.target === engineersSlider) engineers = parseInt(engineersSlider.value, 10);
      if (e.target === rateSlider) rate = parseInt(rateSlider.value, 10);
      if (e.target === hoursSlider) hours = parseInt(hoursSlider.value, 10);
      updateDisplay();
    };

    const handleTextInput = (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val)) val = 0;

      if (e.target === engineersInput) engineers = val;
      if (e.target === rateInput) rate = val;
      if (e.target === hoursInput) hours = val;
      
      updateDisplay();
    };

    engineersSlider.addEventListener('input', handleSliderInput);
    rateSlider.addEventListener('input', handleSliderInput);
    hoursSlider.addEventListener('input', handleSliderInput);
    
    engineersInput.addEventListener('input', handleTextInput);
    rateInput.addEventListener('input', handleTextInput);
    hoursInput.addEventListener('input', handleTextInput);

    // Initial calculation
    updateDisplay();
  }
});
