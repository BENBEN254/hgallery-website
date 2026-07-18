/**
 * Search Module - API Accelerated Search Execution
 * Refactored by Senior Dev for Live Database Match Synchronization
 */

export class Search {
  constructor() {
    this.init();
  }

  init() {
    this.setupSearch();
    this.renderSearchPage();
  }

  setupSearch() {
    const searchInput = document.querySelector(".search-input, #searchInput");
    const searchBtn = document.querySelector("#searchBtn");
    const searchToggle = document.querySelector(".search-toggle");

    if (searchInput) {
      searchInput.addEventListener(
        "input",
        this.debounce((e) => {
          const query = e.target.value.trim();
          if (query.length >= 2) {
            this.performSearch(query);
          } else if (query.length === 0) {
            this.clearResults();
          }
        }, 300),
      );
    }

    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        const input = document.querySelector("#searchInput");
        if (input) {
          this.performSearch(input.value.trim());
        }
      });
    }

    if (searchToggle) {
      searchToggle.addEventListener("click", () => {
        const searchContainer = document.querySelector(".search-container");
        if (searchContainer) {
          searchContainer.classList.toggle("active");
          searchContainer.querySelector("input")?.focus();
        }
      });
    }
  }

  // ==========================================================
  // DECOUPLED ASYNC DATABASE ENGINE QUERY
  // ==========================================================
  async performSearch(query) {
    if (!query || query.length < 2) {
      this.clearResults();
      return;
    }

    const container = document.querySelector("#searchResults");
    if (container) {
      container.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Querying cluster inventory...</p>`;
    }

    try {
      // Stream parameters cleanly down into MongoDB text indexes
      const response = await fetch(
        `http://localhost:5000/api/products?search=${encodeURIComponent(query)}`,
      );

      if (!response.ok) throw new Error("Search pipeline request rejected.");

      const resData = await response.json();

      if (resData.success) {
        const products = resData.data.products || [];
        this.displayResults(products, query);
      }
    } catch (err) {
      console.error("Search sync failure:", err);
      if (container) {
        container.innerHTML = `<p style="text-align:center; color:var(--danger); padding:20px;">Connection failure. Cannot load results.</p>`;
      }
    }
  }

  displayResults(results, query) {
    const container = document.querySelector("#searchResults");
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-empty" style="text-align:center; padding:40px;">
          <i class="fas fa-search" style="font-size:40px; color:var(--text-muted); margin-bottom:15px;"></i>
          <p>No results found for "<strong>${query}</strong>"</p>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Try different keywords or refine your terms.</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="search-results-header" style="display:flex; justify-content:space-between; margin-bottom:20px;">
        <span>${results.length} matched items discovered for "${query}"</span>
        <a href="shop.html?search=${encodeURIComponent(query)}" style="color:var(--primary); font-weight:700;">View Full Grid</a>
      </div>
      <div class="search-results-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
    `;

    results.slice(0, 6).forEach((product) => {
      const productId = product._id || product.id;
      const displayImg = product.mainImage || "assets/images/placeholder.jpg";

      html += `
        <div class="search-result-item" style="border:1px solid var(--border); padding:15px; border-radius:8px; background:var(--white);">
          <a href="product-details.html?id=${productId}" style="display:flex; gap:15px; align-items:center; text-decoration:none; color:inherit;">
            <img src="${displayImg}" alt="${product.name}" loading="lazy" style="width:70px; height:70px; object-fit:cover; border-radius:4px;">
            <div class="info">
              <h4 style="margin:0 0 5px; font-size:16px;">${product.name}</h4>
              <span class="category" style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:5px;">${product.categoryName || "General"}</span>
              <span class="price" style="font-weight:700; color:var(--primary);">KSh ${(product.price || 0).toLocaleString()}</span>
            </div>
          </a>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  clearResults() {
    const container = document.querySelector("#searchResults");
    if (container) container.innerHTML = "";
  }

  renderSearchPage() {
    const container = document.querySelector("#searchPageContent");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const query = params.get("search") || params.get("q") || "";

    container.innerHTML = `
      <div class="search-page" style="padding:40px 0;">
        <div class="search-header" style="text-align:center; margin-bottom:40px;">
          <h2>Search Inventory Catalog</h2>
          <div class="search-bar-large" style="display:flex; max-width:600px; margin:20px auto 0; gap:10px;">
            <input type="text" id="searchInput" class="form-control" style="flex:1; padding:12px;" placeholder="Search for products, materials, frames..." value="${query}">
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
