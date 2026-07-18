/**
 * Order Transaction Routes
 */

const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders } = require("../controllers/orderController");

// Secure customer purchase lanes
router.post("/", createOrder);
router.get("/my-orders", getMyOrders);

module.exports = router;
