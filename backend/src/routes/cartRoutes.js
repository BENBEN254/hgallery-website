const express = require("express");
const router = express.Router();
const { syncCart } = require("../controllers/cartController");

router.post("/sync", syncCart);

module.exports = router;
