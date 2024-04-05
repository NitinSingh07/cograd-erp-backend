const { DateTime } = require('luxon');
const TeacherAttendance = require("../models/teacherAttendanceModel");
const School = require("../models/school");
const Teacher = require("../models/teacherModel");
const takeTeacherAttendance = async (req, res) => {
  try {
    const { schoolId, statuses } = req.body;

    // Find the school by school Id
    const school = await School.findOne({ _id: schoolId });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Get all teachers in the school
    const teachers = await Teacher.find({ school: school._id });
    if (!teachers || teachers.length === 0) {
      return res.status(404).json({ message: 'No teachers found in the school' });
    }

    if (statuses.length !== teachers.length) {
      return res.status(400).json({ message: 'Mismatch in number of statuses and teachers' });
    }

    const currentDate = DateTime.local().toFormat('dd/MM/yy');

    // Check if attendance is already recorded for the current date
    const existingAttendance = await TeacherAttendance.findOne({ date: currentDate });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance has already been recorded for today' });
    }

    let attendanceRecords = [];

    // Create attendance records for each teacher
    for (let i = 0; i < teachers.length; i++) {
      const attendanceRecord = new TeacherAttendance({
        teacher: teachers[i]._id,
        date: currentDate,
        status: statuses[i]
      });
      attendanceRecords.push(attendanceRecord);
    }

    // Save all teacher attendance records to the database
    await TeacherAttendance.insertMany(attendanceRecords);

    res.status(201).json({ message: 'Teacher attendance recorded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTeacherAttendanceByDate = async (req, res) => {
  try {
    const { schoolName, teacherId, date } = req.params;

    const attendance = await TeacherAttendance.findOne({ teacher: teacherId, date }).populate('teacher', 'name');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found for the specified teacher on the given date' });
    }

    res.status(200).json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllTeachersAttendanceByDate = async (req, res) => {
  try {
    const { schoolName, date } = req.params;

    const attendance = await TeacherAttendance.find({ date }).populate('teacher', 'name');
    if (!attendance || attendance.length === 0) {
      return res.status(404).json({ message: 'Attendance not found for the specified date' });
    }

    res.status(200).json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getTeachersBySchool = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const teachers = await Teacher.find({ school: schoolId }).populate("teachSubjects.subject", "subjectName").select("-password");

    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  takeTeacherAttendance,
  getTeachersBySchool,
  getTeacherAttendanceByDate,
  getAllTeachersAttendanceByDate
};
