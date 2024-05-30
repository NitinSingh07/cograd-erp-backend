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
          marksObtain: {
            type: Number,
            required: true,
          },
          totalMarks: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  ],
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school",
    required: true,
  },
});

module.exports = mongoose.model("ExamResult", examResultSchema);
