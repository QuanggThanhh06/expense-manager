const express = require("express");
const router = express.Router();
const {
  createExpense,
  getExpensesByUser,
  updateExpense,
  deleteExpense
} = require("../controllers/expenseController");

router.post("/", createExpense);
router.get("/:userId", getExpensesByUser);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;