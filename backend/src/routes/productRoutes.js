/**
 * Product Routes
 */

const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  getProducts,
  getProduct,
  createProduct,
} = require("../controllers/productController");

// ============================================
// PUBLIC VISITOR ROUTES
// ============================================
router.get("/", getProducts);
router.get("/:id", getProduct);

// ============================================
// SECURE ADMIN PANEL UPLOAD ROUTES
// ============================================
// Uses .single("image") to handle single-file dashboards gracefully
router.post(
  "/",
  auth,
  authorize("admin", "super-admin"),
  upload.single("image"),
  createProduct,
);

module.exports = router;
