const Notification = require("../models/Notification")

// GET NOTIFICATIONS FOR A USER
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(20)
        res.json(notifications)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// MARK NOTIFICATION AS READ
exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
        res.json({ message: "Marked as read" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE ALL NOTIFICATIONS FOR A USER
exports.clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipientId: req.params.userId })
        res.json({ message: "Notifications cleared" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
