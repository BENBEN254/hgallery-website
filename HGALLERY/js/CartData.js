/**
 * Cart Transactional Storage Module
 * Handles structural cart mathematical logic calculations, data storage mutations, and persistence.
 */

export class CartData {
  constructor() {
    this.storageKey = "hgallery_cart";
    this.items = [];
    this.total = 0;
    this.count = 0;
    this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.items = parsed.items || [];
        this.total = Number(parsed.total) || 0;
        this.count = Number(parsed.count) || 0;
      }
    } catch (error) {
      console.error("Local storage lookup exception:", error);
      this.clearLocalMemory();
    }
  }

  save() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          items: this.items,
          total: this.total,
          count: this.count,
        }),
      );
    } catch (error) {
      console.error("Local storage save exception:", error);
    }
  }

  addItem(product, quantity = 1) {
    const stringId = String(product.id);
    const existing = this.items.find((item) => String(item.id) === stringId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: stringId,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image || "/assets/images/products/placeholder.jpg",
        quantity: Math.max(1, quantity),
      });
    }

    this.recalculate();
    this.save();
  }

  removeItem(productId) {
    const stringId = String(productId);
    this.items = this.items.filter((item) => String(item.id) !== stringId);
    this.recalculate();
    this.save();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(
      (item) => String(item.id) === String(productId),
    );
    if (item) {
      item.quantity = Math.max(1, parseInt(quantity, 10) || 1);
      this.recalculate();
      this.save();
    }
  }

  recalculate() {
    this.total = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    this.count = this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  clearCart() {
    this.items = [];
    this.total = 0;
    this.count = 0;
    this.save();
  }

  clearLocalMemory() {
    this.items = [];
    this.total = 0;
    this.count = 0;
  }
}
