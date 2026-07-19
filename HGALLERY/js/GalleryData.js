/**
 * Gallery Data Stream Module
 * Manages atomic data fetching arrays and cache calculations.
 */

export class GalleryData {
  constructor() {
    this.endpoint = "/data/gallery.json";
    this.items = [];
    this.activeFilter = "all";
  }

  /**
   * Loads gallery entries from structural JSON datasets
   */
  async fetchItems() {
    try {
      const response = await fetch(this.endpoint);
      if (!response.ok) throw new Error(`HTTP fetch error: ${response.status}`);

      const data = await response.json();
      this.items = data.gallery || [];
      return this.items;
    } catch (error) {
      console.error("Gallery file loading exception:", error);
      this.items = [];
      return [];
    }
  }

  /**
   * Filters product items based on active category selection properties
   */
  getFilteredItems() {
    if (this.activeFilter === "all") return this.items;
    return this.items.filter((item) => item.category === this.activeFilter);
  }

  /**
   * Fast structural lookup tool to target specific items by id string
   */
  findItem(id) {
    const stringId = String(id);
    return this.items.find((item) => String(item.id) === stringId);
  }
}
