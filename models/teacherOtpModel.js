const mongoose = require("mongoose");

const teacherOtpSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher",
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

module.exports = mongoose.model("teacherOtpModel", teacherOtpSchema);
