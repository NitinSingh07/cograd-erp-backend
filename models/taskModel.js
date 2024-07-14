const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    remark: {
      type: String,
    },
    teacherID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: false,
    },
    periodID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Period",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
