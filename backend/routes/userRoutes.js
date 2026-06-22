const express = require("express");
const multer = require("multer");
const User = require("../models/User");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload-avatar/:userId", upload.single("avatar"), async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Vui lòng chọn ảnh"
      });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true }
    );

    res.status(200).json({
      message: "Cập nhật avatar thành công",
     user: {
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar
}
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi upload avatar",
      error: error.message
    });
  }
});

module.exports = router;