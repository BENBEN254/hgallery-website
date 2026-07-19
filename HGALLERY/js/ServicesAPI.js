/**
 * Services API Service Core
 * Manages remote backend fetch streams and collection data normalization.
 */

export const SERVICES_CONFIG = {
  // Dynamically determines environment context to avoid breaking live productions
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://your-live-backend-url.com', // Replace with your actual live deployed API production endpoint
  DEFAULT_IMAGE: "assets/images/why-us.jpg"
};

export class ServicesAPI {
  constructor() {
    this.services = [];
  }

  /**
   * Fetches active services from backend database clusters
   */
  async fetchServices() {
    const url = `${SERVICES_CONFIG.API_BASE_URL}/services`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP target connectivity exception. Status: ${response.status}`);
    }

    const resData = await response.json();
    if (resData?.success) {
      this.services = resData.data || [];
      return this.services;
    }
    
    throw new Error(resData?.message || "Malformed endpoint payload schema.");
  }
}

