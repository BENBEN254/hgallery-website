/**
 * Global Error Handler
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error("Error:", error);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = {
      statusCode: 400,
      message: `Validation Error: ${message.join(", ")}`,
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = {
      statusCode: 400,
      message: `Duplicate value for ${field}. Please use another value.`,
    };
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    error = {
      statusCode: 404,
      message: `Resource not found with id: ${err.value}`,
    };
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    error = {
      statusCode: 401,
      message: "Invalid token. Please log in again.",
    };
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    error = {
      statusCode: 401,
      message: "Token expired. Please log in again.",
    };
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = { errorHandler };
