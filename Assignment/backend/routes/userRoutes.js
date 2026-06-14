import express from "express"
import fs from "fs"
import path from "path"

import User from "../models/User.js"
import { getProfile, updateProfile } from "../controllers/userController.js"
import { verifyToken } from "../middleware/authMiddleware.js"
import { upload } from "../middleware/upload.js"

const router = express.Router()

router.get("/profile", verifyToken, getProfile)
router.put("/profile", verifyToken, updateProfile)

router.post(
  "/upload-profile",
  verifyToken,
  upload.single("profile"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id)

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        })
      }
      if (user.profile) {
        const oldFile = user.profile
          .replace("http://localhost:5000/", "")

        const oldPath = path.join(process.cwd(), oldFile)

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath)
        }
      }

      const url = `http://localhost:5000/uploads/${req.file.filename}`

      user.profile = url
      await user.save()

      res.json({ url })

    } catch (err) {
      res.status(500).json({
        message: err.message
      })
    }
  }
)

export default router