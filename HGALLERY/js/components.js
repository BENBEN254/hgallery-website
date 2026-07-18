/**
 * HGALLERY LTD - Component Loader
 * Refactored by Senior Dev for Dynamic Authentication State Injection
 */

export class ComponentLoader {
  constructor() {
    this.headerHTML = "";
    this.footerHTML = "";
    this.init();
  }

  async init() {
    await this.loadComponents();
    this.renderComponents();
    this.initHeaderScripts();
    this.injectAdminControls(); // Dynamic verification loop
  }

  async loadComponents() {
    try {
      const headerResponse = await fetch("/components/header.html");
      this.headerHTML = headerResponse.ok
        ? await headerResponse.text()
        : this.getFallbackHeader();

      const footerResponse = await fetch("/components/footer.html");
      this.footerHTML = footerResponse.ok
        ? await footerResponse.text()
        : this.getFallbackFooter();
    } catch (error) {
      console.error(
        "Error loading components, using fallback configurations:",
        error,
      );
      this.headerHTML = this.getFallbackHeader();
      this.footerHTML = this.getFallbackFooter();
    }
  }

  renderComponents() {
    const headerPlaceholder = document.querySelector("#header-placeholder");
    if (headerPlaceholder) headerPlaceholder.innerHTML = this.headerHTML;

    const footerPlaceholder = document.querySelector("#footer-placeholder");
    if (footerPlaceholder) footerPlaceholder.innerHTML = this.footerHTML;

    this.setActiveNav();
  }

  setActiveNav() {
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".nav-menu a");
    links.forEach((link) => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      }
    });
  }

  initHeaderScripts() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle && navMenu) {
      menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        const icon = menuToggle.querySelector("i");
        if (icon) {
          icon.className = navMenu.classList.contains("active")
            ? "fas fa-times"
            : "fas fa-bars";
        }
      });
    }

    this.updateCartBadge();

    const searchToggle = document.querySelector(
      '.nav-icon[aria-label="Search"]',
    );
    if (searchToggle) {
      searchToggle.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "search.html";
      });
    }
  }

  // ==========================================================
  // DYNAMIC ADMINISTRATIVE NAVIGATION STATE STATE ENGINE
  // ==========================================================
  injectAdminControls() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // User is an anonymous public visitor, skip injection

      // Decode payload claims safely to verify the user role profile parameter
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      if (
        payload &&
        (payload.role === "admin" || payload.role === "super-admin")
      ) {
        const navMenu = document.querySelector(".nav-menu");
        const navActions = document.querySelector(".nav-actions");

        // 1. Inject Dashboard route link into the mobile dropdown drawer
        if (navMenu && !document.querySelector(".admin-nav-item")) {
          const adminLi = document.createElement("li");
          adminLi.className = "admin-nav-item";
          adminLi.innerHTML = `<a href="product-upload.html" style="color: var(--primary); font-weight:700;"><i class="fa-solid fa-screwdriver-wrench"></i> Admin Panel</a>`;
          navMenu.appendChild(adminLi);
        }

        // 2. Inject visual panel launcher shortcut into layout icon headers
        if (navActions && !document.querySelector(".admin-icon-btn")) {
          const adminBtn = document.createElement("a");
          adminBtn.href = "product-upload.html";
          adminBtn.className = "nav-icon admin-icon-btn";
          adminBtn.setAttribute("aria-label", "Admin Control Panel");
          adminBtn.setAttribute("title", "Launch Management Studio");
          adminBtn.innerHTML = `<i class="fa-solid fa-user-gear" style="color: var(--primary);"></i>`;

          // Place cleanly ahead of mobile hamburger selector lines
          const menuToggle = document.querySelector(".menu-toggle");
          if (menuToggle) {
            navActions.insertBefore(adminBtn, menuToggle);
          } else {
            navActions.appendChild(adminBtn);
          }
        }
      }
    } catch (err) {
      console.error("Session authentication token parsing failure:", err);
    }
  }

  updateCartBadge() {
    try {
      const cartData = localStorage.getItem("hgallery_cart");
      const cart = cartData ? JSON.parse(cartData) : { count: 0 };
      const badges = document.querySelectorAll(".count");
      badges.forEach((badge) => {
        badge.textContent = cart.count || 0;
        badge.style.display = cart.count > 0 ? "flex" : "none";
      });
    } catch (error) {
      console.error("Error updating cart badge:", error);
    }
  }

  getFallbackHeader() {
    return `
      <div class="top-bar">
        <div class="container">
          <div class="top-left">
            <span><i class="fas fa-phone-alt"></i> <a href="tel:+254726335283">+254 726 335 283</a></span>
            <span><i class="fas fa-envelope"></i> <a href="mailto:hgalleryltd@gmail.com">hgalleryltd@gmail.com</a></span>
          </div>
          <div class="top-right">
            <span><i class="fas fa-map-marker-alt"></i> Our Mall, Magadi Road, Nairobi</span>
          </div>
        </div>
      </div>
      <header>
        <div class="container">
          <nav class="navbar">
            <div class="logo">
              <a href="index.html">
                <h1>H<span>GALLERY</span></h1>
              </a>
            </div>
            <ul class="nav-menu">
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About</a></li>
              <li><a href="shop.html">Products</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="projects.html">Projects</a></li>
              <li><a href="gallery.html">Gallery</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
            <div class="nav-actions">
              <a href="search.html" class="nav-icon" aria-label="Search"><i class="fas fa-search"></i></a>
              <a href="wishlist.html" class="nav-icon" aria-label="Wishlist"><i class="fas fa-heart"></i></a>
              <a href="cart.html" class="nav-icon" aria-label="Cart">
                <i class="fas fa-shopping-bag"></i>
                <span class="count">0</span>
              </a>
              <button class="menu-toggle" aria-label="Toggle menu">
                <i class="fas fa-bars"></i>
              </button>
            </div>
          </nav>
        </div>
      </header>
    `;
  }

  getFallbackFooter() {
    return `
      <footer>
        <div class="container">
          <div class="footer-grid">
            <div class="footer-column">
              <div class="footer-logo">
                <h2>H<span>GALLERY</span></h2>
              </div>
              <p>Quality. Style. Solutions. Since 2015, we've been transforming spaces with premium glass, aluminium, and home decor solutions.</p>
              <div class="social-icons">
                <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
              </div>
            </div>
            <div class="footer-column">
              <h3 class="footer-title">Quick Links</h3>
              <div class="footer-links">
                <a href="about.html">About Us</a>
                <a href="shop.html">Products</a>
                <a href="services.html">Services</a>
                <a href="projects.html">Projects</a>
                <a href="gallery.html">Gallery</a>
                <a href="contact.html">Contact</a>
                <a href="faq.html">FAQ</a>
              </div>
            </div>
            <div class="footer-column">
              <h3 class="footer-title">Products</h3>
              <div class="footer-links">
                <a href="shop.html?category=glass">Glass</a>
                <a href="shop.html?category=aluminium">Aluminium</a>
                <a href="shop.html?category=shower">Shower Cubicles</a>
                <a href="shop.html?category=wall">Wall Panels</a>
                <a href="shop.html?category=frames">Picture Frames</a>
                <a href="shop.html?category=decor">Home Decor</a>
              </div>
            </div>
            <div class="footer-column">
              <h3 class="footer-title">Contact Info</h3>
              <div class="footer-contact">
                <p><i class="fas fa-phone-alt"></i> +254 726 335 283</p>
                <p><i class="fas fa-envelope"></i> hgalleryltd@gmail.com</p>
                <p><i class="fas fa-map-marker-alt"></i> Our Mall, Magadi Road, Nairobi</p>
                <p><i class="far fa-clock"></i> Mon-Sat: 8AM - 6PM</p>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2026 HGALLERY LTD. All rights reserved.</p>
            <p><i class="fab fa-whatsapp"></i> Chat with us directly</p>
          </div>
        </div>
      </footer>
    `;
  }
}

// Automatically instantiate engine framework on load
document.addEventListener("DOMContentLoaded", () => {
  window.ComponentsEngine = new ComponentLoader();
});
