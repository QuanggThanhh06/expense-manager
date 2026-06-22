const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  toggleUserStatus,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  sendSystemNotification,
  getSystemNotifications,
  getSafeTransactions
} = require("../controllers/adminController");

router.get("/users", getAllUsers);
router.patch("/users/:userId/toggle-status", toggleUserStatus);

router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.post("/notifications", sendSystemNotification);
router.get("/notifications", getSystemNotifications);

router.get("/transactions/safe", getSafeTransactions);

module.exports = router;