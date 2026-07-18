/**
 * Service Controller
 * Handles CRUD operations for corporate service assets and catalogs
 */

const Service = require("../models/service");
const { uploadToCloudinary } = require("../config/cloudinary");

// ============================================
// GET ALL SERVICES (Public Grid Layout)
// ============================================
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ title: 1 });

    return res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Fetch services routing failure:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to gather available services catalog data maps.",
      });
  }
};

// ============================================
// GET SINGLE SERVICE BY SLUG (Public Read Details Page View)
// ============================================
exports.getServiceBySlug = async (req, res) => {
  try {
    const service = await Service.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!service) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Specified catalog item data record not found.",
        });
    }
    return res.json({ success: true, data: service });
  } catch (error) {
    console.error("Fetch single service exception error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error locating requested catalog details asset.",
      });
  }
};

// ============================================
// ADMINISTRATIVE CREATE NEW SERVICE (Admin Dashboard Forms Engine)
// ============================================
exports.createService = async (req, res) => {
  try {
    const { title, description, shortDescription, price, iconClass, features } =
      req.body;

    const existingService = await Service.findOne({ title: title.trim() });
    if (existingService) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "A corporate service item using this name tag already exists.",
        });
    }

    let imageUrl = "/assets/images/why-us.jpg";
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(
        req.file.path,
        "services",
      );
      imageUrl = cloudinaryResult.url;
    }

    // Process comma-separated text fragments from dashboard form inputs cleanly into an array stack
    const parsedFeatures = features
      ? features.split(",").map((item) => item.trim())
      : [];

    const serviceData = {
      title: title.trim(),
      description,
      shortDescription,
      price: parseFloat(price || 0),
      iconClass: iconClass || undefined,
      features: parsedFeatures,
      mainImage: imageUrl,
    };

    const newService = await Service.create(serviceData);

    return res.status(201).json({
      success: true,
      message:
        "Service published to store display layout engines successfully!",
      data: newService,
    });
  } catch (error) {
    console.error(
      "Create service parameters validation database failure:",
      error,
    );
    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message ||
          "Failed to commit service asset definition maps into cluster arrays.",
      });
  }
};
