/**
 * Category Routes
 */

const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const {
  getCategories,
  createCategory,
} = require("../controllers/categoryController");

// Public frontend store layout listings
router.get("/", getCategories);

// Admin dashboard creation nodes
router.post("/", auth, authorize("admin", "super-admin"), createCategory);

module.exports = router;
