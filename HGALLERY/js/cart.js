/**
 * Cart Module
 * Handles shopping cart functionality with localStorage
 */

export class Cart {
  constructor() {
    this.items = [];
    this.total = 0;
    this.count = 0;
    this.loadCart();
    this.init();
  }

  init() {
    this.updateUI();
    this.renderCartPage();
    this.setupEventListeners();
  }

  loadCart() {
    try {
      const data = localStorage.getItem("hgallery_cart");
      if (data) {
        const parsed = JSON.parse(data);
        this.items = parsed.items || [];
        this.total = parsed.total || 0;
        this.count = parsed.count || 0;
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      this.items = [];
      this.total = 0;
      this.count = 0;
    }
  }

  saveCart() {
    try {
      localStorage.setItem(
        "hgallery_cart",
        JSON.stringify({
          items: this.items,
          total: this.total,
          count: this.count,
        }),
      );
      this.updateUI();
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }

  addItem(product, quantity = 1) {
    const existing = this.items.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "/assets/images/products/placeholder.jpg",
        quantity: quantity,
      });
    }

    this.recalculate();
    this.saveCart();
    this.showNotification(`${product.name} added to cart!`);
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.recalculate();
    this.saveCart();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find((item) => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.recalculate();
      this.saveCart();
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
    this.saveCart();
  }

  updateUI() {
    // Update badge
    const badges = document.querySelectorAll(".cart-badge, .badge");
    badges.forEach((badge) => {
      badge.textContent = this.count;
      badge.style.display = this.count > 0 ? "flex" : "none";
    });
  }

  renderCartPage() {
    const container = document.querySelector("#cartContent");
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-bag"></i>
          <h3>Your cart is empty</h3>
          <p>Browse our products and add items to your cart</p>
          <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">Start Shopping</a>
        </div>
      `;
      return;
    }

    let html = `
      <table class="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
    `;

    this.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      html += `
        <tr>
          <td>
            <div class="product-info">
              <img src="${item.image}" alt="${item.name}" loading="lazy">
              <span>${item.name}</span>
            </div>
          </td>
          <td>KSh ${item.price.toLocaleString()}</td>
          <td>
            <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
            <input type="number" class="qty-input" value="${item.quantity}" min="1" data-id="${item.id}">
            <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
          </td>
          <td>KSh ${itemTotal.toLocaleString()}</td>
          <td>
            <button class="remove-btn" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>KSh ${this.total.toLocaleString()}</span>
        </div>
        <div class="summary-row">
          <span>Delivery</span>
          <span>Calculated at checkout</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>KSh ${this.total.toLocaleString()}</span>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
          <a href="checkout.html" class="btn btn-primary">Proceed to Checkout</a>
          <button class="btn btn-outline" id="clearCart">Clear Cart</button>
          <a href="products.html" class="btn btn-outline">Continue Shopping</a>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Event listeners
    container.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const input = container.querySelector(`.qty-input[data-id="${id}"]`);
        let qty = parseInt(input.value) || 1;

        if (btn.dataset.action === "increase") {
          qty += 1;
        } else {
          qty = Math.max(1, qty - 1);
        }

        this.updateQuantity(id, qty);
        this.renderCartPage();
      });
    });

    container.querySelectorAll(".qty-input").forEach((input) => {
      input.addEventListener("change", () => {
        const id = parseInt(input.dataset.id);
        const qty = parseInt(input.value) || 1;
        this.updateQuantity(id, qty);
        this.renderCartPage();
      });
    });

    container.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        this.removeItem(id);
        this.renderCartPage();
      });
    });

    const clearBtn = container.querySelector("#clearCart");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your cart?")) {
          this.clearCart();
          this.renderCartPage();
        }
      });
    }
  }

  setupEventListeners() {
    // Add to cart buttons
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const product = {
          id: parseInt(btn.dataset.id) || 1,
          name: btn.dataset.name || "Product",
          price: parseInt(btn.dataset.price) || 0,
          image: btn.dataset.image || "/assets/images/products/placeholder.jpg",
        };
        const qty = parseInt(document.querySelector("#qtyInput")?.value) || 1;
        this.addItem(product, qty);
      });
    });
  }

  showNotification(message) {
    const existing = document.querySelector(".cart-notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--primary);
      color: var(--white);
      padding: 1rem 2rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      animation: slideUp 0.3s ease;
      max-width: 400px;
    `;
    notification.innerHTML = `
      <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
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
