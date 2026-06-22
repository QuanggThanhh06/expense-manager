const Transaction = require("../models/Transaction");

// Lấy lịch sử giao dịch của user
const getTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ userId }).sort({
      createdAt: -1
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy lịch sử giao dịch",
      error: error.message
    });
  }
};

// Xóa 1 giao dịch nếu cần demo
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({
        message: "Không tìm thấy giao dịch"
      });
    }

    res.status(200).json({
      message: "Xóa giao dịch thành công"
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi xóa giao dịch",
      error: error.message
    });
  }
};

module.exports = {
  getTransactionsByUser,
  deleteTransaction
};