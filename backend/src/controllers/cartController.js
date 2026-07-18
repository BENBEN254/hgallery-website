/**
 * Cart and Wishlist Sync Controller
 * Syncs client-side selections with MongoDB user profiles
 */

const User = require("../models/User");

// ============================================
// BACKUP CART SELECTIONS (Protected Sync Loop)
// ============================================
exports.syncCart = async (req, res) => {
  try {
    const { items, total } = req.body;

    const user = await User.findById(req.user._id);
    user.cart = { items, total };
    await user.save();

    return res.json({
      success: true,
      message:
        "Shopping bag snapshot stored in user database account profile safely.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to cloud-sync current checkout items.",
      });
  }
};

// ============================================
// ADD ITEM TO PROFILE WISHLIST ARRAY (Protected)
// ============================================
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    const matchIndex = user.wishlist.indexOf(productId);
    if (matchIndex > -1) {
      user.wishlist.splice(matchIndex, 1); // Remove if exists
    } else {
      user.wishlist.push(productId); // Add if missing
    }

    await user.save();
    return res.json({ success: true, data: user.wishlist });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Wishlist execution tracking failure.",
      });
  }
};
