/**
 * File Upload Middleware
 * Configures local staging rules for incoming multi-part binary files via Multer
 */

const multer = require("multer");
const path = require("path");

// 1. Configure disk storage configuration parameters
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // Stage incoming files into your backend local uploads bucket repository
    callback(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, callback) {
    // Generate clean unique filename hashes to avoid production overwrites
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});

// 2. Add validation rules to keep dangerous files out
const fileFilter = (req, file, callback) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const allowedMimeTypes = /image\/jpeg|image\/jpg|image\/png|image\/webp/;

  const extensionMatch = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimeMatch = allowedMimeTypes.test(file.mimetype);

  if (extensionMatch && mimeMatch) {
    return callback(null, true);
  }

  callback(
    new Error(
      "Format rejected. Only JPEG, JPG, PNG, and WEBP imagery structures are permitted.",
    ),
    false,
  );
};

// 3. Export configured instance with a 5MB payload ceiling
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MegaBytes limit
});

module.exports = { upload };
