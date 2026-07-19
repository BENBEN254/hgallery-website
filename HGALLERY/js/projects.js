/**
 * Projects UI Layout Controller
 * Manages clean string text serialization, event delegation, and structural component paints.
 */
import { ProjectsAPI, PROJECTS_CONFIG } from "./ProjectsAPI.js";

export class Projects {
  constructor() {
    this.api = new ProjectsAPI();
    this.dom = {};
    this.init();
  }

  async init() {
    this.cacheDOM();
    await this.loadProjectAssets();
    this.setupFilterDelegation();
  }

  cacheDOM() {
    this.dom.grid = document.getElementById("projectsGrid");
    // Cache target filter wrappers to isolate mouse capture events safely
    this.dom.filterContainer =
      document.getElementById("portfolioFilters") || document.body;
  }

  /**
   * Encodes server text strings defensively to negate layout vulnerabilities (XSS)
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

  async loadProjectAssets() {
    try {
      await this.api.fetchPortfolio();
      this.renderProjectsGrid("all");
    } catch (error) {
      console.error("Unable to query active portfolio assets:", error);
      this.showError(
        "Failed to update project portfolio. Please check server configurations.",
      );
    }
  }

  /**
   * Renders dynamic case-study blocks inside target viewport areas
   * @param {string} filterCategory
   */
  renderProjectsGrid(filterCategory = "all") {
    if (!this.dom.grid) return;

    const dataSet = this.api.projects;
    const targetFilter = filterCategory.toLowerCase();

    // Single-pass inline optimization array filter
    const displayItems =
      targetFilter === "all"
        ? dataSet
        : dataSet.filter((p) => p.categoryName?.toLowerCase() === targetFilter);

    if (displayItems.length === 0) {
      this.dom.grid.innerHTML = `
        <p style="text-align:center; color:var(--text-muted); width:100%; grid-column:1/-1; padding:40px;">
          No showcase projects found under this category.
        </p>
      `;
      return;
    }

    this.dom.grid.innerHTML = displayItems
      .map((project) => {
        const projectId = project._id || project.id;
        const coverImage = project.mainImage || PROJECTS_CONFIG.DEFAULT_HERO;
        const cleanTag = this.escapeHTML(project.categoryName || "General");
        const cleanTitle = this.escapeHTML(project.title);
        const cleanClient = this.escapeHTML(project.client || "Private Client");

        return `
          <div class="project-card fade-up" data-category="${cleanTag}">
            <div class="project-image">
              <img src="${coverImage}" alt="${cleanTitle}" loading="lazy" onerror="this.src='${PROJECTS_CONFIG.DEFAULT_HERO}'">
              <div class="project-hover-content">
                <span class="project-tag">${cleanTag}</span>
                <h3>${cleanTitle}</h3>
                <p class="project-client"><strong>Client:</strong> ${cleanClient}</p>
                <div class="project-action-link">
                  <a href="project-details.html?slug=${project.slug || projectId}" class="btn-link">
                    View Case Study <i class="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  setupFilterDelegation() {
    // High-performance event delegation replaces loops over multiple button elements
    this.dom.filterContainer?.addEventListener("click", (e) => {
      const link = e.target.closest("a, .project-filter-btn");
      if (!link) return;

      e.preventDefault();

      // Clear styling flags cleanly across linked elements inside this container tree branch
      this.dom.filterContainer
        .querySelectorAll("a, .project-filter-btn")
        .forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const chosenCategory = link.dataset.filter || "all";
      this.renderProjectsGrid(chosenCategory);
    });
  }

  showError(message) {
    if (this.dom.grid) {
      this.dom.grid.innerHTML = `
        <div class="error-msg" style="color:var(--danger); width:100%; grid-column:1/-1; text-align:center; padding:30px;">
          ${this.escapeHTML(message)}
        </div>
      `;
    }
  }
}
