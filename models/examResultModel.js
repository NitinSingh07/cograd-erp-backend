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
      readingHE: {
        type: String,
        enum: ["good", "average", "improvement"],
      },
      writingHE: {
        type: String,
        enum: ["good", "average", "improvement"],
      },
      tables1To20: {
        type: String,
        enum: ["good", "average", "improvement"],
      },
      basicMathematics: {
        type: String,
        enum: ["good", "average", "improvement"],
      },
      talkingInBasicEnglish: {
        type: String,
        enum: ["good", "average", "improvement"],
      },
      basicGKQuestions: {
        type: String,
        enum: ["good", "average", "improvement"],
      },
      syllabusKnowledgeSubjectwise: {
        type: String,
        enum: ["good", "average", "improvement"],
      },
      hobbies: {
        type: String,
      },
      sports: {
        type: String,
      },
      culturalActivities: {
        type: String,
      },
      moralBehavior: {
        type: String,
      },
      specialQuality: {
        type: String,
      },
    },
  ],
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school",
    required: true,
  },
});

module.exports = mongoose.model("ExamResult", examResultSchema);
