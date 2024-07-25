const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subName: {
      type: String,
      required: true,
    },
    subCode: {
      type: String,
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


subjectSchema.index({ subCode: 1, school: 1 }, { unique: true });

module.exports = mongoose.model("subject", subjectSchema);
