/**
 * Services UI Layout Controller
 * Handles secure HTML template parsing and element injection targets.
 */
import { ServicesAPI, SERVICES_CONFIG } from "./ServicesAPI.js";

export class Services {
  constructor() {
    this.api = new ServicesAPI();
    this.dom = {};
    this.init();
  }

  async init() {
    this.cacheDOM();
    await this.loadServices();
  }

  cacheDOM() {
    this.dom.grid = document.getElementById("servicesGrid");
  }

  /**
   * Defensive utility to prevent cross-site scripting (XSS) from database strings
   */
  escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  async loadServices() {
    try {
      await this.api.fetchServices();
      // Automatically render up to 6 services by default on home/landing containers
      this.renderServices(6);
    } catch (error) {
      console.error(
        "Unable to sync active service catalogs from cluster:",
        error,
      );
      this.showError(
        "Failed to update services feed. Please verify server connection.",
      );
    }
  }

  /**
   * Renders dynamic layout cards inside specified target wrappers
   * @param {number} limit
   */
  renderServices(limit = 6) {
    if (!this.dom.grid) return; // Exit gracefully if the current page template doesn't include a grid

    const dataSet = this.api.services;

    if (dataSet.length === 0) {
      this.dom.grid.innerHTML = `
        <p style="text-align:center; color:var(--text-muted); width:100%; grid-column:1/-1;">
          No services currently published.
        </p>
      `;
      return;
    }

    // Dynamic slice window logic
    const visibleServices = dataSet.slice(0, limit);

    this.dom.grid.innerHTML = visibleServices
      .map((service) => {
        const serviceId = service._id || service.id;
        const displayImage = service.mainImage || SERVICES_CONFIG.DEFAULT_IMAGE;
        const iconSelector =
          service.iconClass || service.icon || "fa-solid fa-layer-group";

        const cleanTitle = this.escapeHTML(service.title);
        const cleanDesc = this.escapeHTML(
          service.shortDescription || service.description,
        );

        return `
          <div class="service-card fade-up">
            <div class="service-image">
              <img src="${displayImage}" alt="${cleanTitle}" onerror="this.src='${SERVICES_CONFIG.DEFAULT_IMAGE}'" loading="lazy">
              <div class="service-overlay"></div>
              <div class="service-icon">
                <i class="${this.escapeHTML(iconSelector)}"></i>
              </div>
            </div>
            <div class="service-content">
              <h3>${cleanTitle}</h3>
              <p>${cleanDesc}</p>
              <ul class="service-features">
                ${(service.features || [])
                  .map(
                    (feature) => `
                    <li>
                      <i class="fas fa-check-circle"></i>
                      ${this.escapeHTML(feature)}
                    </li>
                  `,
                  )
                  .join("")}
              </ul>
              <div class="service-footer">
                <a href="service-details.html?slug=${service.slug || serviceId}" class="service-link">
                  Learn More
                  <i class="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  showError(message) {
    if (this.dom.grid) {
      this.dom.grid.innerHTML = `
        <div class="error-msg" style="color:var(--danger); width:100%; grid-column:1/-1; text-align:center; padding:20px;">
          ${this.escapeHTML(message)}
        </div>
      `;
    }
  }
}
