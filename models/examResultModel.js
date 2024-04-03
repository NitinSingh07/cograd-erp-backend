const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true,
  },
  exams: [
    {
      examName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamList",
        required: true,
      },
      subjects: [
        {
          subjectName: {
            type: String,
            required: true,
          },
          marks: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("ExamResult", examResultSchema);
