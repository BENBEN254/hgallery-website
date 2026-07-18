/**
 * Services Module - Dynamic Catalog Loading
 * Refactored by Senior Dev for Live Backend Integration
 */

export class Services {
  constructor() {
    this.services = [];
    this.init();
  }

  async init() {
    await this.loadServices();
    // Automatically render up to 6 services by default on home/landing containers
    this.renderServices(6);
  }

  // ==========================================================
  // DYNAMIC BACKEND ASYNC SERVICE FETCH ENGINE
  // ==========================================================
  async loadServices() {
    try {
      // Direct call to your live Node.js Express server service endpoints
      const response = await fetch("http://localhost:5000/api/services");

      if (!response.ok) {
        throw new Error(`HTTP error status received: ${response.status}`);
      }

      const resData = await response.json();

      if (resData.success) {
        // Map data arrays safely out of response envelopes
        this.services = resData.data || [];
      }
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

  // ==========================================================
  // RENDER DYNAMIC SERVICE GRID LAYOUTS
  // ==========================================================
  renderServices(limit = 6) {
    const container = document.getElementById("servicesGrid");
    if (!container) return; // Exit gracefully if the current page template doesn't include a grid

    if (this.services.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:var(--text-muted); width:100%; grid-column:1/-1;">No services currently published.</p>`;
      return;
    }

    // Dynamic slice window logic
    const visibleServices = this.services.slice(0, limit);

    container.innerHTML = visibleServices
      .map((service) => {
        // Map database properties seamlessly (_id instead of id, mainImage for media links)
        const serviceId = service._id || service.id;
        const displayImage = service.mainImage || "assets/images/why-us.jpg";
        const iconSelector =
          service.iconClass || service.icon || "fa-solid fa-layer-group";

        return `
          <div class="service-card fade-up">
            <div class="service-image">
              <img src="${displayImage}" alt="${service.title}" onerror="this.src='assets/images/why-us.jpg'">
              <div class="service-overlay"></div>
              <div class="service-icon">
                <i class="${iconSelector}"></i>
              </div>
            </div>
            <div class="service-content">
              <h3>${service.title}</h3>
              <p>${service.shortDescription || service.description}</p>
              <ul class="service-features">
                ${(service.features || [])
                  .map(
                    (feature) => `
                    <li>
                      <i class="fas fa-check-circle"></i>
                      ${feature}
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
    const container = document.getElementById("servicesGrid");
    if (container) {
      container.innerHTML = `<div class="error-msg" style="color:var(--danger); width:100%; grid-column:1/-1; text-align:center; padding:20px;">${message}</div>`;
    }
  }
}

// Auto-boot implementation mapping
document.addEventListener("DOMContentLoaded", () => {
  window.ServicesInstance = new Services();
});
