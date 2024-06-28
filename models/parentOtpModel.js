const mongoose = require("mongoose");

const parentOtpSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "parent",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "2m", // Document will be automatically removed after 2 minutes
  },
});

module.exports = mongoose.model("parentOtpModel", parentOtpSchema);
