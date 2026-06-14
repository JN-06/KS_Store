import express from "express";
import multer from "multer";
import path from "path";
import { updateOrderStatus } from "../controllers/orderController.js";

import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById
} from "../controllers/orderController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { extractPaymentText } from "../services/ocrService.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });
router.post(
  "/",
  verifyToken,
  upload.single("paymentProof"),
  createOrder
);

router.get("/", verifyToken, getAllOrders);
router.get("/my", verifyToken, getMyOrders);
router.get("/:id", verifyToken, getOrderById);
router.put("/:id/status", verifyToken, updateOrderStatus);

router.post("/payment/upload", upload.single("image"), async (req, res) => {
  try {
    const { amount, receiver } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imagePath = path.resolve("uploads", req.file.filename);

    const ocr = await extractPaymentText(imagePath);

    if (!ocr.success) {
      return res.status(500).json({
        status: "error",
        error: ocr.error
      });
    }

    const extractedName = ocr.parsed?.name || "";
    const extractedAmount = ocr.parsed?.amount || null;

    function normalize(str) {
      return str
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .trim();
    }

    const nameMatch =
      normalize(extractedName).includes(normalize(receiver));

    const expectedAmount = Number(amount);

    const amountMatch =
      extractedAmount &&
      Math.abs(extractedAmount - expectedAmount) < 0.01;

    let status = "failed";
    const reasons = [];

    if (!nameMatch) reasons.push("name incorrect");
    if (!amountMatch) reasons.push("amount incorrect");

    if (nameMatch && amountMatch) status = "valid";
    else if (nameMatch || amountMatch) status = "review";

    return res.json({
      status: "success",
      result: {
        status,
        reason: reasons.length ? reasons : ["all correct"],

        extracted: {
          name: extractedName,
          amount: extractedAmount
        },

        checks: {
          nameMatch,
          amountMatch
        }
      }
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      error: err.message
    });
  }
});
export default router;