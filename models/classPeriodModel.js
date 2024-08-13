const mongoose = require("mongoose");

const classPeriodSchema = new mongoose.Schema(
  {
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
      },
    ],
    photos: [
      {
        type: String,
      },
    ],
    status: {
      type: Boolean,
      default: false,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
    },
    teacherID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    },
    arrangementStatus: {
      type: Boolean,
      default: false,
    },
    arrangementTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
    },
    arrangementReason: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    timePeriod: {
      type: String, // Example: "09:35AM-10:10AM"
    },
    day: {
      type: String, // Example: "Tuesday"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("classperiod", classPeriodSchema);
