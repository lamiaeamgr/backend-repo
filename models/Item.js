const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [2, "Item name must be at least 2 characters"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
