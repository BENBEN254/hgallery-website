/**
 * Shop Module - Product Loading & Management
 * Refactored for real-time dynamic MongoDB Backend Sync
 */

export class Shop {
  constructor() {
    this.products = [];
    this.pagination = { page: 1, limit: 9, total: 0, pages: 1 };

    // Internal state management mappings for API parameters
    this.currentCategory = "all";
    this.currentSort = "newest";
    this.minPrice = 0;
    this.maxPrice = "";
    this.minRating = 0;
    this.inStockOnly = false;
    this.searchQuery = "";
    this.currentView = "grid";

    // DOM bindings matching your layout configuration
    this.grid = document.getElementById("productsGrid");
    this.countEl = document.getElementById("productCount");
    this.pageNumbers = document.getElementById("pageNumbers");
    this.prevBtn = document.getElementById("prevPage");
    this.nextBtn = document.getElementById("nextPage");
    this.sortSelect = document.getElementById("sortProducts");
    this.categoryFilters = document.querySelectorAll("#categoryFilters a");
    this.ratingFilters = document.querySelectorAll(".filter-rating a");
    this.inStockFilter = document.getElementById("inStockFilter");
    this.minPriceInput = document.getElementById("minPrice");
    this.maxPriceInput = document.getElementById("maxPrice");
    this.priceFilterBtn = document.getElementById("priceFilterBtn");
    this.searchInput = document.getElementById("shopSearch");
    this.searchBtn = document.getElementById("searchBtn");
    this.clearFiltersBtn = document.getElementById("clearFilters");
    this.viewButtons = document.querySelectorAll(".view-toggle button");

    this.init();
  }

  async init() {
    await this.loadProducts();
    this.setupEventListeners();
  }

  // ==========================================================
  // DYNAMIC ASYNC BACKEND CONNECTIVITY API ENGINE
  // ==========================================================
  async loadProducts() {
    try {
      // 1. Build Query String dynamically using internal dashboard state
      const queryParams = new URLSearchParams({
        page: this.pagination.page,
        limit: this.pagination.limit,
        sort: this.currentSort,
        inStock: this.inStockOnly ? "true" : "false",
      });

      if (this.currentCategory !== "all")
        queryParams.append("categoryName", this.currentCategory);
      if (this.searchQuery.trim() !== "")
        queryParams.append("search", this.searchQuery);
      if (this.minPrice > 0) queryParams.append("minPrice", this.minPrice);
      if (this.maxPrice !== "") queryParams.append("maxPrice", this.maxPrice);
      if (this.minRating > 0) queryParams.append("rating", this.minRating);

      // 2. Fetch from Express Application Instance
      const response = await fetch(
        `http://localhost:5000/api/products?${queryParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP network error! status: ${response.status}`);
      }

      const resData = await response.json();

      if (resData.success) {
        this.products = resData.data.products || [];
        this.pagination = resData.data.pagination;

        // Render UI panels directly
        this.renderProducts();
        this.updateProductCount();
      }
    } catch (error) {
      console.error("Database connection failure:", error);
      this.showError(
        "Failed to fetch current stock inventory. Verify your API instance is running.",
      );
    }
  }

  // ==========================================================
  // RENDER PRODUCTS
  // ==========================================================
  renderProducts() {
    if (this.products.length === 0) {
      this.grid.innerHTML = this.getEmptyStateHTML();
      this.renderPagination();
      return;
    }

    this.grid.innerHTML = this.products
      .map((product) => this.createProductCard(product))
      .join("");

    this.renderPagination();
    if (typeof this.attachProductEvents === "function")
      this.attachProductEvents();
  }

  // ==========================================================
  // CREATE PRODUCT CARD (Updated mapping for Database Schemas)
  // ==========================================================
  createProductCard(product) {
    // Map database properties safely (_id instead of id, mainImage for pictures)
    const productId = product._id || product.id;
    const itemImage =
      product.mainImage ||
      (product.images && product.images[0]?.url) ||
      "assets/images/placeholder.jpg";
    const isInWishlist =
      typeof this.isInWishlist === "function"
        ? this.isInWishlist(productId)
        : false;

    return `
      <div class="product-card ${this.currentView === "list" ? "list-view" : ""}">
        <div class="product-image">
          <img src="${itemImage}" 
               alt="${product.name}" 
               loading="lazy"
               onerror="this.src='assets/images/placeholder.jpg'" />
          
          ${this.getBadges(product)}
          
          <div class="product-actions">
            <button class="wishlist-btn" data-id="${productId}" aria-label="Add to wishlist">
              <i class="${isInWishlist ? "fas" : "far"} fa-heart" 
                 style="${isInWishlist ? "color: var(--primary);" : ""}"></i>
            </button>
            <button class="quick-view" data-id="${productId}" aria-label="Quick view">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        
        <div class="product-info">
          <span class="product-category">${product.categoryName || "Uncategorized"}</span>
          <h4><a href="product-details.html?id=${productId}">${product.name}</a></h4>
          
          <div class="product-rating">
            ${this.renderStars(product.rating || 0)}
            <span>(${product.reviewsCount || 0})</span>
          </div>
          
          <div class="product-price">
            <span class="current">KSh ${(product.price || 0).toLocaleString()}</span>
            ${product.oldPrice ? `<span class="old">KSh ${product.oldPrice.toLocaleString()}</span>` : ""}
          </div>
          
          <div class="product-footer">
            <span class="stock ${product.inStock !== false ? "in-stock" : "out-of-stock"}">
              ${product.inStock !== false ? "In Stock" : "Out of Stock"}
            </span>
            <a href="product-details.html?id=${productId}" class="btn btn-primary btn-sm">View Details</a>
          </div>
        </div>
      </div>
    `;
  }

  getBadges(product) {
    let badges = "";
    if (product.sale) badges += '<span class="badge sale">Sale</span>';
    if (product.new) badges += '<span class="badge new">New</span>';
    if (product.featured)
      badges += '<span class="badge featured">Featured</span>';
    return badges;
  }

  renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
  }

  getEmptyStateHTML() {
    return `
      <div class="empty-state" style="text-align:center; padding: 40px;">
        <i class="fas fa-box-open" style="font-size: 48px; color: var(--text-muted);"></i>
        <h3>No Products Found</h3>
        <p>Try adjusting your search query parameters or filters.</p>
      </div>
    `;
  }

  updateProductCount() {
    if (this.countEl) {
      this.countEl.innerText = `Showing ${this.products.length} of ${this.pagination.total} products`;
    }
  }

  showError(message) {
    this.grid.innerHTML = `<div class="error-msg" style="color:var(--danger); text-align:center; padding:20px;">${message}</div>`;
  }

  // ==========================================================
  // SERVER PAGINATION ENGINE
  // ==========================================================
  renderPagination() {
    const totalPages = this.pagination.pages;

    if (totalPages <= 1) {
      this.pageNumbers.innerHTML = "";
      if (this.prevBtn) this.prevBtn.style.display = "none";
      if (this.nextBtn) this.nextBtn.style.display = "none";
      return;
    }

    if (this.prevBtn) {
      this.prevBtn.style.display = "inline-flex";
      this.prevBtn.disabled = this.pagination.page <= 1;
    }
    if (this.nextBtn) {
      this.nextBtn.style.display = "inline-flex";
      this.nextBtn.disabled = this.pagination.page >= totalPages;
    }

    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    this.pageNumbers.innerHTML = pages
      .map(
        (p) =>
          `<button class="${p === this.pagination.page ? "active" : ""}" data-page="${p}">${p}</button>`,
      )
      .join("");

    this.pageNumbers.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", async () => {
        this.pagination.page = parseInt(btn.dataset.page);
        await this.loadProducts();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  // ==========================================================
  // INTERACTIVE EVENT CONTROLS
  // ==========================================================
  // ==========================================================
  // INTERACTIVE EVENT CONTROLS
  // ==========================================================
  setupEventListeners() {
    // 1. Sort Controls Selection
    if (this.sortSelect) {
      this.sortSelect.addEventListener("change", async (e) => {
        this.currentSort = e.target.value;
        this.pagination.page = 1;
        await this.loadProducts();
      });
    }

    // 2. Real-Time Search Box
    if (this.searchBtn && this.searchInput) {
      this.searchBtn.addEventListener("click", async () => {
        this.searchQuery = this.searchInput.value;
        this.pagination.page = 1;
        await this.loadProducts();
      });
      this.searchInput.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
          this.searchQuery = this.searchInput.value;
          this.pagination.page = 1;
          await this.loadProducts();
        }
      });
    }

    // 3. Category Link Navigation Filters
    if (this.categoryFilters) {
      this.categoryFilters.forEach((link) => {
        link.addEventListener("click", async (e) => {
          e.preventDefault();
          this.categoryFilters.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
          this.currentCategory = link.dataset.category || "all";
          this.pagination.page = 1;
          await this.loadProducts();
        });
      });
    }

    // 4. In Stock Toggle Box Check
    if (this.inStockFilter) {
      this.inStockFilter.addEventListener("change", async (e) => {
        this.inStockOnly = e.target.checked;
        this.pagination.page = 1;
        await this.loadProducts();
      });
    }

    // 5. Price Ranges
    if (this.priceFilterBtn) {
      this.priceFilterBtn.addEventListener("click", async () => {
        this.minPrice = parseFloat(this.minPriceInput.value) || 0;
        this.maxPrice =
          this.maxPriceInput.value !== ""
            ? parseFloat(this.maxPriceInput.value)
            : "";
        this.pagination.page = 1;
        await this.loadProducts();
      });
    }
  }
} // Closes the Shop class

// Automatically mount into view upon frame load context
document.addEventListener("DOMContentLoaded", () => {
  window.ShopInstance = new Shop();
});
