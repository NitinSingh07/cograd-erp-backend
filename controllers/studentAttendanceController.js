const { decode } = require("jsonwebtoken");
const Attendance = require("../models/studentAttendanceModel");
const ClassTeacher = require("../models/classTeacherModel");
const Student = require("../models/studentSchema");
const { getClassTeacher } = require("../service/classTeacherAuth");

// Take student attendance
const takeAttendance = async (req, res) => {
  try {
    const token = req.cookies?.classTeacherToken; // Get token from cookies
    const decodedToken = getClassTeacher(token); // Decode to get class teacher ID
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const classTeacherId = decodedToken.id;
    const { statuses, date } = req.body; // Get statuses and date from the body

    const classTeacher = await ClassTeacher.findById(classTeacherId);

    if (!classTeacher) {
      return res.status(404).json({ message: "Class teacher not found" });
    }

    const classId = classTeacher.className;
    const students = await Student.find({ className: classId });

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({ date });

    if (existingAttendance) {
      return res
        .status(409)
        .json({ message: `Attendance already recorded for ${date}` });
    }

    // Create attendance records
    const attendanceRecords = students.map((student, index) => ({
      student: student._id,
      classTeacher: classTeacher._id,
      date,
      status: statuses[index],
    }));

    await Attendance.insertMany(attendanceRecords);
    const populatedAttendance = await Attendance.find({ date }).populate(
      "student",
      "name"
    ); // Populate student name
    res.status(200).json({
      message: "Attendance recorded successfully",
      attendance: populatedAttendance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update student attendance for the current date
const updateAttendance = async (req, res) => {
  try {
    const token = req.cookies?.token; // Get token from cookies
    const decodedToken = getClassTeacher(token);
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { studentId, status } = req.body; // Get student ID and status
    const { date } = req.params; // Date from the URL parameter

    // Update attendance record
    let attendanceRecord = await Attendance.findOneAndUpdate(
      { student: studentId, date },
      { status },
      { new: true }
    );

    res.status(200).json({
      message: `Attendance updated successfully for ${attendanceRecord.student} with status ${status}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get attendance for a specific student and date
const getStudentAttendanceByDate = async (req, res) => {
  try {
    const { studentId, date } = req.params;

    const attendance = await Attendance.findOne({
      student: studentId,
      date,
    }).populate("student", "name");

    if (!attendance) {
      return res
        .status(404)
        .json({ message: `Attendance not found for ${date}` });
    }

    res.status(200).json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all students' attendance for a specific date
const getstudentAttendanceOfClassAll = async (req, res) => {
  try {
    const token = req.cookies?.classTeacherToken; // Get token from cookies
    const decodedToken = getClassTeacher(token); // Decode to get class teacher ID
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const date = req.params.date;

    const classTeacherId = decodedToken.id;
    const attendance = await Attendance.find({
      classTeacher: classTeacherId,
      date,
    }).populate("student", "name");

    if (!attendance || attendance.length === 0) {
      return res
        .status(404)
        .json({ message: `.......... ${classTeacherId}` });
    }
    res.status(200).json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkConsecutiveAbsences = async (req, res) => {
  try {
   
    const classTeacherToken = req.cookies?.classTeacherToken;
    const decodedToken = getClassTeacher(classTeacherToken);
  

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const classTeacher = await ClassTeacher.findById(decodedToken.id);
    if (!classTeacher) {
      return res.status(404).json({ message: "Class teacher not found" });
    }

    // Fetch all students from the class
    const students = await Student.find({ className: classTeacher.className });

    const results = [];
    const absenceThreshold = 3;

    for (const student of students) {
      // Find the last three attendance records for this student in this class,
      // ordered by date (most recent first)
      const attendances = await Attendance.find({ student: student._id })
        .sort({ date: -1 })
        .limit(absenceThreshold);

      // Check if there are exactly three records and they are all marked "a" for absent
      if (
        attendances.length === absenceThreshold &&
        attendances.every((attendance) => attendance.status === "a")
      ) {
        // Add the student to the notification list
        results.push({ studentName: student.name, studentId: student._id });
      }
    }

    if (results.length > 0) {
      res.status(200).json({
        message: "Students with three consecutive absences detected.",
        students: results,
      });
    } else {
      res.status(200).json({
        message: "No students with three consecutive absences.",
      });
    }
  } catch (error) {
    console.error("Error checking consecutive absences:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get last 10 days' attendance for all students in a class
const getstudentAttendanceOfClass = async (req, res) => {
  try {
    const classTeacherId = req.params.id;
    if (!classTeacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const classTeacher = await ClassTeacher.findById(classTeacherId);

    if (!classTeacher) {
      return res.status(404).json({ message: "Class teacher not found" });
    }

    const students = await Student.find({ className: classTeacher.className });
    const results = [];

    for (const student of students) {
      // Find the attendance records for this student in the last 10 days,
      // ordered by date (most recent first)
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const attendances = await Attendance.find({
        student: student._id,
        date: { $gte: tenDaysAgo.toISOString().split("T")[0] }, // Convert date to string and remove time part
      }).sort({ date: 1 });

      // Construct the attendance string for the last 10 days
      let attendanceString = "";
      for (const attendance of attendances) {
        attendanceString += attendance.status + " ";
      }

      // Add the attendance string to the results
      results.push({
        studentId: student._id,
        studentName: student.name,
        attendance: attendanceString.trim(),
      });
    }

    res.status(200).json({
      message: "Student attendance for the last 10 days.",
      students: results,
    });
  } catch (error) {
    console.error("Error checking student attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getStudentAttendanceById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const attendance = await Attendance.find({
      student: studentId,
    }).populate("student", "name");

    if (!attendance || attendance.length === 0) {
      return res
        .status(404)
        .json({ message: `Attendance not found for student with ID ${studentId}` });
    }

    res.status(200).json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  updateAttendance,
  takeAttendance,
  getStudentAttendanceByDate,
  getstudentAttendanceOfClass,
  checkConsecutiveAbsences,
  getstudentAttendanceOfClassAll,
  getStudentAttendanceById
};
