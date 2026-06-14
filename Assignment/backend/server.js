import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

dotenv.config();

const app = express();

/**
 * -----------------------------
 * ENVIRONMENT VARIABLES
 * -----------------------------
 */
const PORT = process.env.PORT || 5000;

/**
 * -----------------------------
 * CORS (PRODUCTION SAFE)
 * -----------------------------
 */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * -----------------------------
 * BODY PARSER
 * -----------------------------
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * -----------------------------
 * DATABASE CONNECTION
 * -----------------------------
 */
connectDB();

/**
 * -----------------------------
 * PATH CONFIG (ES MODULE FIX)
 * -----------------------------
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * -----------------------------
 * STATIC FILES (UPLOADS)
 * -----------------------------
 * IMPORTANT: must match multer upload folder
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/**
 * -----------------------------
 * API ROUTES
 * -----------------------------
 */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

/**
 * -----------------------------
 * TEST ROUTE
 * -----------------------------
 */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/**
 * -----------------------------
 * START SERVER
 * -----------------------------
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});