const express = require("express");
const router = express.Router();

const {
  getTransactionsByUser,
  deleteTransaction
} = require("../controllers/transactionController");

router.get("/:userId", getTransactionsByUser);
router.delete("/:id", deleteTransaction);

module.exports = router;