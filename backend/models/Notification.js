const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type: String,
        enum: ["expense_added", "expense_settled"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    expenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Expense"
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Notification", notificationSchema)
