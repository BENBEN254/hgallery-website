/**
 * Project Routes
 */

const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  getProjects,
  getProjectBySlug,
  createProject,
} = require("../controllers/projectController");

// Public routes for client layout galleries
router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);

// Secured administrative workspace actions nodes
router.post(
  "/",
  auth,
  authorize("admin", "super-admin"),
  upload.single("image"),
  createProject,
);

module.exports = router;
