const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      default: "expense"
    },

    icon: {
      type: String,
      default: "🧾"
    },

    color: {
      type: String,
      default: "#22c55e"
    },

    isDefault: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Category", categorySchema);