const express = require("express")
const router = express.Router()
const {
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
  settlePayment,
  getSettlements,
  deleteSettlement
} = require("../controllers/expenseController")

router.post("/add", addExpense)
router.get("/:userId", getExpenses)
router.delete("/:id", deleteExpense)
router.put("/:id", updateExpense)

router.post("/settle", settlePayment)
router.get("/settle/:userId", getSettlements)
router.delete("/settle/delete/:id", deleteSettlement)

module.exports = router
