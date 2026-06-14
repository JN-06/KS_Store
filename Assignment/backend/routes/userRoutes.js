import express from "express";
import fs from "fs";
import path from "path";

import User from "../models/User.js";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/**
 * BASE URL (works in both local + production)
 */
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.BASE_URL
    : "http://localhost:5000";

/**
 * GET PROFILE
 */
router.get("/profile", verifyToken, getProfile);

/**
 * UPDATE PROFILE
 */
router.put("/profile", verifyToken, updateProfile);

/**
 * UPLOAD PROFILE IMAGE
 */
router.post(
  "/upload-profile",
  verifyToken,
  upload.single("profile"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      /**
       * Delete old image if exists
       */
      if (user.profile) {
        const oldFile = user.profile.replace(`${BASE_URL}/`, "");
        const oldPath = path.join(process.cwd(), oldFile);

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      /**
       * New uploaded image URL
       */
      const url = `${BASE_URL}/uploads/${req.file.filename}`;

      user.profile = url;
      await user.save();

      res.json({ url });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

export default router;