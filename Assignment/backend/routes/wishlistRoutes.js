import express from "express"
import {
  addToWishlist,
  getWishlist,
  removeWishlistItem,
  clearWishlist
} from "../controllers/wishlistController.js"

const router = express.Router()

router.post("/add", addToWishlist)
router.get("/:userId", getWishlist)
router.post("/remove", removeWishlistItem)
router.delete("/clear/:userId", clearWishlist)

export default router