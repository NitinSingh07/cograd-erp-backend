const TeacherAttendance = require("../models/teacherAttendanceModel");
const { getTeacher } = require("../service/teacherAuth");
const DateTime = require("luxon").DateTime;

const getTeacherAttendance = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { year, month } = req.query;
    const normalizedMonth = month.toString().padStart(2, "0");

    const attendanceRecords = await TeacherAttendance.find({
      teacher: teacherId,
      date: {
        $gte: `${year}-${normalizedMonth}-01`,
        $lt: `${year}-${(parseInt(normalizedMonth) + 1)
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

    const validStatuses = ["p", "a", "l", "sl", "hd"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    console.log(`Teacher ID: ${teacherId}, Date: ${date}, Status: ${status}`); // Debug log

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
      await existingAttendance.save(); // Ensure this saves correctly

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

    const { month, year } = req.body;
    const normalizedMonth = month.toString().padStart(2, "0");

    const attendanceRecords = await TeacherAttendance.find({
      teacher: teacherId,
    });

    const matchingAttendanceRecords = attendanceRecords.filter((record) => {
      const [recordYear, recordMonth] = record.date.split("-");
      return recordMonth === normalizedMonth && recordYear === year.toString();
    });

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let shortleaveCount = 0;
    let halfdayCount = 0;

    matchingAttendanceRecords.forEach((record) => {
      switch (record.status) {
        case "p":
          presentCount++;
          break;
        case "a":
          absentCount++;
          break;
        case "l":
          lateCount++;
          break;
        case "sl":
          shortleaveCount++;
          break;
        case "hd":
          halfdayCount++;
          break;
        default:
          console.log("Unknown status:", record.status);
      }
    });

    res.status(200).json({
      message: "Attendance calculated successfully",
      data: {
        month: normalizedMonth,
        year,
        presentCount,
        absentCount,
        lateCount,
        shortleaveCount,
        halfdayCount,
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
