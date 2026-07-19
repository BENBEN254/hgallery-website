/**
 * Projects API Service Core
 * Manages remote backend portfolio lookups and endpoint state configuration.
 */

export const PROJECTS_CONFIG = {
  // Gracefully routes queries between your local staging environment and Netlify production environment
  API_BASE_URL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000/api"
      : "https://your-live-backend-url.com", // Replace with your actual live deployed API production endpoint
  DEFAULT_HERO: "assets/images/hero.jpg",
};

export class ProjectsAPI {
  constructor() {
    this.projects = [];
  }

  /**
   * Fetches published showcase portfolio assets from backend server models
   */
  async fetchPortfolio() {
    const url = `${PROJECTS_CONFIG.API_BASE_URL}/projects`;
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
      this.projects = resData.data || [];
      return this.projects;
    }

    throw new Error(resData?.message || "Malformed endpoint portfolio schema.");
  }
}
