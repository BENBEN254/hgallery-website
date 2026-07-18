/**
 * Blog Routes
 */

const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  getArticles,
  getArticleBySlug,
  createArticle,
} = require("../controllers/blogController");

// Public Client Web View Paths
router.get("/", getArticles);
router.get("/:slug", getArticleBySlug);

// Protected Admin Publishing Dashboard Paths
router.post(
  "/",
  auth,
  authorize("admin", "super-admin"),
  upload.single("image"),
  createArticle,
);

module.exports = router;
