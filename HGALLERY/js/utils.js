/**
 * UI Utilities Controller Module
 * Handles scroll optimization configurations, link behaviors, and layout routing.
 */
import { AnimationEngine } from "./AnimationEngine.js";

export class Utils {
  constructor() {
    this.engine = new AnimationEngine();
    this.dom = {};
    this.init();
  }

  init() {
    this.cacheDOM();
    this.initBackToTop();
    this.initSmoothScroll();

    // Immediately spawn the unified layout animation observer pipeline
    this.engine.initUnifiedObserver();
  }

  cacheDOM() {
    this.dom.backToTopBtn = document.querySelector(".back-to-top");
    this.dom.internalLinks = document.querySelectorAll('a[href^="#"]');
  }

  initBackToTop() {
    const button = this.dom.backToTopBtn;
    if (!button) return;

    let ticking = false;

    // Optimization: Injecting passive event parameters eliminates scrolling layout delay
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrolled =
              window.pageYOffset || document.documentElement.scrollTop;
            button.classList.toggle("visible", scrolled > 400);
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  initSmoothScroll() {
    this.dom.internalLinks?.forEach((link) => {
      link.addEventListener("click", (e) => {
        const selector = link.getAttribute("href");
        if (selector === "#") return;

        const target = document.querySelector(selector);
        if (target) {
          e.preventDefault();
          const headerOffset = 88;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.GlobalUtilsInstance = new Utils();
});
