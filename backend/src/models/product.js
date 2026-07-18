/**
 * Product Model
 */

const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    categoryName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    oldPrice: {
      type: Number,
      min: [0, "Old price cannot be negative"],
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
    sku: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: String,
        public_id: String,
        alt: String,
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    mainImage: {
      type: String,
      required: true,
    },
    features: [String],
    specifications: {
      type: Map,
      of: String,
    },
    sizes: [String],
    colors: [String],
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        default: "cm",
      },
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sale: {
      type: Boolean,
      default: false,
    },
    new: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

productSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }

  // Set main image
  if (this.images && this.images.length > 0) {
    const mainImage = this.images.find((img) => img.isMain);
    this.mainImage = mainImage ? mainImage.url : this.images[0].url;
  }

  // Set sale flag based on oldPrice
  if (this.oldPrice && this.oldPrice > this.price) {
    this.sale = true;
  }

  // Set inStock based on quantity
  if (this.quantity <= 0) {
    this.inStock = false;
  }

  next();
});

// ============================================
// INDEXES
// ============================================

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// ============================================
// INSTANCE METHODS
// ============================================

productSchema.methods.getDiscountedPrice = function () {
  if (this.oldPrice && this.oldPrice > this.price) {
    const discount = ((this.oldPrice - this.price) / this.oldPrice) * 100;
    return {
      price: this.price,
      oldPrice: this.oldPrice,
      discount: Math.round(discount),
    };
  }
  return {
    price: this.price,
    oldPrice: null,
    discount: 0,
  };
};

productSchema.methods.updateStock = async function (quantity) {
  this.quantity -= quantity;
  if (this.quantity <= 0) {
    this.quantity = 0;
    this.inStock = false;
  }
  await this.save();
};

// ============================================
// STATIC METHODS
// ============================================

productSchema.statics.getFeatured = function (limit = 4) {
  return this.find({ featured: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("category");
};

productSchema.statics.getNewArrivals = function (limit = 8) {
  return this.find({ new: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

productSchema.statics.getOnSale = function (limit = 8) {
  return this.find({ sale: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

productSchema.statics.search = function (query) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: "textScore" } },
  ).sort({ score: { $meta: "textScore" } });
};

module.exports = mongoose.model("Product", productSchema);
