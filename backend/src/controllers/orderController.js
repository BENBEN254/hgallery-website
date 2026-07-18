/**
 * Order Controller
 * Handles checkouts, order submissions, and purchase history tracking
 */

const Order = require("../models/Order");
const Product = require("../models/product");

// ============================================
// CREATE NEW ORDER (Protected)
// ============================================
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your order shopping cart cannot be empty.",
      });
    }

    let calculatedTotal = 0;
    const finalItems = [];

    // Verify stock counts and item prices against database truths
    for (const item of items) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(404).json({
          success: false,
          message: `Item ID ${item.product} not found in catalog records.`,
        });
      }
      if (dbProduct.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${dbProduct.name}.`,
        });
      }

      calculatedTotal += dbProduct.price * item.quantity;

      finalItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });

      // Deduct from stock immediately
      await dbProduct.updateStock(item.quantity);
    }

    const newOrder = await Order.create({
      user: req.user._id,
      items: finalItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentMethod,
    });

    return res.status(201).json({
      success: true,
      message:
        "Order placed successfully! Proceeding to invoice confirmation status.",
      data: newOrder,
    });
  } catch (error) {
    console.error("Order processing fail:", error);
    return res.status(500).json({
      success: false,
      message: "Transaction submission processing failed.",
    });
  }
};

// ============================================
// GET USER ORDERS HISTORY (Protected)
// ============================================
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to compile your historical order ledger sheets.",
    });
  }
};
