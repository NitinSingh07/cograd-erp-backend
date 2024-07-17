const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
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
    periodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Period",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
