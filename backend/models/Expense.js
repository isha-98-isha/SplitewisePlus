const mongoose = require("mongoose")

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  paidBy: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: ""
  },
  splitWith: [
    {
      name: String,
      email: String,
      amount: Number
    }
  ],
  totalSplit: {
    type: Number,
    default: 1
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null
  }
})

module.exports = mongoose.model("Expense", expenseSchema)
