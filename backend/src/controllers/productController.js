/**
 * Product Controller
 * CRUD operations for products
 */

const Product = require("../models/product");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");

// ============================================
// GET ALL PRODUCTS (Public)
// ============================================
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      rating,
      sort,
      search,
      featured,
      sale,
      new: isNew,
      inStock,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (rating) query.rating = { $gte: parseFloat(rating) };
    if (featured === "true") query.featured = true;
    if (sale === "true") query.sale = true;
    if (isNew === "true") query.new = true;
    if (inStock === "true") query.inStock = true;

    let sortOption = {};
    switch (sort) {
      case "price-asc":
        sortOption = { price: 1 };
        break;
      case "price-desc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "popular":
        sortOption = { soldCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

// ============================================
// GET SINGLE PRODUCT (Public)
// ============================================
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Increment product views cleanly
    product.views += 1;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Get single product error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch product details" });
  }
};

// ============================================
// CREATE PRODUCT (Admin Protected Upload)
// ============================================
// ============================================
// CREATE PRODUCT (Admin Protected Upload)
// ============================================
exports.createProduct = async (req, res) => {
  try {
    // 1. Ensure file image exists
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Product image is required" });
    }

    // 2. Upload the temporary file stream into Cloudinary
    // Passes req.file.path down into your config function cleanly
    const cloudinaryResult = await uploadToCloudinary(
      req.file.path,
      "products",
    );

    // 3. Format product image arrays matching your config objects
    const productImages = [
      {
        url: cloudinaryResult.url,
        public_id: cloudinaryResult.public_id,
        alt: req.body.name,
        isMain: true,
      },
    ];

    // 4. Fallback defaults for missing fields to satisfy Schema validations
    const productData = {
      name: req.body.name,
      description: req.body.description,
      shortDescription:
        req.body.shortDescription || req.body.description.substring(0, 150),
      category: req.body.category || null,
      categoryName: req.body.categoryName || "Uncategorized",
      price: parseFloat(req.body.price),
      oldPrice: req.body.oldPrice ? parseFloat(req.body.oldPrice) : undefined,
      sku:
        req.body.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quantity: parseInt(req.body.quantity || 10),
      featured: req.body.featured === "true",
      images: productImages,
      mainImage: cloudinaryResult.url, // Maps directly to your layout return
    };

    // 5. Commit document into MongoDB
    const newProduct = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product uploaded successfully without code!",
      data: newProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to upload product",
      });
  }
};
