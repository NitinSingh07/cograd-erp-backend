
const { DateTime } = require('luxon');
const Attendance = require("../models/attendanceModel");
const Student = require("../models/studentSchema"); // Import Student model

const takeAttendance = async (req, res) => {
  try {
    const { studentId, status } = req.body;

    // Fetch student details based on studentId
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate current date in dd/mm/yy format
    const currentDate = DateTime.local().toFormat('dd/MM/yy');

    // Save attendance record to the database with current date
    const attendanceRecord = new Attendance({
      student: studentId,
      date: currentDate,
      status
    });

    await attendanceRecord.save();

    res.status(201).json({ message: `Attendance recorded successfully for ${student.name}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { studentId, status } = req.body;

    // Generate current date in dd/mm/yy format
    const currentDate = DateTime.local().toFormat('dd/MM/yy');
    // Fetch student details based on studentId
    const student = await Student.findById(studentId);
    // Find attendance record for today and the provided student ID
    let attendanceRecord = await Attendance.findOne({ student: studentId, date: currentDate });

    // If attendance record for today exists, update it
    if (attendanceRecord) {
      attendanceRecord.status = status;
      await attendanceRecord.save();
      res.status(200).json({ message: `Attendance updated successfully for today for ${student.name}` });
    } else {
      // If attendance record for today doesn't exist
      res.status(404).json({ message: 'No attendance record found for today' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports = {
  updateAttendance,
  takeAttendance

}