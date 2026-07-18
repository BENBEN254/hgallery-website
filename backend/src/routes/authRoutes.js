/**
 * Authentication Routes
 * Refactored by Senior Dev for Stable Lifecycle Mounts and Parameter Guards
 */

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth } = require("../middleware/auth");
const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

// ============================================
// INLINE HIGH-UTILITY VALIDATION INTERCEPTOR
// ============================================
// Avoids breaking the app if an external validation file is missing
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors
        .array()
        .map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

// ============================================
// VALIDATION RULES ARRAYS
// ============================================
const registerValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Please provide a valid email format"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email format"),
  body("password").notEmpty().withMessage("Password cannot be blank"),
];

// ============================================
// PUBLIC VISITOR ROUTING GATEWAYS
// ============================================
router.post("/register", registerValidation, handleValidationErrors, register);
router.post("/login", loginValidation, handleValidationErrors, login);

// ============================================
// SECURE USER PROFILE ACCESS ROUTING
// ============================================
router.get("/me", auth, getMe);
router.post("/logout", auth, logout);

module.exports = router;
