const User = require("../models/User")
const Expense = require("../models/Expense")
const Settlement = require("../models/Settlement")

// GET SYSTEM STATS
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments()
        const totalExpenses = await Expense.countDocuments()

        const allExpenses = await Expense.find()
        const totalVolume = allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)

        const pendingSettlements = await Expense.find({
            // Logic to find expenses with unsettled splits would go here
            // For now, returning total count of expenses with splits
            "splitWith.0": { $exists: true }
        }).countDocuments()

        res.json({
            totalUsers,
            totalExpenses,
            totalVolume,
            pendingSettlements
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password")
        res.json(users)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE USER
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ message: "User not found" })

        if (user.role === "admin") {
            return res.status(403).json({ message: "Cannot delete an admin" })
        }

        await User.findByIdAndDelete(req.params.id)
        // Optionally delete their expenses too
        await Expense.deleteMany({ userId: req.params.id })

        res.json({ message: "User and their data deleted successfully" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET ALL EXPENSES (SYSTEM WIDE)
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ createdAt: -1 }).populate("userId", "name email")
        res.json(expenses)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
