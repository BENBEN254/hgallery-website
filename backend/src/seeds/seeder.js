/**
 * Database Seeder
 * Populate database with initial data
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

// Import models
const User = require("../models/User");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Service = require("../models/Service");

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("🗑️  Clearing existing data...");

    // Clear collections
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Service.deleteMany();

    console.log("📝 Seeding categories...");

    const categories = [
      {
        name: "Glass",
        slug: "glass",
        icon: "fas fa-square",
        description: "Premium glass products",
      },
      {
        name: "Aluminium",
        slug: "aluminium",
        icon: "fas fa-cube",
        description: "High-quality aluminium systems",
      },
      {
        name: "Shower Cubicles",
        slug: "shower",
        icon: "fas fa-bath",
        description: "Modern shower solutions",
      },
      {
        name: "Wall Panels",
        slug: "wall",
        icon: "fas fa-columns",
        description: "Decorative wall panels",
      },
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories seeded`);

    console.log("📝 Seeding admin user...");

    const admin = await User.create({
      firstName: "Admin",
      lastName: "HGALLERY",
      email: "admin@hgallery.co.ke",
      phone: "+254700000000",
      password: "Admin@2026",
      role: "super-admin",
      isVerified: true,
    });

    console.log("✅ Admin user created");

    console.log("📝 Seeding products...");

    const products = [
      {
        name: "Premium Tempered Glass Door",
        slug: "premium-tempered-glass-door",
        description:
          "Premium tempered glass door with stainless steel fittings.",
        category: createdCategories[0]._id,
        categoryName: "Glass",
        price: 25000,
        oldPrice: 30000,
        sku: "HG-GL-001",
        mainImage: "/uploads/products/glass-door.jpg",
        images: [{ url: "/uploads/products/glass-door.jpg", isMain: true }],
        featured: true,
        inStock: true,
        quantity: 50,
        rating: 4.8,
        reviewsCount: 24,
      },
      {
        name: "Aluminium Sliding Window",
        slug: "aluminium-sliding-window",
        description:
          "High-quality aluminium sliding window with thermal break technology.",
        category: createdCategories[1]._id,
        categoryName: "Aluminium",
        price: 18000,
        sku: "HG-AL-001",
        mainImage: "/uploads/products/aluminium-window.jpg",
        images: [
          { url: "/uploads/products/aluminium-window.jpg", isMain: true },
        ],
        featured: true,
        new: true,
        inStock: true,
        quantity: 30,
        rating: 4.5,
        reviewsCount: 18,
      },
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded`);

    console.log("🎉 Seeding complete!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedData();
