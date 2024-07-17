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
    dob: {
      type: Date,
      // required: true
    },
    teachSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subject",
        required: true,
      },
    ],
    timetable: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          required: true,
        },
        periods: [
          {
            startTime: {
              type: String,
              required: true,
            },
            endTime: {
              type: String,
              required: true,
            },
            subject: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "subject",
              required: true,
            },
            class: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "class",
              required: true,
            },
          },
        ],
      },
    ],
    documents: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    computerKnowledge: {
      type: String,
      required: true,
    },
    computerTyping: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
    },
    skills: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("teacher", teacherSchema);
