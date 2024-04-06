const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  receipt: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
