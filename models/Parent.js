const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
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
    default: "Parent",
  },
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
});

exports.module = mongoose.model("Parent", parentSchema);
