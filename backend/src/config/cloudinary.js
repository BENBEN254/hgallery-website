/**
 * Cloudinary Configuration
 * For image upload and optimization
 */

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadToCloudinary = async (file, folder = "hgallery") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image");
  }
};

const uploadMultiple = async (files, folder = "hgallery") => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
  return await Promise.all(uploadPromises);
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultiple,
};
