/**
 * Cart UI Layout Controller Module
 * Handles secure HTML construction templates and high-performance click delegation structures.
 */
import { CartData } from "./CartData.js";

export class Cart {
  constructor() {
    this.data = new CartData();
    this.dom = {};
    this.init();
  }

  init() {
    this.cacheDOM();
    this.updateUI();
    this.renderCartPage();
    this.setupEventDelegation();
  }

  cacheDOM() {
    this.dom.container = document.getElementById("cartContent");
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

  updateUI() {
    const badges = document.querySelectorAll(".cart-badge, .badge, .count");
    const countVal = this.data.count;
    const displayStyle = countVal > 0 ? "flex" : "none";

    badges.forEach((badge) => {
      badge.textContent = countVal;
      badge.style.display = displayStyle;
    });
  }

  setupEventDelegation() {
    // 1. Structural delegation capture for main active page container inputs
    this.dom.container?.addEventListener("click", (e) => {
      const qtyBtn = e.target.closest(".qty-btn");
      const removeBtn = e.target.closest(".remove-btn");
      const clearBtn = e.target.closest("#clearCart");

      if (qtyBtn) {
        e.preventDefault();
        const id = qtyBtn.dataset.id;
        const input = this.dom.container.querySelector(
          `.qty-input[data-id="${id}"]`,
        );
        if (!input) return;

        let currentQty = parseInt(input.value, 10) || 1;
        currentQty =
          qtyBtn.dataset.action === "increase"
            ? currentQty + 1
            : Math.max(1, currentQty - 1);

        this.data.updateQuantity(id, currentQty);
        this.updateUI();
        this.renderCartPage();
        return;
      }

      if (removeBtn) {
        e.preventDefault();
        this.data.removeItem(removeBtn.dataset.id);
        this.updateUI();
        this.renderCartPage();
        return;
      }

      if (clearBtn && confirm("Are you sure you want to clear your cart?")) {
        e.preventDefault();
        this.data.clearCart();
        this.updateUI();
        this.renderCartPage();
      }
    });

    // Handle typing inputs safely inside the summary table fields
    this.dom.container?.addEventListener("change", (e) => {
      if (e.target.matches(".qty-input")) {
        const id = e.target.dataset.id;
        const targetValue = Math.max(1, parseInt(e.target.value, 10) || 1);
        this.data.updateQuantity(id, targetValue);
        this.updateUI();
        this.renderCartPage();
      }
    });

    // 2. Body-level delegation listener hook catching any generic grid catalog add-to-cart clicks
    document.body.addEventListener("click", (e) => {
      const catalogAddBtn = e.target.closest(".add-to-cart");
      if (!catalogAddBtn) return;

      e.preventDefault();
      const product = {
        id: catalogAddBtn.dataset.id,
        name: catalogAddBtn.dataset.name || "Premium Item",
        price: Number(catalogAddBtn.dataset.price) || 0,
        image: catalogAddBtn.dataset.image,
      };

      const selectedQuantityInput = document.getElementById("qtyInput");
      const chosenQuantity = selectedQuantityInput
        ? parseInt(selectedQuantityInput.value, 10) || 1
        : 1;

      this.data.addItem(product, chosenQuantity);
      this.updateUI();
      this.showNotification(`${product.name} added to cart!`);
    });
  }

  renderCartPage() {
    if (!this.dom.container) return;

    if (this.data.items.length === 0) {
      this.dom.container.innerHTML = `
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

    this.data.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      const cleanName = this.escapeHTML(item.name);

      html += `
        <tr>
          <td>
            <div class="product-info">
              <img src="${item.image}" alt="${cleanName}" loading="lazy">
              <span>${cleanName}</span>
            </div>
          </td>
          <td>KSh ${item.price.toLocaleString()}</td>
          <td>
            <div class="quantity-controller-wrapper" style="display:flex; align-items:center;">
              <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
              <input type="number" class="qty-input" value="${item.quantity}" min="1" data-id="${item.id}" style="width:50px; text-align:center; margin:0 5px;">
              <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
            </div>
          </td>
          <td>KSh ${itemTotal.toLocaleString()}</td>
          <td>
            <button class="remove-btn" data-id="${item.id}" aria-label="Remove item"><i class="fas fa-trash-alt"></i></button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
      <div class="cart-summary" style="margin-top: 2rem;">
        <div class="summary-row" style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <span>Subtotal</span>
          <span>KSh ${this.data.total.toLocaleString()}</span>
        </div>
        <div class="summary-row" style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <span>Delivery</span>
          <span>Calculated at checkout</span>
        </div>
        <div class="summary-row total" style="display:flex; justify-content:space-between; font-weight:700; font-size:1.2rem; margin-top:1rem; border-top:1px solid #ddd; padding-top:1rem;">
          <span>Total</span>
          <span>KSh ${this.data.total.toLocaleString()}</span>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
          <a href="checkout.html" class="btn btn-primary">Proceed to Checkout</a>
          <button class="btn btn-outline" id="clearCart">Clear Cart</button>
          <a href="products.html" class="btn btn-outline">Continue Shopping</a>
        </div>
      </div>
    `;

    this.dom.container.innerHTML = html;
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
      max-width: 400px;
    `;
    notification.innerHTML = `
      <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
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
