const express = require("express")
const router = express.Router()
const { getNotifications, markAsRead, clearNotifications } = require("../controllers/notificationController")

router.get("/:userId", getNotifications)
router.put("/read/:id", markAsRead)
router.delete("/clear/:userId", clearNotifications)

module.exports = router
