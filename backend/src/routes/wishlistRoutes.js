const express = require("express");
const router = express.Router();
const { toggleWishlist } = require("../controllers/cartController");

router.post("/toggle", toggleWishlist);

module.exports = router;
