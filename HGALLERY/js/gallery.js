/**
 * Gallery UI View Module
 * Handles high performance image category matching and hardware accelerated modal animations.
 */
import { GalleryData } from "./GalleryData.js";

export class Gallery {
  constructor() {
    this.data = new GalleryData();
    this.dom = {};
    this.init();
  }

  async init() {
    this.cacheDOM();
    this.setupLightboxListeners();

    // Concurrently fetch catalog items before building visual layouts
    await this.data.fetchItems();
    this.renderGalleryGrid();
    this.setupFilterDelegation();
  }

  cacheDOM() {
    this.dom.grid = document.getElementById("galleryGrid");
    this.dom.filterContainer = document.getElementById("galleryFilter");
    this.dom.lightbox = document.getElementById("lightbox");
    this.dom.lightboxClose = document.getElementById("lightboxClose");
    this.dom.lightboxImage = document.getElementById("lightboxImage");
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

  renderGalleryGrid() {
    if (!this.dom.grid) return;

    const visibleItems = this.data.getFilteredItems();

    if (visibleItems.length === 0) {
      this.dom.grid.innerHTML = `
        <div class="gallery-empty" style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">
          <p>No images found in this category</p>
        </div>
      `;
      return;
    }

    // Optimization: Build unified layouts once without regenerating listener arrays on children
    this.dom.grid.innerHTML = visibleItems
      .map(
        (item) => `
      <div class="gallery-item" data-id="${item.id}" data-category="${item.category}" style="cursor: pointer;">
        <img src="${item.image}" alt="${this.escapeHTML(item.title)}" loading="lazy">
        <div class="overlay">
          <i class="fas fa-expand"></i>
        </div>
      </div>
    `,
      )
      .join("");
  }

  setupFilterDelegation() {
    // High-performance event delegation replaces individual button iteration loops
    this.dom.filterContainer?.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;

      e.preventDefault();

      // Clear layout toggles inside targeted filter categories element trees
      this.dom.filterContainer
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("active"));
      button.classList.add("active");

      this.data.activeFilter = button.dataset.filter || "all";
      this.renderGalleryGrid();
    });

    // Centralized Grid Listeners: Grid catches single clicks on nested items
    this.dom.grid?.addEventListener("click", (e) => {
      const itemCard = e.target.closest(".gallery-item");
      if (!itemCard) return;

      const matchedAsset = this.data.findItem(itemCard.dataset.id);
      if (matchedAsset) {
        this.openLightboxView(matchedAsset.image, matchedAsset.title);
      }
    });
  }

  setupLightboxListeners() {
    const { lightbox, lightboxClose } = this.dom;
    if (!lightbox) return;

    lightboxClose?.addEventListener("click", () => this.closeLightboxView());

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) this.closeLightboxView();
    });

    // Optimization: Single execution point for keyboard handlers
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("active")) {
        this.closeLightboxView();
      }
    });
  }

  openLightboxView(src, alt) {
    const { lightbox, lightboxImage } = this.dom;
    if (!lightbox || !lightboxImage) return;

    lightboxImage.src = src;
    lightboxImage.alt = alt || "Gallery asset inspection panel";

    lightbox.classList.add("active");

    // Layout optimization strategy: Freeze base scrolling mechanics while inspect layouts are mounted
    document.body.style.overflow = "hidden";
  }

  closeLightboxView() {
    if (this.dom.lightbox) {
      this.dom.lightbox.classList.remove("active");
      document.body.style.overflow = ""; // Re-enable touch paths across base documents safely
    }
  }
}
