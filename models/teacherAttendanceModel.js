const mongoose = require("mongoose");

const teacherAttendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher",
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

module.exports = mongoose.model("teacherAttendance", teacherAttendanceSchema);
