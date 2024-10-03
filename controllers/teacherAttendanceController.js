const TeacherAttendance = require("../models/teacherAttendanceModel");
const { getTeacher } = require("../service/teacherAuth");
const DateTime = require("luxon").DateTime;

const getTeacherAttendance = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const attendanceRecords = await TeacherAttendance.find({
      teacher: teacherId,
      date: {
        $gte: `${targetYear}-${normalizedTargetMonth}-01`,
        $lt: `${targetYear}-${(parseInt(normalizedTargetMonth) + 1)
          .toString()
          .padStart(2, "0")}-01`,
      },
    });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    res.status(200).json({
      message: "Attendance records retrieved successfully",
      data: attendanceRecords,
    });
  } catch (error) {
    console.error("Error retrieving attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const markSelfAttendance = async (req, res) => {
  try {
    const { teacherId, date, status, schoolId } = req.body;

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingAttendance = await TeacherAttendance.findOne({
      school: schoolId,
      teacher: teacherId,
      date,
    }).populate("teacher", "name");

    if (existingAttendance) {
      const previousStatus = existingAttendance.status;

      console.log(
        `Attendance for ${existingAttendance.teacher.name} on ${date} has been updated. Previous status: ${previousStatus}, New status: ${status}`
      );

      existingAttendance.status = status;
      await existingAttendance.save();

      return res.status(200).json({
        message: `Attendance updated successfully for ${existingAttendance.teacher.name} on ${date}`,
        attendance: existingAttendance,
      });
    }

    const newAttendance = new TeacherAttendance({
      teacher: teacherId,
      school: schoolId,
      date,
      status,
    });
    await newAttendance.save();
    await newAttendance.populate("teacher", "name");
    console.log(
      `New attendance marked for ${newAttendance.teacher.name} on ${date}. Status: ${status}`
    );
    res.status(201).json({
      message: "Attendance marked successfully",
      attendance: newAttendance,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const calculateAttendanceMonthly = async (req, res) => {
  try {
    const teacherId = req.body.teacherId;
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { month: targetMonth, year: targetYear } = req.body;

    const normalizedTargetMonth = targetMonth.toString().padStart(2, "0");

    const attendanceRecords = await TeacherAttendance.find({
      teacher: teacherId,
    });

    const matchingAttendanceRecords = attendanceRecords.filter((record) => {
      const [recordYear, recordMonth] = record.date.split("-");
      return (
        recordMonth === normalizedTargetMonth &&
        recordYear === targetYear.toString()
      );
    });

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    matchingAttendanceRecords.forEach((record) => {
      switch (record.status) {
        case "p":
          presentCount++;
          break;
        case "a":
          absentCount++;
          break;
        case "l":
          leaveCount++;
          break;
        default:
          console.log("Unknown status:", record.status);
      }
    });

    res.status(200).json({
      message: "Attendance calculated successfully",
      data: {
        month: normalizedTargetMonth,
        year: targetYear,
        presentCount,
        absentCount,
        leaveCount,
        attendanceRecords: matchingAttendanceRecords,
      },
    });
  } catch (error) {
    console.error("Error calculating attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  markSelfAttendance,
  calculateAttendanceMonthly,
  getTeacherAttendance,
};
