const express = require("express");
const router = express.Router();

const {
  getWallet,
  topUpWallet,
  payBill
} = require("../controllers/walletController");

router.get("/:userId", getWallet);
router.post("/topup", topUpWallet);
router.post("/pay", payBill);

module.exports = router;