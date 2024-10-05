const mongoose = require("mongoose");

const studentAttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "class",
    required: true,
  },
  classTeacher: {
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
    enum: ["p", "a", "l"],
    default: "a",
  },
  checkIn: {
    type: [String], // Array of strings to store multiple check-in options
    default: [],
  },
  checkOut: {
    type: [String], // Array of strings to store multiple check-out options
    default: [],
  },
});

module.exports = mongoose.model("attendance", studentAttendanceSchema);
