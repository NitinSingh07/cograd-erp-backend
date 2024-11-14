const mongoose = require("mongoose");

const teacherAttendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher",
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["p", "a", "l", "sl", "hd"], // "p" (Present), "a" (Absent), "l" (Late), "sl" (Short Leave), "hd" (Half Day)
    default: "a",
  },
});

module.exports = mongoose.model("teacherAttendance", teacherAttendanceSchema);
