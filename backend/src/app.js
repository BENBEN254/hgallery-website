/**
 * Express App Configuration
 * Fully Realized Architecture with Cart, Wishlist, and Order Tracking Active
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Import active endpoints
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const { auth } = require("./middleware/auth");

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "null",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin === "null") {
      callback(null, true);
    } else {
      callback(new Error("Blocked by Cross-Origin Resource Security Policy"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);
app.use(compression());

// ============================================
// BODY PARSERS
// ============================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================
// STATIC FILES
// ============================================
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================================
// API ROUTES
// ============================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Public store features mounts
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blog", blogRoutes);

// Protected shopping state & purchase tunnels mounts (Guarded via user auth)
app.use("/api/orders", auth, orderRoutes);
app.use("/api/cart", auth, cartRoutes);
app.use("/api/wishlist", auth, wishlistRoutes);

// ============================================
// ROOT OVERVIEW ROUTE
// ============================================
app.get("/", (req, res) => {
  res.json({
    name: "HGALLERY API",
    version: "2.0.0",
    description: "Premium E-Commerce Backend - All Core Nodes Online",
    endpoints: { health: "/api/health" },
  });
});

// ============================================
// ERROR ROUTING DISPATCHERS
// ============================================
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route path not found" });
});

app.use(errorHandler);

module.exports = app;
