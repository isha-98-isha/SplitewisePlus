const express = require("express")
const router = express.Router()
const { registerUser, loginUser, getUsers, forgotPassword, resetPassword, updateProfile } = require("../controllers/userController")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/", getUsers)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.put("/update-profile", updateProfile)
router.get("/:id", async (req, res) => {
    try {
        const User = require("../models/User")
        const user = await User.findById(req.params.id).select("-password")
        if (!user) return res.status(404).json({ message: "User not found" })
        res.json(user)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router
