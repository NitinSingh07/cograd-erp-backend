const classTeacherModel = require("../models/classTeacherModel");
const ExamList = require("../models/examListModel");
const ExamResult = require("../models/examResultModel");
const School = require("../models/school");
const Student = require("../models/studentSchema");

exports.addExamResult = async (req, res) => {
  const { student, examName, subjects, school } = req.body;

  try {
    if (!school) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const schoolExists = await School.findById(school);
    // Check if there is any data containing the student in the ExamResult database
    let examResult = await ExamResult.findOne({ student: student });

    const studentExist = await Student.findOne({ _id: student });

    const ExamListExistence = await ExamList.findOne({ _id: examName });

    if (!studentExist) {
      return res.status(400).json({ message: "Student doesn't exist" });
    } else if (!ExamListExistence) {
      return res.status(400).json({ message: "Exam doesn't exist" });
    } else if (!schoolExists) {
      return res.status(400).json({ message: "School doesn't exist" });
    } else if (!examResult) {
      // If no data found, create a new ExamResult entry for the student
      examResult = new ExamResult({
        student: student,
        exams: [{ examName, subjects }],
        school,
      });

      await examResult.save();
      return res
        .status(200)
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

    res.status(200).json({ message: "Exam result added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.editExamResult = async (req, res) => {
  const { student, examName, subjects, school } = req.body;

  const editMarksId = req.params.id;

  try {
    if (!school) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const schoolExists = await School.findById(school);
    const studentExist = await Student.findById(student);
    const examListExistence = await ExamList.findById(examName);

    if (!studentExist) {
      return res.status(400).json({ message: "Student doesn't exist" });
    } else if (!examListExistence) {
      return res.status(400).json({ message: "Exam doesn't exist" });
    } else if (!schoolExists) {
      return res.status(400).json({ message: "School doesn't exist" });
    }

    let examResult = await ExamResult.findOne({ student: student });
    if (!examResult) {
      return res.status(404).json({ message: "Exam result does not exist" });
    }

    // Find the specific exam result to edit
    const existingExamIndex = examResult.exams.findIndex(
      (exam) => exam._id.toString() === editMarksId
    );

    //check if the examName already present for another result
    const existingExam = examResult.exams.find(
      (exam) =>
        exam._id.toString() !== editMarksId &&
        exam.examName.toString() === examName
    );

    if (existingExamIndex === -1) {
      return res.status(404).json({
        message: "Exam result does not exist for this exam",
      });
    }

    if (existingExam) {
      return res.status(401).json({
        message: "Exam result already exist for this exam",
      });
    }

    // Update the existing exam result
    examResult.exams[existingExamIndex] = {
      ...examResult.exams[existingExamIndex],
      examName,
      subjects,
    };

    await examResult.save();
    res.status(200).json({ message: "Exam result updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteExamResult = async (req, res) => {
  try {
    const { studentId, examResultId, classTeacherId } = req.params;

    const classTeacher = await classTeacherModel.findById(classTeacherId);

    if (!classTeacherId || !classTeacher) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const examResult = await ExamResult.findOne({ student: studentId });

    if (!examResult) {
      return res.status(404).json({ message: "Result doesn't exist" });
    }

    const examResultIndex = examResult.exams.findIndex(
      (exam) => exam._id.toString() === examResultId
    );

    if (examResultIndex === -1) {
      return res.status(404).json({
        message: "Exam result doesn't exist for this exam and student",
      });
    }

    // Remove the exam result from the exams array
    examResult.exams.splice(examResultIndex, 1);

    // Save the updated exam result document
    await examResult.save();

    res.status(200).json({ message: "Exam result deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.findResultofStudent = async (req, res) => {
  try {
    const studentResult = await ExamResult.findOne({
      student: req.params.id,
    })
      .populate("student", "name email")
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
        })
          .populate({
            path: "exams.examName",
            match: { _id: examName }, // Ensure the populated examName matches the provided examName
            select: "examName subjects",
          })
          .populate("student", "name email");

        return examResult;
      });

      // Step 3: Await all promises and send the list of students with their exam results
      const results = await Promise.all(resultsPromises);

      // Step 4: Filter out students without exam results for the specified examName
      const filteredResults = results
        .filter((examResult) => examResult !== null)
        .map((examResult) => {
          // Filter out exams with null examName
          examResult.exams = examResult.exams.filter(
            (exam) => exam.examName !== null
          );
          return examResult;
        })
        .filter((examResult) => examResult.exams.length > 0); // Ensure there are exams left after filtering

      res.status(200).json(filteredResults);
    } else {
      const resultsPromises = students.map(async (student) => {
        const examResult = await ExamResult.findOne({
          student: student._id,
        })
          .populate({
            path: "exams.examName",
            select: "examName subjects",
          })
          .populate("student", "name email");

        return examResult;
      });

      // Step 3: Await all promises and send the list of students with their exam results
      const results = await Promise.all(resultsPromises);

      // Step 4: Filter out students without exam results for the specified examName
      // const filteredResults = results.filter((examResult) => {
      //   const exams = examResult.exams.forEach((exam) => {
      //     if (exam.examName === null) {
      //     }
      //   });
      // });

      res.status(200).json(results);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
