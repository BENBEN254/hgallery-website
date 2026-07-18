/**
 * Blog Module - Dynamic News & Article Management
 * Built by Senior Dev for Real-Time Database Synergy
 */

export class BlogFeed {
  constructor() {
    this.articles = [];
    this.init();
  }

  async init() {
    await this.loadArticles();
    // Render all blog cards onto page grids on load context
    this.renderArticles();
  }

  // ==========================================================
  // DYNAMIC BLOG API CONNECTION ENGINE
  // ==========================================================
  async loadArticles() {
    try {
      // Connects directly to the live Node.js Express blog endpoint
      const response = await fetch("http://localhost:5000/api/blog");

      if (!response.ok) {
        throw new Error(`HTTP network error status: ${response.status}`);
      }

      const resData = await response.json();

      if (resData.success) {
        // Unpack database object payload records cleanly
        this.articles = resData.data || [];
      }
    } catch (error) {
      console.error("Unable to query active blog posts:", error);
      this.showError(
        "Failed to update news feed. Please check server configurations.",
      );
    }
  }

  // ==========================================================
  // RENDER EDITORIAL CARDS ONTO DISPLAY GRID
  // ==========================================================
  renderArticles() {
    const container = document.getElementById("blogGrid");
    if (!container) return; // Exit cleanly if the current page template doesn't include a blog grid

    if (this.articles.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:var(--text-muted); width:100%; grid-column:1/-1; padding:40px;">No articles or news updates have been published yet.</p>`;
      return;
    }

    container.innerHTML = this.articles
      .map((article) => {
        const articleId = article._id || article.id;
        const coverImage = article.coverImage || "assets/images/hero.jpg";

        // Format document timestamps beautifully into local human readable dates
        const publishDate = article.createdAt
          ? new Date(article.createdAt).toLocaleDateString("en-KE", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Recent Post";

        // Join dynamic tag strings into modular chips layout blocks
        const tagChips = (article.tags || [])
          .map((tag) => `<span class="blog-tag-chip">${tag}</span>`)
          .join("");

        return `
          <div class="blog-card fade-up">
            <div class="blog-card-image">
              <img src="${coverImage}" alt="${article.title}" loading="lazy" onerror="this.src='assets/images/hero.jpg'">
              <div class="blog-date-badge">${publishDate}</div>
            </div>
            <div class="blog-card-content">
              <div class="blog-tags-container">${tagChips}</div>
              <h3><a href="blog-post.html?slug=${article.slug || articleId}">${article.title}</a></h3>
              <p>${article.summary || article.content.substring(0, 150) + "..."}</p>
              <div class="blog-card-footer">
                <span class="blog-author"><i class="far fa-user"></i> By ${article.author || "Admin"}</span>
                <a href="blog-post.html?slug=${article.slug || articleId}" class="blog-read-more">
                  Read Article <i class="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  showError(message) {
    const container = document.getElementById("blogGrid");
    if (container) {
      container.innerHTML = `<div class="error-msg" style="color:var(--danger); width:100%; grid-column:1/-1; text-align:center; padding:30px;">${message}</div>`;
    }
  }
}

// Instantiate module tracking framework components safely
document.addEventListener("DOMContentLoaded", () => {
  window.BlogFeedInstance = new BlogFeed();
});
