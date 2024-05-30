const mongoose = require("mongoose");

const complaintBoxSchema = new mongoose.Schema(
  {
    message: {
      type: String,
    },
    audio: {
      type: String,
    },
    role: {
      type: String,
      enum: ["STUDENT", "PARENT"],
      required: true,
    },
    date: {
      type: Number,
      required: true,
      default: Date.now(),
    },
    status: {
      type: String,
      enum: ["UNRESOLVED", "RESOLVED"],
      default: "UNRESOLVED",
    },
    referredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      default: null,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parent",
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
    },
  },
  {
    timestamps: true,
    validate: {
      validator: function () {
        return this.message || this.audio;
      },
      message: "Either message or audio must be provided.",
    },
  }
);

module.exports = mongoose.model("complaintBox", complaintBoxSchema);
