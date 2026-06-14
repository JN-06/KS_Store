import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const items =
      typeof req.body.items === "string"
        ? JSON.parse(req.body.items)
        : req.body.items;

    const customer =
      typeof req.body.customer === "string"
        ? JSON.parse(req.body.customer)
        : req.body.customer;

    if (!items?.length) {
      return res.status(400).json({ message: "No items" });
    }

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          message: "Missing productId"
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`
        });
      }

      const variantKey =
        item.variant || product.variants?.[0]?.key || product.variants?.[0]?.title;

      let variant = product.variants.find(
        v => (v.key || v.title) === variantKey
      );

      if (!variant && product.variants?.length) {
        variant = product.variants[0];
      }

      if (!variant) {
        return res.status(404).json({
          message: `Variant not found: ${variantKey}`
        });
      }

      if (Number(variant.stock) < Number(item.qty || 0)) {
        return res.status(400).json({
          message: `${product.title} (${variant.title}) out of stock`
        });
      }

      variant.stock -= Number(item.qty || 0);
      await product.save();
    }

    const total = items.reduce(
      (s, i) =>
        s + Number(i.price || 0) * Number(i.qty || 0),
      0
    );

    const order = await Order.create({
      userId: req.user.id,
      items,
      total,
      paymentStatus: "pending",
      paymentProof: req.file
        ? `uploads/${req.file.filename}`
        : "",

      customer: {
        name: customer?.name || "",
        phone: customer?.phone || "",
        address: customer?.address || ""
      },

      ocrText: "",
      ocrResult: null,
      confidenceScore: 0
    });

    return res.status(201).json(order);

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email phone address");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.json(order);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, cancelReason } = req.body;

    const validStatus = ["pending", "processing", "complete", "cancelled"];

    if (!validStatus.includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.paymentStatus = paymentStatus;
    if (paymentStatus === "cancelled") {
      if (!cancelReason || !cancelReason.trim()) {
        return res.status(400).json({
          message: "Cancel reason is required"
        });
      }

      order.cancelReason = cancelReason;
    } else {
      order.cancelReason = "";
    }

    await order.save();

    const updatedOrder = await order.populate("userId", "name email");

    return res.json(updatedOrder);

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};