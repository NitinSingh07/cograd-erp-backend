const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: Map,
      of: [String], // Array of strings for tasks
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    chapter: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    remark: {
      type: String,
      default: "",
    },
    teacherID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: false,
    },
    periodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Period",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
