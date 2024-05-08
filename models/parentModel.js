const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
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
      default: "PARENT",
    },
    qualification: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("parent", parentSchema);
