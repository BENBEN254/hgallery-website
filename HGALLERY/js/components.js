/**
 * HGALLERY LTD - Complete Layout Configuration Matrix Setup
 * Connects layout structures, menu interactions, and toggles states.
 */

export class ComponentLoader {
  constructor() {
    this.headerHTML = "";
    this.footerHTML = "";
    this.dom = {};
    this.init();
  }

  async init() {
    await Promise.all([this.loadHeader(), this.loadFooter()]);
    this.renderComponents();
    this.cacheDOM();
    this.initHeaderScripts();
  }

  async loadHeader() {
    try {
      const response = await fetch("/components/header.html");
      this.headerHTML = response.ok ? await response.text() : "";
    } catch {
      console.error("Failed to stream custom backend template components.");
    }
  }

  async loadFooter() {
    try {
      const response = await fetch("/components/footer.html");
      this.footerHTML = response.ok ? await response.text() : "";
    } catch {
      console.error("Failed to stream custom backend template items.");
    }
  }

  renderComponents() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    if (headerPlaceholder) headerPlaceholder.innerHTML = this.headerHTML;

    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (footerPlaceholder) footerPlaceholder.innerHTML = this.footerHTML;

    this.setActiveNav();
  }

  cacheDOM() {
    this.dom.menuToggle = document.querySelector(".menu-toggle");
    this.dom.mobileOverlay = document.getElementById("mobileNavOverlay");
    this.dom.mobileClose = document.querySelector(".mobile-nav-close");
    this.dom.badges = document.querySelectorAll(".count");
  }

  setActiveNav() {
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".nav-menu a, .mobile-nav-menu a");

    links.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      }
    });
  }

  initHeaderScripts() {
    const { menuToggle, mobileOverlay, mobileClose } = this.dom;

    if (menuToggle && mobileOverlay) {
      menuToggle.addEventListener("click", () => {
        mobileOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    }

    const closeOverlayRoutine = () => {
      if (mobileOverlay) {
        mobileOverlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    };

    mobileClose?.addEventListener("click", closeOverlayRoutine);
    mobileOverlay?.addEventListener("click", (e) => {
      if (e.target === mobileOverlay) closeOverlayRoutine();
    });

    this.updateCartBadge();
  }

  updateCartBadge() {
    try {
      const cartData = localStorage.getItem("hgallery_cart");
      const cart = cartData ? JSON.parse(cartData) : { count: 0 };
      this.dom.badges?.forEach((badge) => {
        badge.textContent = cart.count || 0;
        badge.style.display = cart.count > 0 ? "flex" : "none";
      });
    } catch (error) {
      console.error(
        "Error setting dynamic layout badges metric counters:",
        error,
      );
    }
  }
}
