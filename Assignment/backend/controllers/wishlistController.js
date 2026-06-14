import Wishlist from "../models/Wishlist.js"

export const getWishlist = async (req, res) => {
  const data = await Wishlist.findOne({ userId: req.params.userId })
  res.json(data || { items: [] })
}

export const addToWishlist = async (req, res) => {
  const { userId, productId, title, image, price, variant } = req.body

  let wishlist = await Wishlist.findOne({ userId })

  if (!wishlist) {
    wishlist = new Wishlist({
      userId,
      items: []
    })
  }

  const exists = wishlist.items.find(
    i => i.productId.toString() === productId && i.variant === variant
  )

  if (!exists) {
    wishlist.items.push({
      productId,
      title,
      image,
      price,
      variant
    })
  }

  await wishlist.save()
  res.json(wishlist)
}

export const removeWishlistItem = async (req, res) => {
  const { userId, productId } = req.body

  const wishlist = await Wishlist.findOne({ userId })

  if (!wishlist) return res.json({ items: [] })

  wishlist.items = wishlist.items.filter(
    i => i.productId.toString() !== productId
  )

  await wishlist.save()
  res.json(wishlist)
}

export const clearWishlist = async (req, res) => {
  await Wishlist.findOneAndDelete({ userId: req.params.userId })
  res.json({ message: "Wishlist cleared" })
}