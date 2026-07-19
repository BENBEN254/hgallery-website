/**
 * HGALLERY LTD - High-Performance Layout Engine & Component Loader
 * Optimized to remove network lag using Parallel Asynchronous Execution streams.
 */

export class ComponentLoader {
  constructor() {
    this.headerHTML = "";
    this.footerHTML = "";

    // Cached DOM Namespace to prevent layout lookups inside event loops
    this.dom = {};
    this.init();
  }

  async init() {
    // Optimization: Run both fetch processes concurrently in parallel stream loops
    await Promise.all([this.loadHeader(), this.loadFooter()]);

    this.renderComponents();
    this.cacheDOM();
    this.initHeaderScripts();
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
    this.dom.menuToggle = document.querySelector(".menu-toggle");
    this.dom.navMenu = document.querySelector(".nav-menu");
    this.dom.navActions = document.querySelector(".nav-actions");
    this.dom.searchToggle = document.querySelector(
      '.nav-icon[aria-label="Search"]',
    );
    this.dom.badges = document.querySelectorAll(".count");
  }

  setActiveNav() {
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".nav-menu a");

    // Using single-pass iteration optimization
    for (let i = 0; i < links.length; i++) {
      if (links[i].getAttribute("href") === currentPath) {
        links[i].classList.add("active");
        break; // Stop iteration loop immediately once target matching path is found
      }
    }
  }

  initHeaderScripts() {
    const { menuToggle, navMenu, searchToggle } = this.dom;

    if (menuToggle && navMenu) {
      menuToggle.addEventListener("click", () => {
        const isActive = navMenu.classList.toggle("active");
        const icon = menuToggle.querySelector("i");
        if (icon) {
          icon.className = isActive ? "fas fa-times" : "fas fa-bars";
        }
      });
    }

    this.updateCartBadge();

    if (searchToggle) {
      searchToggle.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "search.html";
      });
    }
  }

  injectAdminControls() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      if (
        payload &&
        (payload.role === "admin" || payload.role === "super-admin")
      ) {
        const { navMenu, navActions, menuToggle } = this.dom;

        if (navMenu && !document.querySelector(".admin-nav-item")) {
          const adminLi = document.createElement("li");
          adminLi.className = "admin-nav-item";
          adminLi.innerHTML = `<a href="product-upload.html" style="color: var(--primary); font-weight:700;"><i class="fa-solid fa-screwdriver-wrench"></i> Admin Panel</a>`;
          navMenu.appendChild(adminLi);
        }

        if (navActions && !document.querySelector(".admin-icon-btn")) {
          const adminBtn = document.createElement("a");
          adminBtn.href = "product-upload.html";
          adminBtn.className = "nav-icon admin-icon-btn";
          adminBtn.setAttribute("aria-label", "Admin Control Panel");
          adminBtn.setAttribute("title", "Launch Management Studio");
          adminBtn.innerHTML = `<i class="fa-solid fa-user-gear" style="color: var(--primary);"></i>`;

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
      const countValue = cart.count || 0;
      const displayStyle = countValue > 0 ? "flex" : "none";

      this.dom.badges?.forEach((badge) => {
        badge.textContent = countValue;
        badge.style.display = displayStyle;
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
            <div class="logo"><a href="index.html"><h1>H<span>GALLERY</span></h1></a></div>
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
              <button class="menu-toggle" aria-label="Toggle menu"><i class="fas fa-bars"></i></button>
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
              <div class="footer-logo"><h2>H<span>GALLERY</span></h2></div>
              <p>Quality. Style. Solutions. Since 2015, we've been transforming spaces with premium glass, aluminium, and home decor solutions.</p>
              <div class="social-icons">
                <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}
