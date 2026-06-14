import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: String,

  role: {
    type: String,
    default: "user"
  },

  address: { 
    type: String, 
    default: "" 
  },

  gender: { 
    type: String, 
    default: "" 
  },

  profile: { 
    type: String, 
    default: "" 
  },

  phone: {
  type: String,
  default: "",
  validate: {
    validator: function (v) {
      if (!v) return true

      return /^(\+?60|0)1\d{8,9}$/.test(v.replace(/[\s-]/g, ""))
    },
    message: "Invalid Malaysia phone number"
  }
},
  bio: { type: String, default: "" }

}, { timestamps: true })

export default mongoose.model("User", userSchema)