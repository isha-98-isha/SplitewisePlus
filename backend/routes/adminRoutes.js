const express = require("express")
const router = express.Router()
const { getStats, getAllUsers, deleteUser, getAllExpenses } = require("../controllers/adminController")
const adminOnly = require("../middleware/adminMiddleware")

// All routes here are protected by adminOnly middleware
router.use(adminOnly)

router.get("/stats", getStats)
router.get("/users", getAllUsers)
router.delete("/users/:id", deleteUser)
router.get("/expenses", getAllExpenses)

module.exports = router
