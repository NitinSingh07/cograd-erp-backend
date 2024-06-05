const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    profile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "PRINCIPAL",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("school", schoolSchema);
