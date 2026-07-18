/*==================================================
HGALLERY PRODUCTS MODULE
Version: 1.0
==================================================*/

export class Products {
  constructor() {
    this.products = [];
    this.filteredProducts = [];

    this.currentPage = 1;
    this.productsPerPage = 12;

    this.searchTerm = "";

    this.selectedCategory = "";

    this.sortBy = "featured";

    this.maxPrice = 100000;

    this.grid = null;
  }

  /*=========================================
    LOAD PRODUCTS
    =========================================*/

  async loadProducts() {
    try {
      const response = await fetch("data/products.json");

      this.products = await response.json();

      this.filteredProducts = [...this.products];

      this.initialize();
    } catch (error) {
      console.error("Unable to load products.", error);
    }
  }

  /*=========================================
    INITIALIZE
    =========================================*/

  initialize() {
    this.grid = document.querySelector("#productsGrid");

    this.bindEvents();

    this.filterProducts();
  }

  /*=========================================
    EVENTS
    =========================================*/

  bindEvents() {
    const search = document.querySelector("#searchInput");

    if (search) {
      search.addEventListener("keyup", (e) => {
        this.searchTerm = e.target.value.toLowerCase();

        this.currentPage = 1;

        this.filterProducts();
      });
    }

    const sort = document.querySelector("#sortProducts");

    if (sort) {
      sort.addEventListener("change", (e) => {
        this.sortBy = e.target.value;

        this.sortProducts();
      });
    }

    const slider = document.querySelector("#priceRange");

    if (slider) {
      slider.addEventListener("input", (e) => {
        this.maxPrice = parseInt(e.target.value);

        document.querySelector("#priceValue").innerHTML = Number(
          this.maxPrice,
        ).toLocaleString();

        this.filterProducts();
      });
    }

    const categories = document.querySelectorAll(
      '.filter-card input[type="checkbox"]',
    );

    categories.forEach((box) => {
      box.addEventListener("change", () => {
        this.collectCategory();
      });
    });
  }

  /*=========================================
    CATEGORY
    =========================================*/

  collectCategory() {
    const checked = [
      ...document.querySelectorAll(
        '.filter-card input[type="checkbox"]:checked',
      ),
    ];

    if (checked.length === 0) {
      this.selectedCategory = "";
    } else {
      this.selectedCategory = checked.map((c) => c.value);
    }

    this.filterProducts();
  }

  /*=========================================
    FILTER
    =========================================*/

  filterProducts() {
    this.filteredProducts = this.products.filter((product) => {
      const searchMatch = product.name
        .toLowerCase()

        .includes(this.searchTerm);

      const categoryMatch =
        this.selectedCategory === "" ||
        this.selectedCategory.includes(product.category);

      const priceMatch = parseFloat(product.price) <= this.maxPrice;

      return searchMatch && categoryMatch && priceMatch;
    });

    this.sortProducts();
  }

  /*=========================================
    SORT
    =========================================*/

  sortProducts() {
    switch (this.sortBy) {
      case "price-low":
        this.filteredProducts.sort((a, b) => a.price - b.price);

        break;

      case "price-high":
        this.filteredProducts.sort((a, b) => b.price - a.price);

        break;

      case "name":
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));

        break;

      default:
        break;
    }

    this.renderProducts();
  }
  /*=========================================
    RENDER PRODUCTS
    =========================================*/

  renderProducts() {
    if (!this.grid) return;

    const start = (this.currentPage - 1) * this.productsPerPage;
    const end = start + this.productsPerPage;

    const pageProducts = this.filteredProducts.slice(start, end);

    if (pageProducts.length === 0) {
      this.grid.innerHTML = `
                <div class="empty-products">

                    <i class="fas fa-box-open"></i>

                    <h2>No Products Found</h2>

                    <p>Try changing your filters or search.</p>

                </div>
            `;

      return;
    }

    this.grid.innerHTML = pageProducts
      .map((product) => this.createCard(product))
      .join("");

    this.renderPagination();

    this.bindCardEvents();
  }

  /*=========================================
    PRODUCT CARD
    =========================================*/

  createCard(product) {
    return `

        <article class="product-card">

            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy">

                <div class="product-overlay"></div>

                <span class="product-badge">

                    ${product.badge || "Premium"}

                </span>

                <div class="product-actions">

                    <a href="#"
                        class="quick-view"
                        data-id="${product.id}">

                        <i class="fas fa-eye"></i>

                    </a>

                    <a href="#"
                        class="wishlist"
                        data-id="${product.id}">

                        <i class="far fa-heart"></i>

                    </a>

                    <a href="#"
                        class="compare"
                        data-id="${product.id}">

                        <i class="fas fa-code-compare"></i>

                    </a>

                </div>

            </div>

            <div class="product-content">

                <span class="product-category">

                    ${product.category}

                </span>

                <h3 class="product-title">

                    <a href="product-details.html?id=${product.id}">

                        ${product.name}

                    </a>

                </h3>

                <p class="product-description">

                    ${product.description}

                </p>

                <div class="product-rating">

                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>

                    <span>

                        (${product.reviews || 0})

                    </span>

                </div>

                <div class="product-price">

                    <span class="current-price">

                        KSh ${Number(product.price).toLocaleString()}

                    </span>

                </div>

                <div class="product-footer">

                    <a
                        class="add-cart"
                        target="_blank"
                        href="https://wa.me/254726335283?text=Hello%20HGALLERY,%20I%20would%20like%20to%20request%20a%20quote%20for%20${encodeURIComponent(product.name)}">

                        <i class="fab fa-whatsapp"></i>

                        Quote

                    </a>

                    <a
                        href="product-details.html?id=${product.id}"
                        class="view-product">

                        <i class="fas fa-arrow-right"></i>

                    </a>

                </div>

            </div>

        </article>

        `;
  }

  /*=========================================
    CARD EVENTS
    =========================================*/

  bindCardEvents() {
    document
      .querySelectorAll(".quick-view")

      .forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();

          const id = Number(button.dataset.id);

          this.openQuickView(id);
        });
      });
  }

  /*=========================================
    QUICK VIEW
    =========================================*/

  openQuickView(id) {
    const product = this.products.find((item) => item.id === id);

    if (!product) return;

    const modal = document.querySelector("#quickViewModal");

    document.querySelector("#modalProductImage").src = product.image;

    document.querySelector("#modalProductImage").alt = product.name;

    document.querySelector("#modalCategory").textContent = product.category;

    document.querySelector("#modalTitle").textContent = product.name;

    document.querySelector("#modalPrice").textContent =
      "KSh " + Number(product.price).toLocaleString();

    document.querySelector("#modalDescription").textContent =
      product.description;

    document.querySelector("#modalDetails").href =
      `product-details.html?id=${product.id}`;

    document.querySelector("#modalWhatsapp").href =
      `https://wa.me/254726335283?text=${encodeURIComponent(
        "Hello HGALLERY, I would like a quotation for " + product.name,
      )}`;

    modal.classList.add("active");

    document.body.style.overflow = "hidden";
  }

  /*=========================================
    CLOSE MODAL
    =========================================*/

  closeQuickView() {
    const modal = document.querySelector("#quickViewModal");

    modal.classList.remove("active");

    document.body.style.overflow = "";
  }

  /*=========================================
    MODAL EVENTS
    =========================================*/

  bindModalEvents() {
    const closeButton = document.querySelector("#closeModal");

    const overlay = document.querySelector(".modal-overlay");

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        this.closeQuickView();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", () => {
        this.closeQuickView();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeQuickView();
      }
    });
  }

  /*=========================================
    PAGINATION
    =========================================*/

  renderPagination() {
    const pagination = document.querySelector(".pagination");

    if (!pagination) return;

    const totalPages = Math.ceil(
      this.filteredProducts.length / this.productsPerPage,
    );

    if (totalPages <= 1) {
      pagination.innerHTML = "";

      return;
    }

    let html = "";

    html += `
        <button class="page-btn prev-page"
        ${this.currentPage === 1 ? "disabled" : ""}>

            <i class="fas fa-angle-left"></i>

        </button>
        `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
            <button
                class="page-btn ${i === this.currentPage ? "active" : ""}"
                data-page="${i}">

                ${i}

            </button>
            `;
    }

    html += `
        <button class="page-btn next-page"
        ${this.currentPage === totalPages ? "disabled" : ""}>

            <i class="fas fa-angle-right"></i>

        </button>
        `;

    pagination.innerHTML = html;

    this.bindPaginationEvents();
  }

  /*=========================================
    PAGINATION EVENTS
    =========================================*/

  bindPaginationEvents() {
    document.querySelectorAll(".page-btn").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.classList.contains("prev-page")) {
          if (this.currentPage > 1) {
            this.currentPage--;
          }
        } else if (button.classList.contains("next-page")) {
          const total = Math.ceil(
            this.filteredProducts.length / this.productsPerPage,
          );

          if (this.currentPage < total) {
            this.currentPage++;
          }
        } else {
          this.currentPage = parseInt(button.dataset.page);
        }

        this.renderProducts();

        window.scrollTo({
          top: 0,

          behavior: "smooth",
        });
      });
    });
  }

  /*=========================================
    WISHLIST
    =========================================*/

  addToWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (!wishlist.includes(id)) {
      wishlist.push(id);

      localStorage.setItem(
        "wishlist",

        JSON.stringify(wishlist),
      );

      this.showToast("Added to wishlist");
    } else {
      this.showToast("Already in wishlist");
    }
  }

  bindWishlistEvents() {
    document
      .querySelectorAll(".wishlist")

      .forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();

          this.addToWishlist(Number(button.dataset.id));
        });
      });
  }

  /*=========================================
    COMPARE
    =========================================*/

  addToCompare(id) {
    let compare = JSON.parse(localStorage.getItem("compare")) || [];

    if (!compare.includes(id)) {
      if (compare.length >= 4) {
        compare.shift();
      }

      compare.push(id);

      localStorage.setItem(
        "compare",

        JSON.stringify(compare),
      );

      this.showToast("Added to compare");
    }
  }

  bindCompareEvents() {
    document
      .querySelectorAll(".compare")

      .forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();

          this.addToCompare(Number(button.dataset.id));
        });
      });
  }

  /*=========================================
    TOAST MESSAGE
    =========================================*/

  showToast(message) {
    let toast = document.createElement("div");

    toast.className = "toast-message";

    toast.innerHTML = `

            <i class="fas fa-check-circle"></i>

            ${message}

        `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");

      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2500);
  }

  /*=========================================
    LAZY IMAGE LOADING
    =========================================*/

  lazyLoadImages() {
    const images = document.querySelectorAll("img[loading='lazy']");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("loaded");

          observer.unobserve(entry.target);
        }
      });
    });

    images.forEach((img) => observer.observe(img));
  }

  /*=========================================
    INITIALIZE COMPONENTS
    =========================================*/

  initializeComponents() {
    this.bindModalEvents();

    this.bindWishlistEvents();

    this.bindCompareEvents();

    this.lazyLoadImages();
  }
}

/*=========================================
AUTO START
=========================================*/

document.addEventListener("DOMContentLoaded", async () => {
  const products = new Products();

  await products.loadProducts();

  products.initializeComponents();
});
