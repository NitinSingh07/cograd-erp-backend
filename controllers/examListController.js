const ExamList = require("../models/examListModel");

exports.addNewExam = async (req, res) => {
  const { examName } = req.body;

  try {
    // Check if the exam name already exists
    const examNameExistence = await ExamList.findOne({ examName });

    if (examNameExistence) {
      return res.status(400).json({ message: "Exam already exists" });
    }

    // If the exam name doesn't exist, create a new exam
    const exam = new ExamList({ examName });
    const result = await exam.save();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.findExamById = async (req, res) => {
  try {
    const examId = req.params.id;

    const selectedExam = await ExamList.findById(examId);

    if (!selectedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(selectedExam);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.examListFind = async (req, res) => {
  try {
    const examList = await ExamList.find({});

    res.send(examList);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.editExam = async (req, res) => {
  try {
    const examId = req.params.id;

    const { examName } = req.body;

    const exam = await ExamList.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    exam.examName = examName;
    await exam.save();

    res.status(200).json({ message: "Exam updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const examList = await ExamList.findByIdAndDelete(examId);

    if (!examList) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};
