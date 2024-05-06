const TeacherAttendance = require("../models/teacherAttendanceModel");
const { getTeacher } = require("../service/teacherAuth");
const DateTime = require("luxon").DateTime;

const markSelfAttendance = async (req, res) => {
  try {
    const token = req.cookies?.teacherToken; // Get the teacher token
    const teacherInfo = getTeacher(token); // Validate the teacher

    if (!teacherInfo) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date, status } = req.body; // Get the date and status from the request body
    const teacherId = teacherInfo.id;

    const existingAttendance = await TeacherAttendance.findOne({
      teacher: teacherId,
      date,
    });

    if (existingAttendance) {
      return res.status(400).json({ message: `Attendance already marked for ${date}` });
    }

    const newAttendance = new TeacherAttendance({
      teacher: teacherId,
      date,
      status,
    });

    await newAttendance.save();

    res.status(201).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  markSelfAttendance,
  // Other existing exports
};
