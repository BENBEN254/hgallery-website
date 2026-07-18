/**
 * Wishlist Module
 * Handles wishlist functionality with localStorage
 */

export class Wishlist {
  constructor() {
    this.items = [];
    this.loadWishlist();
    this.init();
  }

  init() {
    this.renderWishlistPage();
    this.setupEventListeners();
  }

  loadWishlist() {
    try {
      const data = localStorage.getItem("hgallery_wishlist");
      this.items = data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading wishlist:", error);
      this.items = [];
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem("hgallery_wishlist", JSON.stringify(this.items));
    } catch (error) {
      console.error("Error saving wishlist:", error);
    }
  }

  addItem(product) {
    if (!this.items.find((item) => item.id === product.id)) {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "/assets/images/products/placeholder.jpg",
      });
      this.saveWishlist();
      this.showNotification(`${product.name} added to wishlist!`);
    } else {
      this.showNotification(`${product.name} is already in your wishlist`);
    }
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveWishlist();
    this.renderWishlistPage();
  }

  isInWishlist(productId) {
    return this.items.some((item) => item.id === productId);
  }

  renderWishlistPage() {
    const container = document.querySelector("#wishlistContent");
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
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
    this.items.forEach((item) => {
      html += `
        <div class="wishlist-item">
          <button class="remove" data-id="${item.id}" aria-label="Remove from wishlist">
            <i class="fas fa-times"></i>
          </button>
          <div class="image">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
          </div>
          <div class="body">
            <h4>${item.name}</h4>
            <div class="price">KSh ${item.price.toLocaleString()}</div>
            <button class="btn btn-primary add-to-cart" style="width: 100%; margin-top: 0.8rem; padding: 0.5rem;" 
                    data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">
              <i class="fas fa-shopping-bag"></i> Add to Cart
            </button>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    container.innerHTML = html;

    // Remove buttons
    container.querySelectorAll(".remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        this.removeItem(id);
      });
    });

    // Add to cart buttons
    container.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = {
          id: parseInt(btn.dataset.id),
          name: btn.dataset.name,
          price: parseInt(btn.dataset.price),
          image: btn.dataset.image,
        };
        window.app?.cart?.addItem(product);
      });
    });
  }

  setupEventListeners() {
    // Wishlist toggle buttons
    document
      .querySelectorAll(".add-to-wishlist, .wishlist-toggle")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const product = {
            id: parseInt(btn.dataset.id) || 1,
            name: btn.dataset.name || "Product",
            price: parseInt(btn.dataset.price) || 0,
            image:
              btn.dataset.image || "/assets/images/products/placeholder.jpg",
          };
          this.addItem(product);

          // Update heart icon
          const icon = btn.querySelector("i");
          if (icon) {
            icon.classList.toggle("fas");
            icon.classList.toggle("far");
          }
        });
      });
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
      animation: slideUp 0.3s ease;
      max-width: 400px;
    `;
    notification.innerHTML = `
      <i class="fas fa-heart" style="margin-right: 0.5rem; color: var(--accent);"></i>
      ${message}
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
