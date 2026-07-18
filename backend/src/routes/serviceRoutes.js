/**
 * Service Routes
 */

const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  getServices,
  getServiceBySlug,
  createService,
} = require("../controllers/serviceController");

// Public routes for user portfolio and services storefront windows
router.get("/", getServices);
router.get("/:slug", getServiceBySlug);

// Secured administrative workspace creation points
router.post(
  "/",
  auth,
  authorize("admin", "super-admin"),
  upload.single("image"),
  createService,
);

module.exports = router;
