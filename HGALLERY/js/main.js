/**
 * HGALLERY LTD - Main Application
 * Entry point that initializes all modules
 */

import { ComponentLoader } from "./components.js";
import { Utils } from "./utils.js";

class App {
  constructor() {
    this.page = document.body.dataset.page || "home";
    this.init();
  }

  async init() {
    // Load header and footer components
    const loader = new ComponentLoader();
    await loader.init();

    // Initialize utilities
    const utils = new Utils();

    // Initialize page-specific modules
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

  async initHome() {
    try {
      // Load featured products
      const productsModule = await import("./products.js");
      const products = new productsModule.Products();
      await products.loadProducts();
      products.renderFeatured();

      // Load services
      const servicesModule = await import("./services.js");
      const services = new servicesModule.Services();
      await services.loadServices();
      services.renderServices();

      // Load categories
      const catResponse = await fetch("/data/categories.json");
      const catData = await catResponse.json();
      this.renderCategories(catData.categories || []);

      // Load projects
      const projResponse = await fetch("/data/projects.json");
      const projData = await projResponse.json();
      this.renderProjects(projData.projects || []);

      // Load testimonials
      const testResponse = await fetch("/data/testimonials.json");
      const testData = await testResponse.json();
      this.renderTestimonials(testData.testimonials || []);

      // Load brands
      const brandsResponse = await fetch("/data/brands.json");
      const brandsData = await brandsResponse.json();
      this.renderBrands(brandsData.brands || []);
    } catch (error) {
      console.error("Error loading home page data:", error);
    }
  }

  renderCategories(categories) {
    const container = document.getElementById("categoriesGrid");
    if (!container) return;

    container.innerHTML = categories
      .map(
        (cat) => `
      <a href="products.html?category=${cat.slug}" class="category-card">
        <div class="category-image">
          <img src="${cat.image || "/assets/images/placeholder.jpg"}" alt="${cat.name}" loading="lazy">
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
      .join("");
  }

  renderProjects(projects) {
    const container = document.getElementById("projectsGrid");
    if (!container) return;

    const featured = projects.filter((p) => p.featured).slice(0, 3);

    container.innerHTML = featured
      .map(
        (p) => `
      <div class="project-card">
        <div class="project-image">
          <img src="${p.image || "/assets/images/placeholder.jpg"}" alt="${p.title}" loading="lazy">
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
      .join("");
  }

  renderTestimonials(testimonials) {
    const container = document.getElementById("testimonialsGrid");
    if (!container) return;

    container.innerHTML = testimonials
      .map(
        (t) => `
      <div class="testimonial-card fade-up">
        <div class="testimonial-rating">
          ${"★".repeat(t.rating)}${"☆".repeat(5 - t.rating)}
        </div>
        <p class="testimonial-text">"${t.quote}"</p>
        <div class="client">
          <img src="${t.avatar || "/assets/images/avatar-placeholder.jpg"}" alt="${t.name}">
          <div>
            <h4>${t.name}</h4>
            <span>${t.role}${t.location ? `, ${t.location}` : ""}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  }

  renderBrands(brands) {
    const container = document.getElementById("brandsGrid");
    if (!container) return;

    container.innerHTML = brands
      .map(
        (brand) => `
      <div class="brand-item">
        <img src="${brand.logo || "/assets/images/brand-placeholder.jpg"}" alt="${brand.name}" loading="lazy">
      </div>
    `,
      )
      .join("");
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});

export default App;
