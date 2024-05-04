const { decode } = require("jsonwebtoken");
const Attendance = require("../models/StudentAttendanceModel");
const ClassTeacher = require("../models/classTeacherModel");
const Student = require("../models/studentSchema");
const { getClassTeacher } = require("../service/classTeacherAuth");

// Take student attendance
const takeAttendance = async (req, res) => {
  try {
    const token = req.cookies?.classTeacherToken; // Get token from cookies
    console.log(token);
    const decodedToken = getClassTeacher(token); // Decode to get class teacher ID
    console.log(decodedToken);
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
      return res.status(400).json({ message: `Attendance already recorded for ${date}` });
    }

    // Create attendance records
    const attendanceRecords = students.map((student, index) => ({
      student: student._id,
      classTeacher: classTeacher,
      date,
      status: statuses[index],
    }));
    await Attendance.insertMany(attendanceRecords);
    const populatedAttendance = await Attendance.find({ date }).populate("student", "name"); // Populate student name
    console.log(populatedAttendance);
    res.status(201).json({
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
    console.log(decodedToken);
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

// Get student list for a class teacher
const getStudentList = async (req, res) => {
  try {
    const classTeacherToken = req.cookies?.classTeacherToken;
    const decodedToken = getClassTeacher(classTeacherToken);
    console.log(decodedToken);

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const classTeacher = await ClassTeacher.findById(decodedToken.id);
    if (!classTeacher) {
      return res.status(404).json({ message: "Class teacher not found" });
    }

    const classId = classTeacher.className;
    const students = await Student.find({ className: classId });

    res.status(200).json({ students });
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
      return res.status(404).json({ message: `Attendance not found for ${date}` });
    }

    res.status(200).json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all students' attendance for a specific date
const getAllStudentsAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const attendance = await Attendance.find({ date }).populate("student", "name");

    if (!attendance || attendance.length === 0) {
      return res.status(404).json({ message: `No attendance found for ${date}` });
    }

    res.status(200).json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const checkConsecutiveAbsences = async (req, res) => {
  try {
    const classTeachers = await ClassTeacher.find();

    const consecutiveAbsentees = await Attendance.aggregate([
      {
        // Group by student and collect all attendance records
        $group: {
          _id: "$student",
          attendance: {
            $push: { status: "$status", date: "$date" },
          },
        },
      },
      {
        // Sort the 'attendance' array by 'date' in descending order
        $project: {
          student: "$_id",
          sortedAttendance: {
            $sortArray: { input: "$attendance", sortBy: { date: -1 } },
          },
        },
      },
      {
        // Get the last three records
        $project: {
          student: "$student",
          lastThree: { $slice: ["$sortedAttendance", 0, 3] },
        },
      },
      {
        // Check if the last three are all 'a' and their dates are consecutive
        $match: {
          $and: [
            { "lastThree": { $size: 3 } },
            { "lastThree.status": { $all: ["a"] } },
            {
              $expr: {
                $and: [
                  {
                    $eq: [
                      { $subtract: [{ $arrayElemAt: ["$lastThree[0].date", 0] }, 1] },
                      { $arrayElemAt: ["$lastThree[1].date", 0] },
                    ],
                  },
                  {
                    $eq: [
                      { $subtract: [{ $arrayElemAt: ["$lastThree[1].date", 0] }, 1] },
                      { $arrayElemAt: ["$lastThree[2].date", 0] },
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
      {
        // Join with the student collection to get additional information
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
    ]);

    console.log("Consecutive Absentees:", consecutiveAbsentees);

    // Notify class teachers about the detected consecutive absentees
    consecutiveAbsentees.forEach((absentee) => {
      const studentName = absentee.studentInfo[0]?.name;

      classTeachers.forEach((teacher) => {
        console.log(`Notification to ${teacher.name}: ${studentName} has been absent for three consecutive days.`);
      });
    });

    res.status(200).json({ message: "Consecutive absences checked." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  updateAttendance,
  takeAttendance,
  getStudentList,
  getStudentAttendanceByDate,
  getAllStudentsAttendanceByDate, checkConsecutiveAbsences
};
