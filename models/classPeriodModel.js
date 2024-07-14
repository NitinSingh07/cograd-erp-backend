const mongoose = require("mongoose");

const classPeriodSchema = new mongoose.Schema(
  {
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    photos: [{ type: String }],
    status: { type: Boolean, default: false },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    teacherID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    arrangementStatus: { type: Boolean, default: false },
    arrangementTo: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    arrangementReason: { type: String },
    date: { type: Date, required: true }, // Added date field
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassPeriod", classPeriodSchema);
