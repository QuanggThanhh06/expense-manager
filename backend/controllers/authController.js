const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Đăng ký
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu"
      });
    }

    if (!isStrongPassword(password)) {
  return res.status(400).json({
    message: "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số"
  });
}

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email đã tồn tại"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
  name,
  email,
  password: hashedPassword
});

    await newUser.save();

    res.status(201).json({
      message: "Đăng ký thành công",
     user: {
  id: newUser._id,
  name: newUser.name,
  email: newUser.email,
  avatar: newUser.avatar
}
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi đăng ký",
      error: error.message
    });
  }
};

// Đăng nhập
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ email và mật khẩu"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email không tồn tại"
      });
    }

    if (user.status === "locked") {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Mật khẩu không đúng"
      });
    }

    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi đăng nhập",
      error: error.message
    });
  }
};

const sendOtpEmail = require("../config/email");

// Kiểm tra mật khẩu mạnh
function isStrongPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// Gửi OTP quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Vui lòng nhập email"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Email không tồn tại"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: "Mã OTP đã được gửi đến email của bạn"
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi gửi OTP",
      error: error.message
    });
  }
};

// Đặt lại mật khẩu bằng OTP
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin"
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Email không tồn tại"
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Mã OTP không đúng"
      });
    }

    if (!user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      return res.status(400).json({
        message: "Mã OTP đã hết hạn"
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetOtp = "";
    user.resetOtpExpires = null;

    await user.save();

    res.status(200).json({
      message: "Đặt lại mật khẩu thành công"
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi đặt lại mật khẩu",
      error: error.message
    });
  }
};

// Đổi mật khẩu trong tài khoản
const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin"
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản"
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Mật khẩu cũ không đúng"
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      message: "Đổi mật khẩu thành công"
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi đổi mật khẩu",
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword
};