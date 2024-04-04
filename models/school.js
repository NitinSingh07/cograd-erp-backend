const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  schoolName: {
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
    default: "principal",
  },
  
});

module.exports = mongoose.model("school", schoolSchema);
