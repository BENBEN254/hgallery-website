/**
 * Navigation Module
 * Handles mobile menu, dropdowns, and active states
 */

export class Navigation {
  constructor() {
    this.menuToggle = document.querySelector(".menu-toggle");
    this.navLinks = document.querySelector(".nav-links");
    this.dropdowns = document.querySelectorAll(".dropdown");
    this.currentPath = window.location.pathname;

    this.init();
  }

  init() {
    this.initMobileMenu();
    this.initDropdowns();
    this.setActiveLink();
    this.initStickyHeader();
  }

  initMobileMenu() {
    if (!this.menuToggle || !this.navLinks) return;

    this.menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Close menu on link click
    this.navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        this.closeMenu();
      });
    });

    // Close menu on outside click
    document.addEventListener("click", (e) => {
      if (
        this.navLinks.classList.contains("open") &&
        !e.target.closest(".navbar")
      ) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    this.navLinks.classList.toggle("open");
    this.menuToggle.classList.toggle("active");
    this.menuToggle.setAttribute(
      "aria-expanded",
      this.navLinks.classList.contains("open"),
    );
    document.body.style.overflow = this.navLinks.classList.contains("open")
      ? "hidden"
      : "";
  }

  closeMenu() {
    this.navLinks.classList.remove("open");
    this.menuToggle.classList.remove("active");
    this.menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  initDropdowns() {
    this.dropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector("a");
      const menu = dropdown.querySelector(".dropdown-menu");

      if (!trigger || !menu) return;

      // Handle touch devices
      trigger.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          menu.classList.toggle("open");
        }
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
          menu.classList.remove("open");
        }
      });
    });
  }

  setActiveLink() {
    const links = document.querySelectorAll(".nav-links a");
    const current = this.currentPath.split("/").pop() || "index.html";

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === current) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  initStickyHeader() {
    const header = document.querySelector(".header");
    let lastScroll = 0;

    window.addEventListener(
      "scroll",
      () => {
        const currentScroll =
          window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll > lastScroll && currentScroll > 100) {
          header.classList.add("scrolled-down");
          header.classList.remove("scrolled-up");
        } else if (currentScroll < lastScroll && currentScroll > 100) {
          header.classList.add("scrolled-up");
          header.classList.remove("scrolled-down");
        } else {
          header.classList.remove("scrolled-down", "scrolled-up");
        }

        lastScroll = currentScroll;
      },
      { passive: true },
    );
  }
}
