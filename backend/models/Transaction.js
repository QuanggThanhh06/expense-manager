const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["topup", "payment"],
      required: true
    },
    serviceType: {
      type: String,
      default: ""
    },
    billCode: {
      type: String,
      default: ""
    },
    amount: {
      type: Number,
      required: true
    },
    note: {
      type: String,
      default: ""
    },

    receiptImage: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);