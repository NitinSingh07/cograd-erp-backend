const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      default: "TEACHER",
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
      required: true,
    },
    profile: {
      type: String,
      required: true,
    },
    teachSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subject",
        required: true,
      },
    ],
    timeline: [
      {
        startTime: {
          type: Number,
        },
        endTime: {
          type: Number,
        },
        subject: {
          type: String,
        },
      },
    ],
    documents: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("teacher", teacherSchema);
