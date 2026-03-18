const User = require("../models/User")

const adminOnly = async (req, res, next) => {
    try {
        const userId = req.headers["user-id"] || req.body.userId || req.query.userId
        if (!userId) {
            return res.status(401).json({ message: "No user ID provided" })
        }

        const user = await User.findById(userId)
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Admins only" })
        }

        next()
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = adminOnly
