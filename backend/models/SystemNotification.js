const mongoose = require("mongoose");

const systemNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    target: {
      type: String,
      enum: ["all", "users", "admins"],
      default: "all"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SystemNotification", systemNotificationSchema);