import express from "express";
import { upload } from "../middleware/upload.js";

import {
  addNews,
  getNews,
  deleteNews,
  updateNews
} from "../controllers/newsController.js";

const router = express.Router();

router.get("/", getNews);
router.post("/", upload.single("image"), addNews);
router.put("/:id", upload.single("image"), updateNews);
router.delete("/:id", deleteNews);

export default router;