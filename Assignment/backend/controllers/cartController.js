import Cart from "../models/Cart.js"

export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId })
  res.json(cart || { items: [] })
}

export const addToCart = async (req, res) => {
  const { userId, productId, title, image, price, variant, qty, maxStock } = req.body

  let cart = await Cart.findOne({ userId })

  if (!cart) {
    cart = new Cart({
      userId,
      items: []
    })
  }

  const existing = cart.items.find(
    i => i.productId.toString() === productId && i.variant === variant
  )

  if (existing) {
    existing.qty += qty

    if (existing.qty > maxStock) {
      existing.qty = maxStock
    }
  } else {
    cart.items.push({
      productId,
      title,
      image,
      price,
      variant,
      qty,
      maxStock
    })
  }

  await cart.save()
  res.json(cart)
}

export const removeCartItem = async (req, res) => {
  const { userId, productId, variant } = req.body

  const cart = await Cart.findOne({ userId })

  if (!cart) return res.json({ items: [] })

  cart.items = cart.items.filter(
    i => !(i.productId.toString() === productId && i.variant === variant)
  )

  await cart.save()
  res.json(cart)
}

export const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.params.userId })
  res.json({ message: "Cart cleared" })
}