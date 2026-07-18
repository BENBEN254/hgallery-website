/**
 * HGALLERY LTD - Utilities
 * Refactored by Senior Dev for Clean Animation Mounting Loops
 */

export class Utils {
  constructor() {
    this.init();
  }

  init() {
    this.initBackToTop();
    this.initSmoothScroll();
    this.initLazyLoading();
    this.initCounterAnimation();
    this.initFadeAnimations();
  }

  initBackToTop() {
    const button = document.querySelector(".back-to-top");
    if (!button) return;

    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset || document.documentElement.scrollTop;
      button.classList.toggle("visible", scrolled > 400);
    });

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.querySelector(link.getAttribute("href"));
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

  initLazyLoading() {
    if ("IntersectionObserver" in window) {
      const images = document.querySelectorAll("img[data-src]");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: "50px" },
      );
      images.forEach((img) => observer.observe(img));
    }
  }

  initCounterAnimation() {
    const counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.dataset.target);
            const duration = 2000;
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
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
            observer.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  initFadeAnimations() {
    const elements = document.querySelectorAll(
      ".fade-up, .fade-left, .fade-right, .zoom, .rotate",
    );
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    elements.forEach((el) => observer.observe(el));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.GlobalUtilsInstance = new Utils();
});
