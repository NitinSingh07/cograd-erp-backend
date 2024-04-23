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
    role: {
      type: String,
      default: "TEACHER",
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
      required: true,
    },
    teachSubjects: [
      {
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
  { timestamps: true }
);

module.exports = mongoose.model("teacher", teacherSchema);
