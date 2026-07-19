/**
 * Search API Service Core
 * Manages remote backend query orchestration and text indexing.
 */

export const SEARCH_CONFIG = {
  // Dynamically determines environment context to avoid breaking live productions
  API_BASE_URL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000/api"
      : "https://your-live-backend-url.com", // Replace with your actual live deployed API production endpoint
  DEFAULT_PLACEHOLDER: "assets/images/placeholder.jpg",
};

export class SearchAPI {
  /**
   * Queries database engine using text matching pipelines
   * @param {string} query
   */
  async queryCluster(query) {
    if (!query || query.trim().length < 2) return [];

    const url = `${SEARCH_CONFIG.API_BASE_URL}/products?search=${encodeURIComponent(query.trim())}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error("Search query processing failure.");

    const resData = await response.json();
    if (resData?.success) {
      return resData.data.products || [];
    }

    throw new Error(resData?.message || "Malformed endpoint payload schema.");
  }
}
