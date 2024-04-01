const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  fees: {
    type: String,
    required: true,
  },
  class: {
    type: string,
    required: true,
  },
  year: {
    type: string,
    required: true,
  },
});

module.exports = mongoose.model("fees", feeSchema);
