/**
 * Blog UI Layout Controller
 * Handles secure HTML template parsing, localized date formatting, and grid element paints.
 */
import { BlogAPI, BLOG_CONFIG } from "./BlogAPI.js";

export class BlogFeed {
  constructor() {
    this.api = new BlogAPI();
    this.dom = {};
    this.init();
  }

  async init() {
    this.cacheDOM();
    await this.loadArticlesFeed();
  }

  cacheDOM() {
    this.dom.grid = document.getElementById("blogGrid");
  }

  /**
   * Encodes server text strings defensively to negate layout vulnerabilities (XSS)
   */
  escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  async loadArticlesFeed() {
    try {
      await this.api.fetchArticles();
      this.renderArticlesGrid();
    } catch (error) {
      console.error("Unable to query active blog posts:", error);
      this.showError(
        "Failed to update news feed. Please check server configurations.",
      );
    }
  }

  /**
   * Renders news articles cards into the target viewport container
   */
  renderArticlesGrid() {
    if (!this.dom.grid) return; // Exit cleanly if the current page template doesn't include a blog grid

    const dataSet = this.api.articles;

    if (dataSet.length === 0) {
      this.dom.grid.innerHTML = `
        <p style="text-align:center; color:var(--text-muted); width:100%; grid-column:1/-1; padding:40px;">
          No articles or news updates have been published yet.
        </p>
      `;
      return;
    }

    this.dom.grid.innerHTML = dataSet
      .map((article) => {
        const articleId = article._id || article.id;
        const coverImage = article.coverImage || BLOG_CONFIG.DEFAULT_COVER;

        // Format document timestamps beautifully into local human readable dates
        const publishDate = article.createdAt
          ? new Date(article.createdAt).toLocaleDateString("en-KE", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Recent Post";

        // Join dynamic tag strings into modular chips layout blocks with safe filtering
        const tagChips = (article.tags || [])
          .map(
            (tag) =>
              `<span class="blog-tag-chip">${this.escapeHTML(tag)}</span>`,
          )
          .join("");

        const cleanTitle = this.escapeHTML(article.title);
        const rawSummary = article.summary || article.content || "";
        const cleanSummary = this.escapeHTML(
          rawSummary.length > 150
            ? rawSummary.substring(0, 150) + "..."
            : rawSummary,
        );
        const cleanAuthor = this.escapeHTML(article.author || "Admin");
        const articleLink = `blog-post.html?slug=${article.slug || articleId}`;

        return `
          <div class="blog-card fade-up">
            <div class="blog-card-image">
              <img src="${coverImage}" alt="${cleanTitle}" loading="lazy" onerror="this.src='${BLOG_CONFIG.DEFAULT_COVER}'">
              <div class="blog-date-badge">${this.escapeHTML(publishDate)}</div>
            </div>
            <div class="blog-card-content">
              <div class="blog-tags-container">${tagChips}</div>
              <h3><a href="${articleLink}">${cleanTitle}</a></h3>
              <p>${cleanSummary}</p>
              <div class="blog-card-footer">
                <span class="blog-author"><i class="far fa-user"></i> By ${cleanAuthor}</span>
                <a href="${articleLink}" class="blog-read-more">
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
    if (this.dom.grid) {
      this.dom.grid.innerHTML = `
        <div class="error-msg" style="color:var(--danger); width:100%; grid-column:1/-1; text-align:center; padding:30px;">
          ${this.escapeHTML(message)}
        </div>
      `;
    }
  }
}
