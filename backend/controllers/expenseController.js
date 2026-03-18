const Expense = require("../models/Expense")
const Settlement = require("../models/Settlement")
const User = require("../models/User")
const Notification = require("../models/Notification")

// ADD EXPENSE
exports.addExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body)

    // Notify split members
    if (expense.splitWith && expense.splitWith.length > 0) {
      const payer = await User.findById(expense.userId)
      const payerName = payer ? payer.name : expense.paidBy

      for (const item of expense.splitWith) {
        if (!item.email) continue

        const targetUser = await User.findOne({ email: item.email })
        if (targetUser && targetUser._id.toString() !== expense.userId.toString()) {
          await Notification.create({
            recipientId: targetUser._id,
            senderId: expense.userId,
            type: "expense_added",
            message: `${payerName} added a new expense: "${expense.title}". You owe ₹${item.amount.toLocaleString()}.`,
            expenseId: expense._id
          })
        }
      }
    }

    res.status(201).json(expense)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET EXPENSES BY USER
exports.getExpenses = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const userEmail = user ? user.email : "___no_email___";
    const userName = user ? user.name : "___no_name___";

    const expenses = await Expense.find({
      $or: [
        { userId: req.params.userId },
        { "splitWith.email": userEmail },
        { "splitWith.name": userName } // Fallback for legacy data
      ]
    })
    res.json(expenses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id)
    res.json({ message: "Deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// UPDATE
exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// SETTLE PAYMENT
exports.settlePayment = async (req, res) => {
  try {
    const { expenseId, personName, amount, userId } = req.body
    const settlement = await Settlement.create({
      expenseId,
      personName,
      amount,
      userId
    })

    // Notify the original payer that someone settled
    const expense = await Expense.findById(expenseId)
    if (expense) {
      const settler = await User.findById(userId)
      const settlerName = settler ? settler.name : personName

      await Notification.create({
        recipientId: expense.userId,
        senderId: userId,
        type: "expense_settled",
        message: `${settlerName} marked an expense as settled: "${expense.title}" (₹${amount.toLocaleString()}).`,
        expenseId: expense._id
      })
    }

    res.status(201).json(settlement)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET SETTLEMENTS BY USER
exports.getSettlements = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const settlements = await Settlement.find({
      $or: [
        { userId: req.params.userId },
        { personName: user ? { $regex: new RegExp(`^${user.name}$`, "i") } : "___" }
      ]
    })
    res.json(settlements)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE SETTLEMENT
exports.deleteSettlement = async (req, res) => {
  try {
    await Settlement.findByIdAndDelete(req.params.id)
    res.json({ message: "Settlement deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}