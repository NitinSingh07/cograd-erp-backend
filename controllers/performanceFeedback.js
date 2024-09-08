const Student = require("../models/studentSchema");
const Teacher = require("../models/teacherModel");

// Create upcoming feedback
const createUpcomingFeedback = async (req, res) => {
  const { studentId, date, purpose, teacherId } = req.body;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    // Ensure date is a Date object
    const feedbackDate = new Date(date);
    // Check if feedback for the same day and teacher already exists

    const existingFeedback = student.upcomingFeedbacks.find(
      (feedback) =>
        new Date(feedback.date).toISOString().slice(0, 10) ===
          feedbackDate.toISOString().slice(0, 10) &&
        feedback.teacherId.toString() === teacherId
    );

    if (existingFeedback) {
      return res
        .status(400)
        .json({ message: "Feedback for this date and teacher already exists" });
    }

    // Add the new feedback
    student.upcomingFeedbacks.push({ date, purpose, teacherId });
    await student.save();

    res.status(201).json(student.upcomingFeedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update upcoming feedback to past feedback
const updateFeedbackToPast = async (req, res) => {
  const { studentId, teacherId } = req.params;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const feedbackIndex = student.upcomingFeedbacks.findIndex((feedback) => {
      const feedbackDate = feedback.date.toISOString().split("T")[0];
      const currentDate = new Date().toISOString().split("T")[0];

      return (
        feedback.teacherId.toString() === teacherId &&
        feedbackDate === currentDate
      );
    });

    if (feedbackIndex === -1) {
      return res.status(404).json({ message: "Upcoming feedback not found" });
    }

    const feedback = student.upcomingFeedbacks[feedbackIndex];

    student.pastFeedbacks.push({
      date: feedback.date,
      purpose: feedback.purpose,
      summary: req.body.summary,
      teacherId: teacherId,
    });

    student.upcomingFeedbacks.splice(feedbackIndex, 1);

    await student.save();

    res.status(200).json(student.pastFeedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create calls
const createCall = async (req, res) => {
  const { studentId, time, teacherId } = req.body;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.callHistory.push({ time, teacherId });
    await student.save();

    res.status(201).json(student.callHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get calls
const getCalls = async (req, res) => {
  const { studentId, teacherId } = req.params;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Filter call history by teacherId
    const filteredCalls = student.callHistory.filter(call => call.teacherId.toString() === teacherId);

    res.status(200).json(filteredCalls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  createUpcomingFeedback,
  updateFeedbackToPast,

  createCall,
  getCalls,
};
