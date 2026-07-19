/**
 * Shop API & State Core
 * Handles remote backend synchronization and state persistence.
 */

const CONFIG = {
  // Gracefully handles switching between local testing and your live production backend
  API_BASE_URL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000/api"
      : "https://your-live-backend-url.com", // Replace with your actual live production API domain
  DEFAULT_PLACEHOLDER: "assets/images/placeholder.jpg",
};

export class ShopAPI {
  constructor() {
    this.DEFAULT_PAGINATION = { page: 1, limit: 9, total: 0, pages: 1 };

    // Application state engine
    this.state = {
      products: [],
      pagination: { ...this.DEFAULT_PAGINATION },
      filters: {
        category: "all",
        sort: "newest",
        minPrice: 0,
        maxPrice: "",
        minRating: 0,
        inStockOnly: false,
        searchQuery: "",
      },
      ui: { currentView: "grid" },
    };
  }

  /**
   * Constructs the backend endpoint query string safely
   */
  buildQueryURL() {
    const { pagination, filters } = this.state;
    const queryParams = new URLSearchParams({
      page: pagination.page,
      limit: pagination.limit,
      sort: filters.sort,
      inStock: filters.inStockOnly ? "true" : "false",
    });

    if (filters.category !== "all")
      queryParams.append("categoryName", filters.category);
    if (filters.searchQuery.trim() !== "")
      queryParams.append("search", filters.searchQuery.trim());
    if (filters.minPrice > 0) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice !== "")
      queryParams.append("maxPrice", filters.maxPrice);
    if (filters.minRating > 0) queryParams.append("rating", filters.minRating);

    return `${CONFIG.API_BASE_URL}/products?${queryParams.toString()}`;
  }

  /**
   * Executes network fetch targeting database collection payloads
   */
  async fetchInventory() {
    const url = this.buildQueryURL();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP target connectivity exception. Status: ${response.status}`,
      );
    }

    const resData = await response.json();
    if (resData?.success) {
      this.state.products = resData.data.products || [];
      this.state.pagination = resData.data.pagination || {
        ...this.DEFAULT_PAGINATION,
      };
      return this.state;
    } else {
      throw new Error(resData?.message || "Invalid payload response format.");
    }
  }
}
export { CONFIG };
