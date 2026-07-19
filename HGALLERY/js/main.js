/**
 * HGALLERY LTD - Main Application
 * Entry point optimized for high-speed concurrent network stream execution.
 */

import { ComponentLoader } from "./components.js";
import { Utils } from "./utils.js";

// Global Static Fallbacks Config to eliminate redundant string assignments
const ASSETS = {
  PLACEHOLDER: "/assets/images/placeholder.jpg",
  AVATAR: "/assets/images/avatar-placeholder.jpg",
  BRAND: "/assets/images/brand-placeholder.jpg",
};

class App {
  constructor() {
    this.page = document.body.dataset.page || "home";
    this.init();
  }

  async init() {
    // 1. Immediately kick off component initialization
    const loader = new ComponentLoader();
    await loader.init();

    // 2. Initialize secondary layout utilities
    new Utils();

    // 3. Evaluate conditional routing paths
    this.initPageModules();
  }

  initPageModules() {
    switch (this.page) {
      case "home":
        this.initHome();
        break;
      case "products":
        this.loadModule("./products.js", "Products");
        break;
      case "services":
        this.loadModule("./services.js", "Services");
        break;
      case "gallery":
        this.loadModule("./gallery.js", "Gallery");
        break;
      case "cart":
        this.loadModule("./cart.js", "Cart");
        break;
      case "wishlist":
        this.loadModule("./wishlist.js", "Wishlist");
        break;
      case "search":
        this.loadModule("./search.js", "Search");
        break;
      default:
        break;
    }
  }

  async loadModule(modulePath, className) {
    try {
      const module = await import(modulePath);
      if (module[className]) {
        new module[className]();
      }
    } catch (error) {
      console.error(`Error loading ${className}:`, error);
    }
  }

  // ==========================================================
  // HIGH-SPEED PARALLEL CONCURRENCY DATA ENGINE
  // ==========================================================
  async initHome() {
    try {
      // Slicing out execution latency by processing imports concurrently
      const [productsModule, servicesModule] = await Promise.all([
        import("./products.js"),
        import("./services.js"),
      ]);

      const products = new productsModule.Products();
      const services = new servicesModule.Services();

      // Launch ALL 6 backend fetch threads concurrently at the exact same millisecond
      const results = await Promise.allSettled([
        products.loadProducts(),
        services.loadServices(),
        fetch("/data/categories.json").then((res) => res.json()),
        fetch("/data/projects.json").then((res) => res.json()),
        fetch("/data/testimonials.json").then((res) => res.json()),
        fetch("/data/brands.json").then((res) => res.json()),
      ]);

      // Safely evaluate thread payload collections
      if (results[0].status === "fulfilled") products.renderFeatured();
      if (results[1].status === "fulfilled") services.renderServices();

      if (results[2].status === "fulfilled")
        this.renderCategories(results[2].value?.categories || []);
      if (results[3].status === "fulfilled")
        this.renderProjects(results[3].value?.projects || []);
      if (results[4].status === "fulfilled")
        this.renderTestimonials(results[4].value?.testimonials || []);
      if (results[5].status === "fulfilled")
        this.renderBrands(results[5].value?.brands || []);
    } catch (error) {
      console.error(
        "Critical error mapping concurrent homepage assets:",
        error,
      );
    }
  }

  renderCategories(categories) {
    const container = document.getElementById("categoriesGrid");
    if (!container) return;

    this.fastInnerHTML(
      container,
      categories
        .map(
          (cat) => `
      <a href="products.html?category=${cat.slug}" class="category-card">
        <div class="category-image">
          <img src="${cat.image || ASSETS.PLACEHOLDER}" alt="${cat.name}" loading="lazy">
          <div class="category-overlay"></div>
        </div>
        <div class="category-content">
          <h3>${cat.name}</h3>
          <p>${cat.count || 0} Products</p>
          <span class="category-link">Shop Now <i class="fas fa-arrow-right"></i></span>
        </div>
      </a>
    `,
        )
        .join(""),
    );
  }

  renderProjects(projects) {
    const container = document.getElementById("projectsGrid");
    if (!container) return;

    const featured = projects.filter((p) => p.featured).slice(0, 3);

    this.fastInnerHTML(
      container,
      featured
        .map(
          (p) => `
      <div class="project-card">
        <div class="project-image">
          <img src="${p.image || ASSETS.PLACEHOLDER}" alt="${p.title}" loading="lazy">
        </div>
        <div class="project-overlay">
          <span class="project-category">${p.category}</span>
          <h3>${p.title}</h3>
          <p>${p.description || ""}</p>
          <a href="projects.html" class="project-link">View Project <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    `,
        )
        .join(""),
    );
  }

  renderTestimonials(testimonials) {
    const container = document.getElementById("testimonialsGrid");
    if (!container) return;

    this.fastInnerHTML(
      container,
      testimonials
        .map(
          (t) => `
      <div class="testimonial-card fade-up">
        <div class="testimonial-rating">
          ${"★".repeat(t.rating)}${"☆".repeat(Math.max(0, 5 - t.rating))}
        </div>
        <p class="testimonial-text">"${t.quote}"</p>
        <div class="client">
          <img src="${t.avatar || ASSETS.AVATAR}" alt="${t.name}">
          <div>
            <h4>${t.name}</h4>
            <span>${t.role}${t.location ? `, ${t.location}` : ""}</span>
          </div>
        </div>
      </div>
    `,
        )
        .join(""),
    );
  }

  renderBrands(brands) {
    const container = document.getElementById("brandsGrid");
    if (!container) return;

    this.fastInnerHTML(
      container,
      brands
        .map(
          (brand) => `
      <div class="brand-item">
        <img src="${brand.logo || ASSETS.BRAND}" alt="${brand.name}" loading="lazy">
      </div>
    `,
        )
        .join(""),
    );
  }

  /**
   * Performance Helper: Limits browser reflow paints during text injections
   */
  fastInnerHTML(element, htmlString) {
    element.textContent = "";
    element.insertAdjacentHTML("beforeend", htmlString);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});

export default App;
