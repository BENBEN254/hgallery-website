/**
 * HGALLERY LTD - Unified High-Performance Layout & Navigation Engine
 * Final synchronized patch restoring the missing product navigation links.
 */

export class ComponentLoader {
  constructor() {
    this.headerHTML = "";
    this.footerHTML = "";
    this.dom = {};
    this.lastScroll = 0;
    this.init();
  }

  async init() {
    // Fire off both content fetch streams concurrently at the exact same millisecond
    await Promise.all([this.loadHeader(), this.loadFooter()]);

    this.renderComponents();
    this.cacheDOM();
    this.initHeaderScripts();
    this.initStickyHeader();
    this.injectAdminControls();
  }

  async loadHeader() {
    try {
      const response = await fetch("/components/header.html");
      this.headerHTML = response.ok
        ? await response.text()
        : this.getFallbackHeader();
    } catch {
      this.headerHTML = this.getFallbackHeader();
    }
  }

  async loadFooter() {
    try {
      const response = await fetch("/components/footer.html");
      this.footerHTML = response.ok
        ? await response.text()
        : this.getFallbackFooter();
    } catch {
      this.footerHTML = this.getFallbackFooter();
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
    this.dom.header = document.querySelector(".main-header, .header");
    this.dom.menuToggle = document.querySelector(".menu-toggle");
    this.dom.mobileOverlay = document.getElementById("mobileNavOverlay");
    this.dom.mobileClose = document.querySelector(".mobile-nav-close");
    this.dom.searchButtons = document.querySelectorAll(
      ".search-btn, .nav-icon[aria-label='Search']",
    );
    this.dom.mobileDropdownToggles = document.querySelectorAll(
      ".mobile-dropdown-toggle",
    );
  }

  setActiveNav() {
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".nav-menu a, .mobile-nav-menu a");

    links.forEach((link) => {
      link.classList.remove("active");
      const linkHref = link.getAttribute("href");
      if (
        linkHref === currentPath ||
        (currentPath === "" && linkHref === "index.html")
      ) {
        link.classList.add("active");

        const parentDropdown = link.closest(".dropdown, .mobile-dropdown");
        parentDropdown?.querySelector("a")?.classList.add("active");
      }
    });
  }

  initHeaderScripts() {
    const {
      menuToggle,
      mobileOverlay,
      mobileClose,
      searchButtons,
      mobileDropdownToggles,
    } = this.dom;

    if (menuToggle && mobileOverlay) {
      menuToggle.addEventListener("click", () => {
        mobileOverlay.classList.add("active");
        mobileOverlay.setAttribute("aria-hidden", "false");
        menuToggle.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
      });
    }

    const closeOverlayRoutine = () => {
      if (mobileOverlay) {
        mobileOverlay.classList.remove("active");
        mobileOverlay.setAttribute("aria-hidden", "true");
        menuToggle?.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    };

    mobileClose?.addEventListener("click", closeOverlayRoutine);

    mobileOverlay?.addEventListener("click", (e) => {
      if (e.target === mobileOverlay) closeOverlayRoutine();
    });

    mobileDropdownToggles?.forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const parentLi = toggle.closest(".mobile-dropdown");
        parentLi?.classList.toggle("open");
      });
    });

    searchButtons?.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "search.html";
      });
    });
  }

  initStickyHeader() {
    const targetHeader = this.dom.header;
    if (!targetHeader) return;

    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const currentScroll =
              window.pageYOffset || document.documentElement.scrollTop;

            if (currentScroll > this.lastScroll && currentScroll > 100) {
              targetHeader.classList.add("scrolled-down");
              targetHeader.classList.remove("scrolled-up");
            } else if (currentScroll < this.lastScroll && currentScroll > 100) {
              targetHeader.classList.add("scrolled-up");
              targetHeader.classList.remove("scrolled-down");
            } else {
              targetHeader.classList.remove("scrolled-down", "scrolled-up");
            }

            this.lastScroll = currentScroll;
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  injectAdminControls() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const splitToken = token.split(".");
      if (splitToken.length < 2) return;

      const base64Url = splitToken[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      if (
        payload &&
        (payload.role === "admin" || payload.role === "super-admin")
      ) {
        const navMenu = document.querySelector(".nav-menu");
        const mobileNavMenu = document.querySelector(".mobile-nav-menu");

        if (navMenu && !document.querySelector(".admin-nav-item")) {
          const adminLi = document.createElement("li");
          adminLi.className = "admin-nav-item";
          adminLi.setAttribute("role", "none");
          adminLi.innerHTML = `<a href="product-upload.html" role="menuitem" style="color: var(--primary); font-weight:700;"><i class="fa-solid fa-screwdriver-wrench"></i> Admin</a>`;
          navMenu.appendChild(adminLi);
        }

        if (
          mobileNavMenu &&
          !document.querySelector(".mobile-admin-nav-item")
        ) {
          const mobileAdminLi = document.createElement("li");
          mobileAdminLi.className = "mobile-admin-nav-item";
          mobileAdminLi.innerHTML = `<a href="product-upload.html" style="color: var(--primary); font-weight:700;"><i class="fa-solid fa-screwdriver-wrench"></i> Admin Panel</a>`;
          mobileNavMenu.appendChild(mobileAdminLi);
        }
      }
    } catch (err) {
      console.error("Session authentication token parsing failure:", err);
    }
  }

  getFallbackHeader() {
    return `
      <div class="top-bar" role="banner" aria-label="Top bar">
        <div class="container top-bar-content">
          <div class="top-left">
            <span class="top-bar-item"><i class="fas fa-map-marker-alt"></i> <span>Our Mall, Magadi Road, Nairobi</span></span>
            <span class="top-bar-item"><i class="fas fa-phone"></i> <a href="tel:+254726335283">+254 726 335 283</a></span>
            <span class="top-bar-item"><i class="fas fa-envelope"></i> <a href="mailto:hgalleryltd@gmail.com">hgalleryltd@gmail.com</a></span>
          </div>
          <div class="top-right">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
            <a href="#" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>
      </div>
      <header class="main-header" role="banner" aria-label="Main header">
        <div class="container navbar">
          <a href="index.html" class="logo"><img src="assets/logos/logo.jpg" alt="HGALLERY LTD" width="180" height="60"></a>
          <nav class="main-nav" role="navigation">
            <ul class="nav-menu" role="menubar">
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About</a></li>
              <li class="dropdown">
                <a href="products.html">Products <i class="fas fa-chevron-down"></i></a>
                <ul class="dropdown-menu">
                  <li><a href="products.html?category=glass">Glass</a></li>
                  <li><a href="products.html?category=aluminium">Aluminium</a></li>
                  <li><a href="products.html?category=shower">Shower Cubicles</a></li>
                  <li><a href="products.html?category=wall">Wall Panels</a></li>
                  <li><a href="products.html?category=decor">Home Decor</a></li>
                </ul>
              </li>
              <li><a href="services.html">Services</a></li>
              <li><a href="projects.html">Projects</a></li>
              <li><a href="gallery.html">Gallery</a></li>
              <li><a href="shop.html">Shop</a></li>
              <li><a href="blog.html">Blog</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </nav>
          <div class="nav-actions">
            <button class="search-btn" aria-label="Search products"><i class="fas fa-search"></i></button>
            <a href="quote.html" class="btn btn-primary btn-sm"><i class="fas fa-paper-plane"></i> Request Quote</a>
            <button class="menu-toggle" aria-label="Toggle navigation menu"><span class="hamburger-line"></span><span class="hamburger-line"></span><span class="hamburger-line"></span></button>
          </div>
        </div>
      </header>
    `;
  }

  getFallbackFooter() {
    return `<footer><div class="container" style="text-align:center; padding:20px 0;"><p>&copy; 2026 HGALLERY LTD. All Rights Reserved.</p></div></footer>`;
  }
}
