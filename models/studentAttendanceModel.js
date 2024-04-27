const mongoose = require("mongoose");

const studentAttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true,
  },
  classTeacher:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "classTeacher",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["p", "a"],
    default: "a",
  },
});

module.exports = mongoose.model("attendance", studentAttendanceSchema);
