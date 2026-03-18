const mongoose = require("mongoose")

const settlementSchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
    required: true
  },
  personName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  settledAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
})

module.exports = mongoose.model("Settlement", settlementSchema)
