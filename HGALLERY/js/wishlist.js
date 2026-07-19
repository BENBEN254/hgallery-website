/**
 * Wishlist UI Controller Module
 * Handles safe string interpolation, event delegation targets, and popups.
 */
import { WishlistData } from "./WishlistData.js";

export class Wishlist {
  constructor() {
    this.data = new WishlistData();
    this.dom = {};
    this.init();
  }

  init() {
    this.cacheDOM();
    this.renderWishlistPage();
    this.setupEventDelegation();
  }

  cacheDOM() {
    this.dom.container = document.getElementById("wishlistContent");
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

  setupEventDelegation() {
    // High-Performance Delegation: Single click listener hook catches any interaction
    if (this.dom.container) {
      this.dom.container.addEventListener("click", (e) => {
        const removeBtn = e.target.closest(".remove");
        const cartBtn = e.target.closest(".add-to-cart");

        if (removeBtn) {
          e.preventDefault();
          this.data.removeItem(removeBtn.dataset.id);
          this.renderWishlistPage();
          return;
        }

        if (cartBtn) {
          e.preventDefault();
          const targetItem = {
            id: cartBtn.dataset.id,
            name: cartBtn.dataset.name,
            price: Number(cartBtn.dataset.price) || 0,
            image: cartBtn.dataset.image,
          };
          // Cross-module execution bridge to hook your global cart instances
          window.app?.cart?.addItem(targetItem);
        }
      });
    }

    // Dynamic global catalog product toggles binding
    document.body.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest(".add-to-wishlist, .wishlist-toggle");
      if (!toggleBtn) return;

      e.preventDefault();
      const product = {
        id: toggleBtn.dataset.id || "1",
        name: toggleBtn.dataset.name || "Product",
        price: toggleBtn.dataset.price || "0",
        image:
          toggleBtn.dataset.image || "/assets/images/products/placeholder.jpg",
      };

      const operation = this.data.addItem(product);
      this.showNotification(operation.msg);

      if (operation.success) {
        const icon = toggleBtn.querySelector("i");
        if (icon) {
          icon.classList.remove("far");
          icon.classList.add("fas");
        }
      }
    });
  }

  renderWishlistPage() {
    if (!this.dom.container) return;

    if (this.data.items.length === 0) {
      this.dom.container.innerHTML = `
        <div class="empty-wishlist">
          <i class="fas fa-heart"></i>
          <h3>Your wishlist is empty</h3>
          <p>Save your favorite products for later</p>
          <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Products</a>
        </div>
      `;
      return;
    }

    let html = `<div class="wishlist-grid">`;
    this.data.items.forEach((item) => {
      const sanitizedName = this.escapeHTML(item.name);

      html += `
        <div class="wishlist-item">
          <button class="remove" data-id="${item.id}" aria-label="Remove item">
            <i class="fas fa-times"></i>
          </button>
          <div class="image">
            <img src="${item.image}" alt="${sanitizedName}" loading="lazy">
          </div>
          <div class="body">
            <h4>${sanitizedName}</h4>
            <div class="price">KSh ${Number(item.price).toLocaleString()}</div>
            <button class="btn btn-primary add-to-cart" style="width: 100%; margin-top: 0.8rem; padding: 0.5rem;" 
                    data-id="${item.id}" data-name="${sanitizedName}" data-price="${item.price}" data-image="${item.image}">
              <i class="fas fa-shopping-bag"></i> Add to Cart
            </button>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    this.dom.container.innerHTML = html;
  }

  showNotification(message) {
    const existing = document.querySelector(".wishlist-notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.className = "wishlist-notification";
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--secondary);
      color: var(--white);
      padding: 1rem 2rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      max-width: 400px;
    `;
    notification.innerHTML = `
      <i class="fas fa-heart" style="margin-right: 0.5rem; color: var(--accent);"></i>
      ${this.escapeHTML(message)}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(20px)";
      notification.style.transition = "all 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}
