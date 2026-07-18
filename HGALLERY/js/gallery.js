/**
 * Gallery Module
 * Handles gallery with filtering and lightbox
 */

export class Gallery {
  constructor() {
    this.items = [];
    this.filter = "all";
    this.init();
  }

  async init() {
    await this.loadGallery();
    this.renderGallery();
    this.setupFilters();
    this.setupLightbox();
  }

  async loadGallery() {
    try {
      const response = await fetch("/data/gallery.json");
      const data = await response.json();
      this.items = data.gallery || [];
    } catch (error) {
      console.error("Error loading gallery:", error);
      this.items = [];
    }
  }

  renderGallery() {
    const container = document.querySelector("#galleryGrid");
    if (!container) return;

    const filtered =
      this.filter === "all"
        ? this.items
        : this.items.filter((item) => item.category === this.filter);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="gallery-empty">
          <p>No images found in this category</p>
        </div>
      `;
      return;
    }

    let html = "";
    filtered.forEach((item) => {
      html += `
        <div class="gallery-item" data-id="${item.id}" data-category="${item.category}">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <div class="overlay">
            <i class="fas fa-expand"></i>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Click to open lightbox
    container.querySelectorAll(".gallery-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = parseInt(item.dataset.id);
        const galleryItem = this.items.find((g) => g.id === id);
        if (galleryItem) {
          this.openLightbox(galleryItem.image, galleryItem.title);
        }
      });
    });
  }

  setupFilters() {
    const buttons = document.querySelectorAll("#galleryFilter button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.filter = btn.dataset.filter;
        this.renderGallery();
      });
    });
  }

  setupLightbox() {
    const lightbox = document.querySelector("#lightbox");
    const close = document.querySelector("#lightboxClose");
    const image = document.querySelector("#lightboxImage");

    if (!lightbox || !close || !image) return;

    close.addEventListener("click", () => {
      lightbox.classList.remove("active");
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove("active");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        lightbox.classList.remove("active");
      }
    });
  }

  openLightbox(src, alt) {
    const lightbox = document.querySelector("#lightbox");
    const image = document.querySelector("#lightboxImage");

    if (lightbox && image) {
      image.src = src;
      image.alt = alt || "Gallery image";
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }
}
