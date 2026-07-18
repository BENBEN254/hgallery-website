/**
 * Projects Module - Dynamic Portfolio Management
 * Built by Senior Dev for Real-Time Database Synergy
 */

export class Projects {
  constructor() {
    this.projects = [];
    this.init();
  }

  async init() {
    await this.loadProjects();
    // Render all projects on page load context
    this.renderProjects();
    this.setupCategoryFilters();
  }

  // ==========================================================
  // DYNAMIC PORTFOLIO API CONNECTION ENGINE
  // ==========================================================
  async loadProjects() {
    try {
      // Connects directly to the Portfolio project model route
      const response = await fetch("http://localhost:5000/api/projects");

      if (!response.ok) {
        throw new Error(`HTTP network error status: ${response.status}`);
      }

      const resData = await response.json();

      if (resData.success) {
        // Unpack database object payload records smoothly
        this.projects = resData.data || [];
      }
    } catch (error) {
      console.error("Unable to query active portfolio assets:", error);
      this.showError(
        "Failed to update project portfolio. Please check server configurations.",
      );
    }
  }

  // ==========================================================
  // RENDER PORTFOLIO PROJECTS GRID IMAGERY CARD GRID
  // ==========================================================
  renderProjects(filterCategory = "all") {
    const container = document.getElementById("projectsGrid");
    if (!container) return; // Exit cleanly if the current page template doesn't load a grid

    // Run selective categorization matching checks on data parameters
    const displayItems =
      filterCategory === "all"
        ? this.projects
        : this.projects.filter(
            (p) =>
              p.categoryName?.toLowerCase() === filterCategory.toLowerCase(),
          );

    if (displayItems.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:var(--text-muted); width:100%; grid-column:1/-1; padding:40px;">No showcase projects found under this category.</p>`;
      return;
    }

    container.innerHTML = displayItems
      .map((project) => {
        const projectId = project._id || project.id;
        const coverImage = project.mainImage || "assets/images/hero.jpg";

        return `
          <div class="project-card fade-up" data-category="${project.categoryName || "General"}">
            <div class="project-image">
              <img src="${coverImage}" alt="${project.title}" loading="lazy" onerror="this.src='assets/images/hero.jpg'">
              <div class="project-hover-content">
                <span class="project-tag">${project.categoryName || "General"}</span>
                <h3>${project.title}</h3>
                <p class="project-client"><strong>Client:</strong> ${project.client || "Private Client"}</p>
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

  // ==========================================================
  // INTERACTIVE NAV FILTER HOOKS CLICK HANDLERS
  // ==========================================================
  setupCategoryFilters() {
    // Looks for portfolio selector links matching standard anchor layout grids
    const filterLinks = document.querySelectorAll(
      "#portfolioFilters a, .project-filter-btn",
    );
    if (!filterLinks) return;

    filterLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        // Handle visual swap mechanics for active styling parameters
        filterLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        // Target target categorical attributes mapped on html files
        const selectedCategory = link.dataset.filter || "all";
        this.renderProjects(selectedCategory);
      });
    });
  }

  showError(message) {
    const container = document.getElementById("projectsGrid");
    if (container) {
      container.innerHTML = `<div class="error-msg" style="color:var(--danger); width:100%; grid-column:1/-1; text-align:center; padding:30px;">${message}</div>`;
    }
  }
}

// Instantiate module tracking framework components safely
document.addEventListener("DOMContentLoaded", () => {
  window.ProjectsInstance = new Projects();
});
