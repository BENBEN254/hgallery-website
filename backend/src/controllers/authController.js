/**
 * Authentication Controller
 * Refactored by Senior Dev for Secure Session Handshakes and Token Issuance
 */

const User = require("../models/User");
const crypto = require("crypto");

// ============================================
// REGISTER USER / ADMIN (Public)
// ============================================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // 1. Check for registration duplication conflicts
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "This email address is already registered in our backend network.",
      });
    }

    // 2. Commit User to database (Schema pre-save hooks hash passwords automatically)
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password,
      role: role || "user", // Defaults to normal client user unless explicitly forced
    });

    // 3. Issue JSON Web Token sign lines using instance methods
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();

    // 4. Transform response object safely (Interceptors strip passwords automatically)
    res.status(201).json({
      success: true,
      message: "Registration lifecycle completed successfully.",
      data: {
        user,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Register execution crash:", error);
    res.status(500).json({
      success: false,
      message: "Registration routing process failed.",
      error: error.message,
    });
  }
};

// ============================================
// LOGIN HANDLER (Public Gateway Interface)
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Sanitize incoming text lines
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please specify your username credentials and validation password.",
      });
    }

    // 2. Target data entry record and override schema select protections (+password)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access verification failed. Invalid identity credentials.",
      });
    }

    // 3. Check for security brute-force runtime locks
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked out due to failed attempts. Retry in ${remainingMinutes} minutes.`,
      });
    }

    // 4. Verify password crypt strings using model methods
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.handleFailedLogin();
      return res.status(401).json({
        success: false,
        message: "Access verification failed. Invalid identity credentials.",
        attemptsRemaining: Math.max(0, 5 - user.loginAttempts),
      });
    }

    // 5. Clear historical login failures and record the tracking timestamp
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    // 6. Construct structural token signatures
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();

    // 7. Inject response cookie parameter blocks for cross-browser fallback syncs
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // Valid for 30 calendar days
    });

    res.json({
      success: true,
      message: "Authentication handshake verified.",
      data: {
        user,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login route runtime crash:", error);
    res.status(500).json({
      success: false,
      message: "Authentication engine processing failure.",
    });
  }
};

// ============================================
// LOGOUT PROCESS ROUTING (Invalidates Cookies)
// ============================================
exports.logout = async (req, res) => {
  try {
    // Clear out client cookies safely across modern browser frameworks
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({
      success: true,
      message: "Session token invalidated. Logout completed.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to log out cleanly.",
    });
  }
};

// ============================================
// GET CURRENT IDENTIFIED USER profile (Protected)
// ============================================
exports.getMe = async (req, res) => {
  try {
    // req.user gets mapped automatically on the server by your auth middleware layer
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile statistics.",
    });
  }
};
