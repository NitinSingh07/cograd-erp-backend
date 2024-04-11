const mongoose = require("mongoose");

const studentAttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["p", "a"],
    default: "a",
  },
});

module.exports = mongoose.model("attendance", studentAttendanceSchema);
