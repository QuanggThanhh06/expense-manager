const User = require("../models/User");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const SystemNotification = require("../models/SystemNotification");

// 1. Xem danh sách người dùng
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role status createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách người dùng",
      error: error.message
    });
  }
};

// 2. Khóa / mở khóa tài khoản
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng"
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message: "Không thể khóa tài khoản admin"
      });
    }

    user.status = user.status === "active" ? "locked" : "active";
    await user.save();

    res.status(200).json({
      message: user.status === "locked" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái tài khoản",
      error: error.message
    });
  }
};

// 3. Lấy danh mục mặc định
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh mục",
      error: error.message
    });
  }
};

// 4. Thêm danh mục
const createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Vui lòng nhập tên danh mục"
      });
    }

    const category = new Category({
      name,
      type: type || "expense",
      icon: icon || "🧾",
      color: color || "#22c55e"
    });

    await category.save();

    res.status(201).json({
      message: "Thêm danh mục thành công",
      category
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi thêm danh mục",
      error: error.message
    });
  }
};

// 5. Sửa danh mục
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, icon, color } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, type, icon, color },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục"
      });
    }

    res.status(200).json({
      message: "Cập nhật danh mục thành công",
      category
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật danh mục",
      error: error.message
    });
  }
};

// 6. Xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục"
      });
    }

    res.status(200).json({
      message: "Xóa danh mục thành công"
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi xóa danh mục",
      error: error.message
    });
  }
};

// 7. Gửi thông báo hệ thống
const sendSystemNotification = async (req, res) => {
  try {
    const { title, message, target } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: "Vui lòng nhập tiêu đề và nội dung thông báo"
      });
    }

    const notification = new SystemNotification({
      title,
      message,
      target: target || "all"
    });

    await notification.save();

    res.status(201).json({
      message: "Gửi thông báo hệ thống thành công",
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi gửi thông báo",
      error: error.message
    });
  }
};

// 8. Lấy danh sách thông báo hệ thống
const getSystemNotifications = async (req, res) => {
  try {
    const notifications = await SystemNotification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy thông báo",
      error: error.message
    });
  }
};

// 9. Xem giao dịch mức an toàn
const getSafeTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("userId", "name email")
      .select("userId type serviceType billCode status createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy giao dịch an toàn",
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  sendSystemNotification,
  getSystemNotifications,
  getSafeTransactions
};