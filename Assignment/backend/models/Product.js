import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  image: String,
  title: String,
  price: Number,
  stock: Number
});

const productSchema = new mongoose.Schema({
  title: String,
  description: [String],
  category: String,
  status: String,

  images: [String],
  detailsImages: [String],

  variants: [variantSchema],

  visibleIn: {
    ip: [String],
    category: [String],
    activity: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Product", productSchema);