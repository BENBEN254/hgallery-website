/**
 * Shop UI Controller Module
 * Handles structural DOM manipulation, template updates, and user interaction delegation.
 */
import { ShopAPI, CONFIG } from "./ShopAPI.js";

export class Shop {
  constructor() {
    this.api = new ShopAPI(); // Instantiate the backend engine
    this.dom = {};
    this.init();
  }

  async init() {
    this.cacheDOM();
    this.setupEventDelegation();
    await this.syncWithBackend();
  }

  cacheDOM() {
    this.dom.grid = document.getElementById("productsGrid");
    this.dom.countEl = document.getElementById("productCount");
    this.dom.pageNumbers = document.getElementById("pageNumbers");
    this.dom.prevBtn = document.getElementById("prevPage");
    this.dom.nextBtn = document.getElementById("nextPage");
    this.dom.sortSelect = document.getElementById("sortProducts");
    this.dom.filterContainer =
      document.querySelector(".shop-sidebar-filters") || document.body;
    this.dom.viewContainer = document.querySelector(".view-toggle");
  }

  escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  async syncWithBackend() {
    try {
      this.toggleLoading(true);
      await this.api.fetchInventory();
      this.render();
    } catch (error) {
      console.error("Database UI rendering exception stack:", error);
      this.showError("Failed to synchronize with backend records.");
    } finally {
      this.toggleLoading(false);
    }
  }

  setupEventDelegation() {
    // Drop down sorting controller action
    this.dom.sortSelect?.addEventListener("change", (e) => {
      this.api.state.filters.sort = e.target.value;
      this.api.state.pagination.page = 1;
      this.syncWithBackend();
    });

    // Unified click event handler tracking multi-filter targets
    this.dom.filterContainer?.addEventListener("click", (e) => {
      const categoryLink = e.target.closest("#categoryFilters a");
      if (categoryLink) {
        e.preventDefault();
        this.api.state.filters.category =
          categoryLink.dataset.category || "all";
        this.api.state.pagination.page = 1;
        this.syncWithBackend();
        return;
      }

      const ratingLink = e.target.closest(".filter-rating a");
      if (ratingLink) {
        e.preventDefault();
        this.api.state.filters.minRating = Number(
          ratingLink.dataset.rating || 0,
        );
        this.api.state.pagination.page = 1;
        this.syncWithBackend();
      }
    });

    // Grid vs List view toggle elements listener loop
    this.dom.viewContainer?.addEventListener("click", (e) => {
      const viewButton = e.target.closest("button[data-view]");
      if (!viewButton) return;
      this.api.state.ui.currentView = viewButton.dataset.view;
      this.render();
    });
  }

  render() {
    if (!this.dom.grid) return;
    const { products, ui } = this.api.state;

    if (products.length === 0) {
      this.dom.grid.innerHTML = this.getEmptyStateHTML();
      this.renderPagination();
      return;
    }

    this.dom.grid.innerHTML = products
      .map((product) => this.createProductCard(product, ui.currentView))
      .join("");

    this.updateProductCount();
    this.renderPagination();
  }

  createProductCard(product, currentView) {
    const productId = product._id || product.id;
    const itemImage =
      product.mainImage ||
      product.images?.[0]?.url ||
      CONFIG.DEFAULT_PLACEHOLDER;
    const isList = currentView === "list";

    return `
      <div class="product-card ${isList ? "list-view" : ""}">
        <div class="product-image">
          <img src="${itemImage}" alt="${this.escapeHTML(product.name)}" loading="lazy" onerror="this.src='${CONFIG.DEFAULT_PLACEHOLDER}'" />
          <div class="product-actions">
            <button class="wishlist-btn" data-id="${productId}"><i class="far fa-heart"></i></button>
            <button class="quick-view" data-id="${productId}"><i class="fas fa-eye"></i></button>
          </div>
        </div>
        <div class="product-info">
          <span class="product-category">${this.escapeHTML(product.categoryName || "Uncategorized")}</span>
          <h4><a href="product-details.html?id=${productId}">${this.escapeHTML(product.name)}</a></h4>
          <div class="product-price">
            <span class="current">KSh ${Number(product.price || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  }

  updateProductCount() {
    if (this.dom.countEl) {
      const { products, pagination } = this.api.state;
      this.dom.countEl.textContent = `Showing ${products.length} of ${pagination.total} products`;
    }
  }

  toggleLoading(isLoading) {
    if (this.dom.grid) {
      this.dom.grid.style.opacity = isLoading ? "0.5" : "1";
      this.dom.grid.style.pointerEvents = isLoading ? "none" : "auto";
    }
  }

  showError(msg) {
    if (this.dom.grid)
      this.dom.grid.innerHTML = `<div class="error-msg">${this.escapeHTML(msg)}</div>`;
  }

  getEmptyStateHTML() {
    return `<div class="empty-state"><h3>No Products Found</h3></div>`;
  }

  renderPagination() {
    // Missing custom pagination layout loop tree code hooks map directly here
  }
}
