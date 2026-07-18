/**
 * Service Model
 * Handles data mapping configurations for business offerings, pricing, and features
 */

const mongoose = require("mongoose");
const slugify = require("slugify");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Service title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Service description analysis narrative is required"],
    },
    shortDescription: {
      type: String,
      maxlength: [250, "Short snapshot card text cannot exceed 250 characters"],
    },
    price: {
      type: Number,
      required: [true, "Base processing service price is required"],
      min: [0, "Pricing values cannot fall negative"],
      default: 0,
    },
    iconClass: {
      type: String,
      default: "fa-solid fa-layer-group", // Fallback default font-awesome icon selector matching your global layouts
      trim: true,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    mainImage: {
      type: String,
      default: "/assets/images/why-us.jpg",
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

// Pre-save lifecycle trigger to construct uniform clean slug keys on title updates
serviceSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 200) + "...";
  }
  next();
});

module.exports = mongoose.model("Service", serviceSchema);
