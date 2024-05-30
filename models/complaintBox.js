const mongoose = require("mongoose");

const complaintBoxSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "parent", "teacher", "classTeacher"],
      required: true,
    },
    date: {
      type: Number,
      required: true,
      default: Date.now(),
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parent",
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
    },
    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "classTeacher",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("complaintBox", complaintBoxSchema);
