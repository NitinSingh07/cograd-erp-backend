const { DateTime } = require('luxon');
const Attendance = require("../models/studentAttendanceModel");
const ClassTeacher = require("../models/classTeacherModel");
const Student = require("../models/studentSchema");
const takeAttendance = async (req, res) => {
  try {
    const { classTeacherId, statuses } = req.body;

    // Find class teacher by ID
    const classTeacher = await ClassTeacher.findById(classTeacherId);
    if (!classTeacher) {
      return res.status(404).json({ message: 'Class teacher not found' });
    }

    const classId = classTeacher.className;

    const students = await Student.find({ className: classId });

    if (statuses.length !== students.length) {
      return res.status(400).json({ message: 'Mismatch in number of statuses and students' });
    }

    const currentDate = DateTime.local().toFormat('dd/MM/yy');

    // Check if attendance is already recorded for the current date
    const existingAttendance = await Attendance.findOne({ date: currentDate });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance has already been recorded for today' });
    }

    let attendanceRecords = [];

    // Create attendance records for each student
    for (let i = 0; i < students.length; i++) {
      const attendanceRecord = new Attendance({
        student: students[i]._id,
        date: currentDate,
        status: statuses[i]
      });
      attendanceRecords.push(attendanceRecord);
    }

    // Save all attendance records to the database
    await Attendance.insertMany(attendanceRecords);

    res.status(201).json({ message: 'Attendance recorded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const updateAttendance = async (req, res) => {
  try {
    const { classTeacherId, studentId, status } = req.body;

    // Generate current date in dd/mm/yy format
    const currentDate = DateTime.local().toFormat('dd/MM/yy');

    // Update attendance record for today
    let attendanceRecord = await Attendance.findOneAndUpdate(
      { student: studentId, date: currentDate },
      { status },
      { new: true }
    );

    res.status(200).json({ message: `Attendance updated successfully for ${attendanceRecord.student} with status ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getStudentList = async (req, res) => {
  try {
    const { classTeacherId } = req.params;

    // Find class teacher by ID
    const classTeacher = await ClassTeacher.findById(classTeacherId);
    if (!classTeacher) {
      return res.status(404).json({ message: 'Class teacher not found' });
    }

    // Get the class ID from the class teacher
    const classId = classTeacher.className;

    // Find all students belonging to the class
    const students = await Student.find({ className: classId });

    res.status(200).json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStudentAttendanceByDate = async (req, res) => {
  try {
    const { classTeacherId, studentId, date } = req.params;

    const attendance = await Attendance.findOne({ student: studentId, date }).populate('student', 'name');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found for the specified student on the given date' });
    }

    res.status(200).json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllStudentsAttendanceByDate = async (req, res) => {
  try {
    const { classTeacherId, date } = req.params;

    const attendance = await Attendance.find({ date }).populate('student', 'name');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found for the specified date' });
    }

    res.status(200).json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  updateAttendance,
  takeAttendance,
  getStudentList,
  getStudentAttendanceByDate,
  getAllStudentsAttendanceByDate
};