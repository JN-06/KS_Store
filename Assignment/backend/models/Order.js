import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        productId: String,
        title: String,
        qty: Number,
        price: Number,
        image: String,
        variant: String
      }
    ],

    total: {
      type: Number,
      required: true
    },

    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "processing", "complete", "cancelled"]
    },

    paymentReason: {
      type: [String],
      default: []
    },

    paymentProof: {
      type: String,
      default: ""
    },

    cancelReason: {
      type: String,
      default: ""
    },

    ocrText: {
      type: String,
      default: ""
    },

    ocrResult: {
      type: Object,
      default: null
    },

    confidenceScore: {
      type: Number,
      default: 0
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    customer: {
      name: String,
      phone: String,
      address: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);