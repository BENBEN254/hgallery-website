/**
 * Project Model
 * Handles data mapping configurations for portfolio showcases and collections
 */

const mongoose = require("mongoose");
const slugify = require("slugify");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [100, "Project title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Project description narrative is required"],
    },
    client: {
      type: String,
      trim: true,
      default: "Private Client",
    },
    completionDate: {
      type: Date,
      default: Date.now,
    },
    projectUrl: {
      type: String,
      trim: true,
    },
    categoryName: {
      type: String,
      required: [
        true,
        "Project categorization category group name is required",
      ],
      default: "General",
    },
    mainImage: {
      type: String,
      required: [true, "Project showcase display cover image is required"],
    },
    galleryImages: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save lifecycle hook to build uniform clean url strings
projectSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
