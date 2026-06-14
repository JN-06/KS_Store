import mongoose from "mongoose"

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      title: String,
      image: String,
      price: Number,
      variant: String,
      qty: {
        type: Number,
        default: 1
      },
      maxStock: Number
    }
  ]
}, { timestamps: true })

export default mongoose.model("Cart", cartSchema)