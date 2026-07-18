/**
 * Category Controller
 * Handles administrative collection groupings
 */

const Category = require("../models/category");

// ============================================
// GET ALL ACTIVE CATEGORIES (Public)
// ============================================
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Fetch categories execution error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to pull category listings." });
  }
};

// ============================================
// ADMINISTRATIVE CREATE CATEGORY (Admin Only)
// ============================================
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "This collection tag already exists.",
      });
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
      success: true,
      message: "New structural catalog group added successfully.",
      data: category,
    });
  } catch (error) {
    console.error("Create category failure:", error);
    res.status(500).json({
      success: false,
      message: "Could not initialize category parameter map.",
    });
  }
};
