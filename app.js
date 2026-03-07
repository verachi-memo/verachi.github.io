document.addEventListener("DOMContentLoaded", () => {
  // Simple Reveal Animation Observer
  const revealElements = document.querySelectorAll('.reveal-up');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Once revealed, unobserve to keep it visible
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ROI Calculator Logic
  const engineersSlider = document.getElementById('engineers');
  const rateSlider = document.getElementById('hourly-rate');
  const hoursSlider = document.getElementById('hours-lost');
  
  if (engineersSlider && rateSlider && hoursSlider) {
    const engineersVal = document.getElementById('engineers-val');
    const rateVal = document.getElementById('rate-val');
    const hoursVal = document.getElementById('hours-val');
    const moneySavedEl = document.getElementById('money-saved');
    const timeSavedEl = document.getElementById('time-saved');

    const updateROI = () => {
      const engineers = parseInt(engineersSlider.value, 10);
      const rate = parseInt(rateSlider.value, 10);
      const hours = parseInt(hoursSlider.value, 10);

      engineersVal.textContent = engineers;
      rateVal.textContent = `$${rate}`;
      hoursVal.textContent = `${hours} hrs`;

      // Assuming 52 weeks in a year
      const totalHoursSaved = engineers * hours * 52;
      const totalMoneySaved = totalHoursSaved * rate;

      timeSavedEl.textContent = totalHoursSaved.toLocaleString();
      moneySavedEl.textContent = `$${totalMoneySaved.toLocaleString()}`;
    };

    engineersSlider.addEventListener('input', updateROI);
    rateSlider.addEventListener('input', updateROI);
    hoursSlider.addEventListener('input', updateROI);

    // Initial calculation
    updateROI();
  }
});