const classTeacherModel = require("../models/classTeacherModel");
const ExamList = require("../models/examListModel");
const ExamResult = require("../models/examResultModel");
const School = require("../models/school");
const Student = require("../models/studentSchema");

exports.addExamResult = async (req, res) => {
  const { student, exams, school } = req.body;
  console.log(req.body);

  try {
    if (!school) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolExists = await School.findById(school);
    if (!schoolExists) {
      return res.status(400).json({ message: "School doesn't exist" });
    }

    // Find student by name instead of ID
    const studentExists = await Student.findOne({ name: student });
    if (!studentExists) {
      return res.status(400).json({ message: "Student doesn't exist" });
    }

    // Validate each exam in the exams array
    for (const exam of exams) {
      const examListExists = await ExamList.findOne({
        examName: exam.examName,
      });
      console.log(exam.examName);
      console.log(examListExists);
      if (!examListExists) {
        return res
          .status(400)
          .json({ message: `Exam ${exam.examName} doesn't exist` });
      }
    }
    console.log("4");
    // Check if there is any data containing the student in the ExamResult database
    let examResult = await ExamResult.findOne({ student: studentExists._id });
    if (!examResult) {
      // If no data found, create a new ExamResult entry for the student
      examResult = new ExamResult({
        student: studentExists._id,
        exams: exams.map((exam) => ({
          examName: exam.examName,
          subjects: exam.subject,
          readingHE: exam.readingHE || null,
          writingHE: exam.writingHE || null,
          tables1To20: exam.tables1To20 || null,
          basicMathematics: exam.basicMathematics || null,
          talkingInBasicEnglish: exam.talkingInBasicEnglish || null,
          basicGKQuestions: exam.basicGKQuestions || null,
          syllabusKnowledgeSubjectwise:
            exam.syllabusKnowledgeSubjectwise || null,
          hobbies: exam.hobbies || "",
          sports: exam.sports || "",
          culturalActivities: exam.culturalActivities || "",
          moralBehavior: exam.moralBehavior || "",
          specialQuality: exam.specialQuality || "",
        })),
        school,
      });

      await examResult.save();

      return res
        .status(200)
        .json({ message: "Exam result added successfully" });
    }

    // Check if any of the examName already exists for the student
    for (const exam of exams) {
      const existingExam = examResult.exams.find(
        (existingExam) => existingExam.examName.toString() === exam.examName
      );

      if (existingExam) {
        return res.status(400).json({
          message: `Exam result already exists for this student and exam ${exam.examName}`,
        });
      }

      // If the examName doesn't exist, push the new exam into the exams array
      examResult.exams.push({
        examName: exam.examName,
        subjects: exam.subjects,
        readingHE: exam.readingHE || null,
        writingHE: exam.writingHE || null,
        tables1To20: exam.tables1To20 || null,
        basicMathematics: exam.basicMathematics || null,
        talkingInBasicEnglish: exam.talkingInBasicEnglish || null,
        basicGKQuestions: exam.basicGKQuestions || null,
        syllabusKnowledgeSubjectwise: exam.syllabusKnowledgeSubjectwise || null,
        hobbies: exam.hobbies || "",
        sports: exam.sports || "",
        culturalActivities: exam.culturalActivities || "",
        moralBehavior: exam.moralBehavior || "",
        specialQuality: exam.specialQuality || "",
      });
    }

    await examResult.save();
    res.status(200).json({ message: "Exam result added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.editExamResult = async (req, res) => {
  const {
    student,
    examName,
    subjects,
    school,
    readingHE,
    writingHE,
    tables1To20,
    basicMathematics,
    talkingInBasicEnglish,
    basicGKQuestions,
    syllabusKnowledgeSubjectwise,
    hobbies,
    sports,
    culturalActivities,
    moralBehavior,
    specialQuality,
  } = req.body;

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

    // Check if the examName already present for another result
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
    const updatedExam = { ...examResult.exams[existingExamIndex] };
    if (examName) updatedExam.examName = examName;
    if (subjects) updatedExam.subjects = subjects;
    if (readingHE) updatedExam.readingHE = readingHE;
    if (writingHE) updatedExam.writingHE = writingHE;
    if (tables1To20) updatedExam.tables1To20 = tables1To20;
    if (basicMathematics) updatedExam.basicMathematics = basicMathematics;
    if (talkingInBasicEnglish)
      updatedExam.talkingInBasicEnglish = talkingInBasicEnglish;
    if (basicGKQuestions) updatedExam.basicGKQuestions = basicGKQuestions;
    if (syllabusKnowledgeSubjectwise)
      updatedExam.syllabusKnowledgeSubjectwise = syllabusKnowledgeSubjectwise;
    if (hobbies) updatedExam.hobbies = hobbies;
    if (sports) updatedExam.sports = sports;
    if (culturalActivities) updatedExam.culturalActivities = culturalActivities;
    if (moralBehavior) updatedExam.moralBehavior = moralBehavior;
    if (specialQuality) updatedExam.specialQuality = specialQuality;

    examResult.exams[existingExamIndex] = updatedExam;

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
