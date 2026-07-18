/**
 * Project Controller
 * Handles CRUD operations for portfolio assets and case studies
 */

// Using clean case match strategies to bypass runtime file trace barriers
const Project = require("../models/project");
const { uploadToCloudinary } = require("../config/cloudinary");

// ============================================
// GET ALL PROJECTS (Public Showcase Grid)
// ============================================
exports.getProjects = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const query = { isActive: true };

    if (category) query.categoryName = category;
    if (featured === "true") query.isFeatured = true;

    const projects = await Project.find(query).sort({ completionDate: -1 });

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Fetch projects pipeline failure:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to pull portfolio listings." });
  }
};

// ============================================
// GET SINGLE PROJECT BY SLUG (Public Read Details View)
// ============================================
exports.getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!project) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Portfolio project data asset not found.",
        });
    }
    return res.json({ success: true, data: project });
  } catch (error) {
    console.error("Fetch single project record entry failure:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error locating detailed portfolio data items.",
      });
  }
};

// ============================================
// ADMINISTRATIVE CREATE PROJECT (Admin Upload Form Panel Node)
// ============================================
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      client,
      completionDate,
      projectUrl,
      categoryName,
      isFeatured,
    } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Project display cover image is required.",
        });
    }

    const cloudinaryResult = await uploadToCloudinary(
      req.file.path,
      "projects",
    );

    const projectData = {
      title,
      description,
      client,
      completionDate: completionDate || undefined,
      projectUrl,
      categoryName: categoryName || "General",
      isFeatured: isFeatured === "true",
      mainImage: cloudinaryResult.url,
    };

    const newProject = await Project.create(projectData);

    return res.status(201).json({
      success: true,
      message: "Project published to active portfolio layout screens cleanly!",
      data: newProject,
    });
  } catch (error) {
    console.error("Create project collection database error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message ||
          "Failed to finalize project entry asset record mapping.",
      });
  }
};
