/**
 * Wishlist Storage Module
 * Manages atomic data changes, item states, and safe ID parsing.
 */

export class WishlistData {
  constructor() {
    this.storageKey = "hgallery_wishlist";
    this.items = [];
    this.load();
  }

  load() {
    try {
      const rawData = localStorage.getItem(this.storageKey);
      this.items = rawData ? JSON.parse(rawData) : [];
    } catch (error) {
      console.error("Local storage lookup exception:", error);
      this.items = [];
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (error) {
      console.error("Local storage write mutation exception:", error);
    }
  }

  /**
   * Appends product configurations safely supporting string ObjectIDs
   */
  addItem(product) {
    const stringId = String(product.id);
    const exists = this.items.some((item) => String(item.id) === stringId);

    if (exists)
      return { success: false, msg: `${product.name} is already saved.` };

    this.items.push({
      id: stringId, // Cast cleanly to handle both sequential integers and MongoDB ObjectIDs
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || "/assets/images/products/placeholder.jpg",
    });

    this.save();
    return { success: true, msg: `${product.name} added to favorites!` };
  }

  removeItem(productId) {
    const stringId = String(productId);
    this.items = this.items.filter((item) => String(item.id) !== stringId);
    this.save();
  }

  hasItem(productId) {
    return this.items.some((item) => String(item.id) === String(productId));
  }
}
