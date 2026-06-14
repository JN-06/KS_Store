import User from "../models/User.js"

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { name, address, gender, profile, phone, bio } = req.body

    const user = await User.findByIdAndUpdate(
  req.user.id,
  { name, address, gender, profile, phone, bio },
  { new: true, runValidators: true }
).select("-password")

    res.json(user)

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}