const Expense = require("../models/Expense");

// Thêm chi tiêu
const createExpense = async (req, res) => {
  try {
    const { userId, amount, category, expenseDate, note } = req.body;

    if (!userId || !amount || !category || !expenseDate) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin chi tiêu"
      });
    }

    const newExpense = new Expense({
      userId,
      amount,
      category,
      expenseDate,
      note
    });

    await newExpense.save();

    res.status(201).json({
      message: "Thêm chi tiêu thành công",
      expense: newExpense
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi thêm chi tiêu",
      error: error.message
    });
  }
};

// Lấy danh sách chi tiêu theo user
const getExpensesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const expenses = await Expense.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách chi tiêu",
      error: error.message
    });
  }
};

// Cập nhật chi tiêu
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, expenseDate, note } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { amount, category, expenseDate, note },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        message: "Không tìm thấy khoản chi tiêu"
      });
    }

    res.status(200).json({
      message: "Cập nhật chi tiêu thành công",
      expense: updatedExpense
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật chi tiêu",
      error: error.message
    });
  }
};

// Xóa chi tiêu
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({
        message: "Không tìm thấy khoản chi tiêu"
      });
    }

    res.status(200).json({
      message: "Xóa chi tiêu thành công"
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi xóa chi tiêu",
      error: error.message
    });
  }
};

module.exports = {
  createExpense,
  getExpensesByUser,
  updateExpense,
  deleteExpense
};