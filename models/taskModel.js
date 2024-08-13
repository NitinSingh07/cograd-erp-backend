const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: Map,
      of: [String], 
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
      type: Number,
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
      ref: "teacher",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("task", taskSchema);
