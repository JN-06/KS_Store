import Product from "../models/Product.js";

const BASE_URL = "http://localhost:5000";

const fixImages = (arr) =>
  (arr || []).map(img =>
    img.startsWith("http") ? img : BASE_URL + img
  );

const hasImages = (images) => {
  try {
    const parsedImages = JSON.parse(images || "[]");
    return Array.isArray(parsedImages) && parsedImages.length > 0;
  } catch {
    return false;
  }
};

const validateProduct = (body, files, { requireNewImages = true } = {}) => {
  if (!body.title || !body.title.trim()) {
    return "Title is required";
  }

  const hasNewImages = Boolean(files?.images?.length);
  const hasExistingImages = hasImages(body.existingImages);

  if (requireNewImages && !hasNewImages) {
    return "Main image is required";
  }

  if (!requireNewImages && !hasNewImages && !hasExistingImages) {
    return "Main image is required";
  }

  let variants;
  try {
    variants = JSON.parse(body.variants || "[]");
  } catch {
    return "Invalid variants data";
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    return "At least 1 variant is required";
  }

  const invalidVariant = variants.find(
    v => !v.title || v.price == null || v.stock == null
  );

  if (invalidVariant) {
    return "Each variant must have title, price, and stock";
  }

  return null;
};

export const getProducts = async (req, res) => {
  const products = await Product.find();

  res.json(
    products.map(p => ({
      ...p._doc,
      images: fixImages(p.images),
      detailsImages: fixImages(p.detailsImages)
    }))
  );
};

export const getByCategory = async (req, res) => {
  const { category } = req.params;

  const products = await Product.find(
    category === "all" ? {} : { category }
  );

  res.json(products);
};

export const createProduct = async (req, res) => {
  try {
    const error = validateProduct(req.body, req.files);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const images =
      req.files?.images?.map(f => `/uploads/${f.filename}`) || [];

    const detailsImages =
      req.files?.detailsImages?.map(f => `/uploads/${f.filename}`) || [];

    const product = await Product.create({
      title: req.body.title,
      description: JSON.parse(req.body.description || "[]"),
      category: req.body.category,
      status: req.body.status,
      variants: JSON.parse(req.body.variants || "[]"),
      visibleIn: JSON.parse(req.body.visibleIn || "{}"),
      images,
      detailsImages,
      releaseDate: new Date().toISOString()
    });

    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {

    const error = validateProduct(req.body, req.files, { requireNewImages: false });
    if (error) {
      return res.status(400).json({ message: error });
    }

    const oldImages = JSON.parse(req.body.existingImages || "null");
    const oldDetails = JSON.parse(req.body.existingDetailsImages || "null");

    const newImages =
      req.files?.images?.map(f => `/uploads/${f.filename}`) || [];

    const newDetails =
      req.files?.detailsImages?.map(f => `/uploads/${f.filename}`) || [];

    const updatedData = {
      title: req.body.title,
      description: JSON.parse(req.body.description || "[]"),
      category: req.body.category,
      status: req.body.status,
      variants: JSON.parse(req.body.variants || "[]"),
      visibleIn: JSON.parse(req.body.visibleIn || "{}")
    };

    updatedData.images =
      newImages.length > 0
        ? [...newImages, ...(oldImages || [])]
        : oldImages || [];

    updatedData.detailsImages =
      newDetails.length > 0
        ? [...newDetails, ...(oldDetails || [])]
        : oldDetails || [];

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
