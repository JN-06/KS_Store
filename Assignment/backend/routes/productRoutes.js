import express from "express";
import Product from "../models/Product.js";
import { upload } from "../middleware/upload.js";
import fs from "fs";
import path from "path";

const router = express.Router();

const safeJSON = (data, fallback) => {
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 50 },
    { name: "detailsImages", maxCount: 50 }
  ]),
  async (req, res) => {
    try {
      const images =
        req.files?.images?.map(f => `/uploads/${f.filename}`) || [];

      const detailsImages =
        req.files?.detailsImages?.map(f => `/uploads/${f.filename}`) || [];

      const product = await Product.create({
        title: req.body.title,
        description: safeJSON(req.body.description, []),
        category: req.body.category,
        status: req.body.status,
        variants: safeJSON(req.body.variants, []),
        visibleIn: safeJSON(req.body.visibleIn, {}),
        images,
        detailsImages
      });

      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 50 },
    { name: "detailsImages", maxCount: 50 }
  ]),
  async (req, res) => {
    try {
      const oldImages = safeJSON(req.body.existingImages, []);
      const oldDetails = safeJSON(req.body.existingDetailsImages, []);

      const deletedImages = safeJSON(req.body.deletedImages, []);
      const deletedDetailImages = safeJSON(
        req.body.deletedDetailImages,
        []
      );

      [...deletedImages, ...deletedDetailImages].forEach(img => {
        const filePath = path.join(process.cwd(), img);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      const newImages =
        req.files?.images?.map(f => `/uploads/${f.filename}`) || [];

      const newDetails =
        req.files?.detailsImages?.map(f => `/uploads/${f.filename}`) || [];

      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
          description: safeJSON(req.body.description, []),
          category: req.body.category,
          status: req.body.status,
          variants: safeJSON(req.body.variants, []),
          visibleIn: safeJSON(req.body.visibleIn, {}),
          images: [...oldImages, ...newImages],
          detailsImages: [...oldDetails, ...newDetails]
        },
        { new: true }
      );

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    const allImages = [
      ...(product.images || []),
      ...(product.detailsImages || [])
    ];

    allImages.forEach(img => {
      const filePath = path.join(process.cwd(), img);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;