/**
 * Slideshow Manager for SPA
 * Accessible globally via window.SlideshowManager
 */
window.SlideshowManager = {
  interval: null,
  currentSlide: 0,
  config: {
    intervalTime: 5000,
  },

  /**
   * Start the Slideshow logic.
   * Call this AFTER injecting HTML into the DOM.
   */
  init: function () {
    console.log('Slideshow Initializing...');

    // 1. Add class to body to hide other elements (Fullscreen mode)
    document.body.classList.add('slideshow-active');

    // 2. Select Elements
    this.slides = document.querySelectorAll('.slideshow .slide');
    this.prevBtn = document.querySelector('.prev-arrow button');
    this.nextBtn = document.querySelector('.next-arrow button');

    if (this.slides.length === 0) {
      console.warn('SlideshowManager: No slides found. Did you inject the HTML first?');
      return;
    }

    // 3. Initialize First Slide
    // Check if one is already active, otherwise activate the first one
    const activeIndex = Array.from(this.slides).findIndex((s) => s.classList.contains('active'));
    this.currentSlide = activeIndex > -1 ? activeIndex : 0;
    this.slides[this.currentSlide].classList.add('active');

    // 4. Attach Event Listeners
    // We bind 'this' so the functions can access the Manager properties
    if (this.prevBtn)
      this.prevBtn.onclick = () => {
        this.prev();
        this.resetTimer();
      };
    if (this.nextBtn)
      this.nextBtn.onclick = () => {
        this.next();
        this.resetTimer();
      };

    // 5. Start Auto-Play
    this.startTimer();
  },

  /**
   * Stop the slideshow and clean up.
   * Call this when navigating AWAY from the slideshow page.
   */
  destroy: function () {
    console.log('Slideshow Destroying...');

    // Stop Timer
    this.stopTimer();

    // Remove Body Class (Restore normal site UI)
    document.body.classList.remove('slideshow-active');

    // Clean up references
    this.slides = [];
    if (this.prevBtn) this.prevBtn.onclick = null;
    if (this.nextBtn) this.nextBtn.onclick = null;
  },

  // --- Internal Logic ---

  goTo: function (index) {
    if (!this.slides || this.slides.length === 0) return;

    // Hide current
    this.slides[this.currentSlide].classList.remove('active');

    // Calculate new index
    this.currentSlide = (index + this.slides.length) % this.slides.length;

    // Show new
    this.slides[this.currentSlide].classList.add('active');
  },

  next: function () {
    this.goTo(this.currentSlide + 1);
  },
  prev: function () {
    this.goTo(this.currentSlide - 1);
  },

  startTimer: function () {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.next(), this.config.intervalTime);
  },

  stopTimer: function () {
    if (this.interval) clearInterval(this.interval);
  },

  resetTimer: function () {
    this.stopTimer();
    this.startTimer();
  },
};
