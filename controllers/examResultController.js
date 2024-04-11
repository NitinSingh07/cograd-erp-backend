const ExamList = require("../models/examListModel");
const ExamResult = require("../models/examResultModel");
const Student = require("../models/studentSchema");

exports.addExamResult = async (req, res) => {
  const { student, examName, subjects } = req.body;

  try {
    // Check if there is any data containing the student in the ExamResult database
    let examResult = await ExamResult.findOne({ student: student });

    const studentExist = await Student.findOne({ _id: student });

    const ExamListExistence = await ExamList.findOne({ _id: examName });

    if (!studentExist) {
      return res.status(400).json({ message: "Student doesn't exist" });
    } else if (!ExamListExistence) {
      return res.status(400).json({ message: "Exam doesn't exist" });
    } else if (!examResult) {
      // If no data found, create a new ExamResult entry for the student
      examResult = new ExamResult({
        student: student,
        exams: [{ examName, subjects }],
      });

      await examResult.save();
      return res
        .status(201)
        .json({ message: "Exam result added successfully" });
    }

    // Check if the examName already exists for the student
    const existingExam = examResult.exams.find(
      (exam) => exam.examName.toString() === examName
    );

    if (existingExam) {
      return res.status(400).json({
        message: "Exam result already exists for this student and exam",
      });
    }

    // If the examName doesn't exist, push the new exam into the exams array
    examResult.exams.push({ examName, subjects });
    await examResult.save();

    res.status(201).json({ message: "Exam result added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.findResultofStudent = async (req, res) => {
  try {
    const studentResult = await ExamResult.findOne({
      student: req.params.id,
    })
      .populate("student", "name")
      .populate("exams.examName", "examName"); // Populate each 'examName' field within the 'exams' array
    if (!studentResult) {
      return res.status(400).json({ message: "Student result not found" });
    }

    res.status(200).json(studentResult);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getClassExamResults = async (req, res) => {
  const classId = req.params.classId;
  const examName = req.query.examName; // Extract the examName from query parameters

  try {
    // Step 1: Retrieve the list of students belonging to the specified class
    const students = await Student.find({ className: classId });

    if (examName) {
      // Step 2: Fetch exam results for each student for the required examName
      const resultsPromises = students.map(async (student) => {
        const examResult = await ExamResult.findOne({
          student: student._id,
          "exams.examName": examName, // Filter by examName within the exams array
        }).populate({
          path: "exams.examName",
          match: { _id: examName }, // Ensure the populated examName matches the provided examName
          select: "examName subjects",
        });

        student.password = undefined;

        return { student: student, examResult: examResult };
      });

      // Step 3: Await all promises and send the list of students with their exam results
      const results = await Promise.all(resultsPromises);

      // Step 4: Filter out students without exam results for the specified examName
      const filteredResults = results.filter(
        ({ examResult }) => examResult !== null
      );

      res.status(200).json(filteredResults);
    } else {
      const resultsPromises = students.map(async (student) => {
        const examResult = await ExamResult.findOne({
          student: student._id,
        }).populate({
          path: "exams.examName",
          select: "examName subjects",
        });

        student.password = undefined;

        return { student: student, examResult: examResult };
      });

      // Step 3: Await all promises and send the list of students with their exam results
      const results = await Promise.all(resultsPromises);

      // Step 4: Filter out students without exam results for the specified examName
      const filteredResults = results.filter(
        ({ examResult }) => examResult !== null
      );

      res.status(200).json(filteredResults);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
