/**
 * Animation Engine Module
 * Unified high-performance lifecycle tracking for layouts, images, and telemetry tickers.
 */

export class AnimationEngine {
  constructor() {
    this.observer = null;
    this.counterDuration = 2000;
  }

  /**
   * Initializes a centralized observer channel to reduce execution threads
   */
  initUnifiedObserver() {
    if (!("IntersectionObserver" in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;

          // 1. Process Lazy-Loading Images Stream
          if (el.tagName === "IMG" && el.dataset.src) {
            el.src = el.dataset.src;
            el.removeAttribute("data-src");
            this.observer.unobserve(el);
            return;
          }

          // 2. Process Statistics Telemetry Counters
          if (el.classList.contains("counter")) {
            this.animateCounter(el);
            this.observer.unobserve(el);
            return;
          }

          // 3. Process Structural Fade Animations
          el.classList.add("animated");
          this.observer.unobserve(el);
        });
      },
      { rootMargin: "50px", threshold: 0.15 },
    );

    this.mountElementsToObserver();
  }

  mountElementsToObserver() {
    const targets = document.querySelectorAll(
      "img[data-src], .counter, .fade-up, .fade-left, .fade-right, .zoom, .rotate",
    );
    targets.forEach((target) => this.observer.observe(target));
  }

  /**
   * Smooth hardware-accelerated numeric counter animation pipeline
   */
  animateCounter(counter) {
    const target = parseInt(counter.dataset.target, 10) || 0;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.counterDuration, 1);

      // Cubic easing-out implementation optimization
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      counter.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(updateCounter);
  }
}
