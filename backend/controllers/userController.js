const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({ name, email, password: hashedPassword })

    // create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    })

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      // fallback: handle legacy plain-text passwords (migrate to hashed)
      if (user.password === password) {
        try {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(password, salt)
          await user.save()
        } catch (e) {
          console.error('Password migration failed', e)
        }
      } else {
        return res.status(401).json({ message: "Invalid Credentials" })
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    })

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex")
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    user.resetPasswordExpire = Date.now() + 3600000 // 1 hour

    await user.save()

    // In a real app, send email. Here, we return it for demo purposes.
    res.json({ message: "Token generated", resetToken })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    // Set new password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    res.json({ message: "Password reset successful" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { id, name, email } = req.body
    const user = await User.findById(id)

    if (!user) return res.status(404).json({ message: "User not found" })

    if (name) user.name = name
    if (email) user.email = email

    await user.save()
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
