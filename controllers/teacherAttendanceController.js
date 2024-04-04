const { DateTime } = require('luxon');
const teacherAttendance = require("../models/teacherAttendanceModel");
const Teacher = require("../models/teacherModel");

const takeTeacherAttendance = async (req, res) => {
  try {
    const { schoolName, statuses } = req.body;

    // Find teachers by school name
    const teachers = await Teacher.find({ schoolName });

    const currentDate = DateTime.local().toFormat('dd/MM/yy');

    let attendanceRecords = [];

    // Create attendance records for each teacher
    for (let i = 0; i < teachers.length; i++) {
      const attendanceRecord = new teacherAttendance({
        teacher: teachers[i]._id,
        date: currentDate,
        status: statuses[i]
      });
      attendanceRecords.push(attendanceRecord);
    }

    // Save all attendance records to the database
    await teacherAttendance.insertMany(attendanceRecords);

    res.status(201).json({ message: 'Teacher attendance recorded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTeacherAttendanceByDate = async (req, res) => {
  try {
    const { schoolName, teacherId, date } = req.params;

    const attendance = await teacherAttendance.findOne({ teacher: teacherId, date }).populate('teacher', 'name');
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

    const attendance = await teacherAttendance.find({ date }).populate('teacher', 'name');
    if (!attendance) {
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
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  takeTeacherAttendance,
  getTeachersBySchool,
  getTeacherAttendanceByDate,
  getAllTeachersAttendanceByDate
};
