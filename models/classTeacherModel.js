const mongoose = require("mongoose");

const classTeacherSchema = new mongoose.Schema(
  {
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
      default: "CLASS-TEACHER",
    },
    className: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    }
    // school: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "school",
    //   required: true,
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("classTeacher", classTeacherSchema);
