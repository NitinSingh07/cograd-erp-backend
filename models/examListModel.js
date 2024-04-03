const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  examName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("ExamList", examSchema);
