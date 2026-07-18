/**
 * Blog Controller
 */
const Blog = require("../models/blog");
const { uploadToCloudinary } = require("../config/cloudinary");

exports.getArticles = async (req, res) => {
  try {
    const articles = await Blog.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, data: articles });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve blog listings." });
  }
};

exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Blog.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found." });
    return res.json({ success: true, data: article });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error tracking down article contents.",
      });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = await Blog.create({ title, content });
    return res
      .status(201)
      .json({ success: true, message: "Article published!", data: newPost });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to commit blog post." });
  }
};
