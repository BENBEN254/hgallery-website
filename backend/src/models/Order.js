/**
 * Order Model
 * Handles database schema mappings for checkouts, invoices, and customer transactions
 */

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [
        true,
        "An identified user profile context is required to file transactions.",
      ],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        size: String,
        color: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: "Kenya" },
    },
    paymentMethod: {
      type: String,
      enum: ["M-Pesa", "Cash", "Card"],
      default: "M-Pesa",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    mpesaCheckoutRequestID: String, // For linking transactions to your M-Pesa STK push responses
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
