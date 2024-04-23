const { getSchool } = require("../service/schoolAuth");
const TeacherAttendance = require("../models/teacherAttendanceModel");
const School = require("../models/school");
const Teacher = require("../models/teacherModel");
const { DateTime } = require("luxon");

const takeTeacherAttendance = async (req, res) => {
  try {
    const token = req.cookies?.token;
    const decodedToken = getSchool(token);

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolId = decodedToken.id;
    const { statuses, date } = req.body; // get the date from request body

    const teachers = await Teacher.find({ school: schoolId });
    if (!teachers || teachers.length === 0) {
      return res.status(404).json({ message: "No teachers found in the school" });
    }

    if (statuses.length !== teachers.length) {
      return res.status(400).json({ message: "Mismatch in number of statuses and teachers" });
    }

    // Check if attendance is already recorded for the given date and school
    const existingAttendance = await TeacherAttendance.findOne({
      date,
      school: schoolId,
    });

    if (existingAttendance) {
      return res.status(400).json({ message: `Attendance has already been recorded for ${date}` });
    }

    // Create attendance records for each teacher
    const attendanceRecords = teachers.map((teacher, index) => ({
      teacher: teacher._id,
      date,
      status: statuses[index],
      school: schoolId,
    }));

    await TeacherAttendance.insertMany(attendanceRecords);

    res.status(201).json({ message: "Teacher attendance recorded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTeacherAttendanceByDate = async (req, res) => {
  try {
    const token = req.cookies?.token;
    const decodedToken = getSchool(token);

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { teacherId, date } = req.params; // date from params as string
    const schoolId = decodedToken.id;

    const attendance = await TeacherAttendance.findOne({
      teacher: teacherId,
      date,
      school: schoolId,
    }).populate("teacher", "name");

    if (!attendance) {
      return res.status(404).json({ message: `Attendance not found for ${date}` });
    }

    res.status(200).json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllTeachersAttendanceByDate = async (req, res) => {
  try {
    const token = req.cookies?.token;
    const decodedToken = getSchool(token);

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date } = req.body; // date from request body
    const schoolId = decodedToken.id;

    const attendance = await TeacherAttendance.find({
      date, // using date as a string
      school: schoolId,
    }).populate("teacher", "name");

    if (!attendance || attendance.length === 0) {
      return res.status(404).json({ message: `No attendance found for ${date}` });
    }

    res.status(200).json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTeachersBySchool = async (req, res) => {
  try {
    const token = req.cookies?.token;
    const decodedToken = getSchool(token);

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolId = decodedToken.id;

    const teachers = await Teacher.find({
      school: schoolId,
    }).populate("teachSubjects.subject", "subjectName").select("-password");

    if (!teachers || teachers.length === 0) {
      return res.status(404).json({ message: "No teachers found in the school" });
    }

    res.status(200).json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  takeTeacherAttendance,
  getTeachersBySchool,
  getTeacherAttendanceByDate,
  getAllTeachersAttendanceByDate,
};
