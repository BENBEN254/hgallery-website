/**
 * Blog API Service Core
 * Manages remote backend articles lookups and environment configurations.
 */

export const BLOG_CONFIG = {
  // Gracefully routes queries between your local staging environment and Netlify production environment
  API_BASE_URL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000/api"
      : "https://your-live-backend-url.com", // Replace with your actual live deployed API production endpoint
  DEFAULT_COVER: "assets/images/hero.jpg",
};

export class BlogAPI {
  constructor() {
    this.articles = [];
  }

  /**
   * Fetches published blog posts from backend database server models
   */
  async fetchArticles() {
    const url = `${BLOG_CONFIG.API_BASE_URL}/blog`;
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
      this.articles = resData.data || [];
      return this.articles;
    }

    throw new Error(resData?.message || "Malformed endpoint editorial schema.");
  }
}
