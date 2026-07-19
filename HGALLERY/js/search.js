/**
 * Search UI Layout Controller
 * Manages interaction events, input debouncing, and secure element painting.
 */
import { SearchAPI, SEARCH_CONFIG } from "./SearchAPI.js";

export class Search {
  constructor() {
    this.api = new SearchAPI();
    this.dom = {};
    this.init();
  }

  init() {
    this.cacheDOM();
    this.setupSearch();
    this.renderSearchPage();
  }

  cacheDOM() {
    this.dom.searchInput = document.querySelector(
      ".search-input, #searchInput",
    );
    this.dom.searchBtn = document.getElementById("searchBtn");
    this.dom.searchToggle = document.querySelector(".search-toggle");
    this.dom.container = document.getElementById("searchResults");
    this.dom.searchContainer = document.querySelector(".search-container");
    this.dom.pageContent = document.getElementById("searchPageContent");
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

  setupSearch() {
    // Re-cache inputs safely if dynamic templates render them after creation
    const currentInput =
      this.dom.searchInput || document.querySelector("#searchInput");

    currentInput?.addEventListener(
      "input",
      this.debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
          await this.performSearch(query);
        } else if (query.length === 0) {
          this.clearResults();
        }
      }, 300),
    );

    this.dom.searchBtn?.addEventListener("click", async () => {
      const targetInput =
        document.querySelector("#searchInput") || currentInput;
      if (targetInput) await this.performSearch(targetInput.value.trim());
    });

    this.dom.searchToggle?.addEventListener("click", () => {
      if (this.dom.searchContainer) {
        const isActive = this.dom.searchContainer.classList.toggle("active");
        if (isActive) this.dom.searchContainer.querySelector("input")?.focus();
      }
    });
  }

  async performSearch(query) {
    if (!query || query.length < 2) {
      this.clearResults();
      return;
    }

    const outputGrid =
      this.dom.container || document.getElementById("searchResults");
    if (outputGrid) {
      outputGrid.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Querying cluster inventory...</p>`;
    }

    try {
      const products = await this.api.queryCluster(query);
      this.displayResults(products, query, outputGrid);
    } catch (err) {
      console.error("Search interface synchronization failure:", err);
      if (outputGrid) {
        outputGrid.innerHTML = `<p style="text-align:center; color:var(--danger); padding:20px;">Connection failure. Cannot load results.</p>`;
      }
    }
  }

  displayResults(results, query, targetContainer) {
    const container =
      targetContainer ||
      this.dom.container ||
      document.getElementById("searchResults");
    if (!container) return;

    const sanitizedQuery = this.escapeHTML(query);

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-empty" style="text-align:center; padding:40px;">
          <i class="fas fa-search" style="font-size:40px; color:var(--text-muted); margin-bottom:15px;"></i>
          <p>No results found for "<strong>${sanitizedQuery}</strong>"</p>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Try different keywords or refine your terms.</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="search-results-header" style="display:flex; justify-content:space-between; margin-bottom:20px;">
        <span>${results.length} matched items discovered for "${sanitizedQuery}"</span>
        <a href="shop.html?search=${encodeURIComponent(query)}" style="color:var(--primary); font-weight:700;">View Full Grid</a>
      </div>
      <div class="search-results-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
    `;

    results.slice(0, 6).forEach((product) => {
      const productId = product._id || product.id;
      const displayImg = product.mainImage || SEARCH_CONFIG.DEFAULT_PLACEHOLDER;

      html += `
        <div class="search-result-item" style="border:1px solid var(--border); padding:15px; border-radius:8px; background:var(--white);">
          <a href="product-details.html?id=${productId}" style="display:flex; gap:15px; align-items:center; text-decoration:none; color:inherit;">
            <img src="${displayImg}" alt="${this.escapeHTML(product.name)}" loading="lazy" style="width:70px; height:70px; object-fit:cover; border-radius:4px;">
            <div class="info">
              <h4 style="margin:0 0 5px; font-size:16px;">${this.escapeHTML(product.name)}</h4>
              <span class="category" style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:5px;">${this.escapeHTML(product.categoryName || "General")}</span>
              <span class="price" style="font-weight:700; color:var(--primary);">KSh ${Number(product.price || 0).toLocaleString()}</span>
            </div>
          </a>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  clearResults() {
    const container =
      this.dom.container || document.getElementById("searchResults");
    if (container) container.innerHTML = "";
  }

  renderSearchPage() {
    if (!this.dom.pageContent) return;

    const params = new URLSearchParams(window.location.search);
    const query = params.get("search") || params.get("q") || "";

    this.dom.pageContent.innerHTML = `
      <div class="search-page" style="padding:40px 0;">
        <div class="search-header" style="text-align:center; margin-bottom:40px;">
          <h2>Search Inventory Catalog</h2>
          <div class="search-bar-large" style="display:flex; max-width:600px; margin:20px auto 0; gap:10px;">
            <input type="text" id="searchInput" class="form-control" style="flex:1; padding:12px;" placeholder="Search for products, materials, frames..." value="${this.escapeHTML(query)}">
            <button id="searchBtn" style="padding:0 25px; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;"><i class="fas fa-search"></i></button>
          </div>
        </div>
        <div id="searchResults"></div>
      </div>
    `;

    this.setupSearch();
    if (query) this.performSearch(query);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.SearchInstance = new Search();
});
