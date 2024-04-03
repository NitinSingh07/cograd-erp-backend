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

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.examListFind = async (req, res) => {
  try {
    const examLists = await ExamList.find({});

    res.send(examLists);
  } catch (err) {
    res.status(500).json(err);
  }
};
