const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

// Lấy hoặc tạo ví cho user
const getWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0
      });

      await wallet.save();
    }

    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy ví",
      error: error.message
    });
  }
};

// Nạp tiền demo
const topUpWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Số tiền nạp không hợp lệ"
      });
    }

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0
      });
    }

    wallet.balance += Number(amount);
    await wallet.save();

    const transaction = new Transaction({
      userId,
      type: "topup",
      serviceType: "Nạp tiền",
      billCode: "",
      amount: Number(amount),
      note: "Nạp tiền demo vào ví",
      receiptImage: "",
      status: "success"
    });

    await transaction.save();

    res.status(200).json({
      message: "Nạp tiền thành công",
      wallet,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi nạp tiền",
      error: error.message
    });
  }
};

// Thanh toán hóa đơn demo
const payBill = async (req, res) => {
  try {
    const { userId, serviceType, amount, note, receiptImage } = req.body;

    if (!userId || !serviceType || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin thanh toán"
      });
    }

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0
      });

      await wallet.save();
    }

    if (wallet.balance < Number(amount)) {
      return res.status(400).json({
        message: "Số dư ví không đủ để thanh toán"
      });
    }

    wallet.balance -= Number(amount);
    await wallet.save();

    const transaction = new Transaction({
      userId,
      type: "payment",
      serviceType,
      billCode: "",
      amount: Number(amount),
      note: note || `Thanh toán ${serviceType}`,
      receiptImage: receiptImage || "",
      status: "success"
    });

    await transaction.save();

    res.status(200).json({
      message: "Thanh toán thành công",
      wallet,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi thanh toán",
      error: error.message
    });
  }
};

module.exports = {
  getWallet,
  topUpWallet,
  payBill
};