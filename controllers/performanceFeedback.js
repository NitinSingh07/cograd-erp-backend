const Student = require("../models/studentSchema");

// Create upcoming feedback
const createUpcomingFeedback = async (req, res) => {
  const { studentId, date, purpose, teacherId } = req.body;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

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
  const { studentId, feedbackId } = req.params;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feedback = student.upcomingFeedbacks.id(feedbackId);
    
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    student.pastFeedbacks.push({
      date: feedback.date,
      purpose: feedback.purpose,
      summary: req.body.summary,
      teacherId: feedback.teacherId,
    });

    feedback.remove(); // Remove from upcoming feedbacks
    await student.save();

    res.status(200).json(student.pastFeedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
  const { studentId, feedbackId } = req.params;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feedback = student.upcomingFeedbacks.id(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.remove();
    await student.save();

    res.status(200).json(student.upcomingFeedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get upcoming feedback
const getUpcomingFeedback = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student.upcomingFeedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get past feedback
const getPastFeedback = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

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

    student.calls.push({ date, timing, teacherId });
    await student.save();

    res.status(201).json(student.calls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get calls
const getCalls = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student.calls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createUpcomingFeedback,
  updateFeedbackToPast,
  deleteFeedback,
  getUpcomingFeedback,
  getPastFeedback,
  createCall,
  getCalls,
};
