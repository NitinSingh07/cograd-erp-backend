const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subName: {
      type: String,
      required: true,
    },
    subCode: {
      type: String,
      unique: true,
      required: true,
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
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("subject", subjectSchema);
