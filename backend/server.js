const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const connectDatabase = require("./config/database");
const errorHandler = require("./src/middleware/errorHandler");
const authRoutes = require("./src/routes/authRoutes");
const logger = require("./src/utils/logger");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Prevent NoSQL injection
// XSS protection is built into helmet() with contentSecurityPolicy

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
app.use(limiter);

// CORS Middleware
app.use(
  cors({
    origin: "*",
    credentials: false,
  }),
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Wedding Planner API is running",
    version: process.env.API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// API test route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Health Check Passed",
    database: "Connected",
    uptime: process.uptime(),
  });
});

// Mount routes

app.use("/api/v1/auth", require("./src/routes/authRoutes"));
app.use("/api/v1/weddings", require("./src/routes/weddingRoutes"));
app.use("/api/v1/budgets", require("./src/routes/budgetRoutes"));
app.use("/api/v1/guests", require("./src/routes/guestRoutes"));
app.use("/api/v1/timelines", require("./src/routes/timelineRoutes"));
app.use("/api/v1/bookings", require("./src/routes/bookingRoutes"));
app.use("/api/v1/users", require("./src/routes/userRoutes"));
// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Global Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log("═══════════════════════════════════════════");
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📡 API Version: ${process.env.API_VERSION}`);
      console.log("═══════════════════════════════════════════");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error(`❌ Unhandled Rejection:`, err);
      console.error("Stack:", err.stack);
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error(`❌ Uncaught Exception:`, err);
      console.error("Stack:", err.stack);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
