const { getSchool } = require("../service/schoolAuth");
const TeacherAttendance = require("../models/teacherAttendanceModel");
const School = require("../models/school");
const Teacher = require("../models/teacherModel");
// const { DateTime } = require("luxon");
// const { getAdmin } = require("../service/adminAuth");

const takeTeacherAttendance = async (req, res) => {
  try {
    const { statuses, date, schoolId } = req.body; // get the date from request body

    const teachers = await Teacher.find({ school: schoolId });
    if (!teachers || teachers.length === 0) {
      return res
        .status(404)
        .json({ message: "No teachers found in the school" });
    }

    if (statuses.length !== teachers.length) {
      return res
        .status(400)
        .json({ message: "Mismatch in number of statuses and teachers" });
    }

    // Check if attendance is already recorded for the given date and school
    const existingAttendance = await TeacherAttendance.findOne({
      date,
      school: schoolId,
    });

    if (existingAttendance) {
      return res
        .status(400)
        .json({ message: `Attendance has already been recorded for ${date}` });
    }

    // Create attendance records for each teacher
    const attendanceRecords = teachers.map((teacher, index) => ({
      teacher: teacher._id,
      date,
      status: statuses[index],
      school: schoolId,
    }));

    await TeacherAttendance.insertMany(attendanceRecords);

    res
      .status(201)
      .json({ message: "Teacher attendance recorded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTeacherAttendanceByDate = async (req, res) => {
  try {
    //have to remove token later!
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

// const getAllTeachersAttendanceByDate = async (req, res) => {
//   try {
//     const token = req.cookies?.token;
//     const decodedToken = getSchool(token);

//     if (!decodedToken || !decodedToken.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { date } = req.body; // date from request body
//     const schoolId = decodedToken.id;

//     const attendance = await TeacherAttendance.find({
//       date, // using date as a string
//       school: schoolId,
//     }).populate("teacher", "name");

//     if (!attendance || attendance.length === 0) {
//       return res.status(404).json({ message: `No attendance found for ${date}` });
//     }

//     res.status(200).json({ attendance });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const getTeachersBySchool = async (req, res) => {
  try {
    const schoolId = req.params.id;

    const teachers = await Teacher.find({
      school: schoolId,
    })
      .populate({
        path: "teachSubjects",
        populate: {
          path: "className",
          select: "className", // specify the fields you want from the Class model
        },
        select: "subName",
      })
      .select("-password");

    if (!teachers || teachers.length === 0) {
      return res
        .status(404)
        .json({ message: "No teachers found in the school" });
    }

    res.status(200).json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editTeacherAttendance = async (req, res) => {
  try {
    const { teacherId, date, status } = req.body;

    const attendance = await TeacherAttendance.findOne({
      teacher: teacherId,
      date,
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ message: "Teacher hasn't marked his attendance " });
    }

    attendance.status = status; // Update attendance status
    await attendance.save();

    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error editing attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//for particular school date 2
const getSchoolTeachersAttendanceByDate = async (req, res) => {
  try {
    const { date, schoolId } = req.body;
    if (!schoolId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const attendance = await TeacherAttendance.find({
      date,
      school: schoolId,
    }).populate("teacher", "name email profile"); // Populate teacher name, email, and profile

    if (!attendance || attendance.length === 0) {
      return res
        .status(404)
        .json({ message: `No attendance found for ${date}` });
    }

    // Calculate attendance counts based on status
    const presentCount = attendance.filter(
      (record) => record.status === "p"
    ).length;
    const absentCount = attendance.filter(
      (record) => record.status === "a"
    ).length;
    const lateCount = attendance.filter(
      (record) => record.status === "l"
    ).length;
    const shortLeaveCount = attendance.filter(
      (record) => record.status === "sl"
    ).length;
    const halfDayCount = attendance.filter(
      (record) => record.status === "hd"
    ).length;

    return res.status(200).json({
      attendance,
      presentCount,
      absentCount,
      lateCount,
      shortLeaveCount,
      halfDayCount,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllTeachersAttendanceByDate = async (req, res) => {
  try {
    const { todayDate, adminId } = req.body;
    if (!adminId) {
      return res.status(401).json({ message: "Only accessible to Admin" });
    }

    const attendance = await TeacherAttendance.find({
      date: todayDate,
    }).populate("teacher", "name email");

    if (!attendance || attendance.length === 0) {
      return res
        .status(404)
        .json({ message: `No attendance found for ${todayDate}` });
    }

    // Calculate attendance counts based on status
    const presentCount = attendance.filter(
      (record) => record.status === "p"
    ).length;
    const absentCount = attendance.filter(
      (record) => record.status === "a"
    ).length;
    const lateCount = attendance.filter(
      (record) => record.status === "l"
    ).length;
    const shortLeaveCount = attendance.filter(
      (record) => record.status === "sl"
    ).length;
    const halfDayCount = attendance.filter(
      (record) => record.status === "hd"
    ).length;

    return res.status(200).json({
      attendance,
      presentCount,
      absentCount,
      lateCount,
      shortLeaveCount,
      halfDayCount,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  takeTeacherAttendance,
  getTeachersBySchool,
  getTeacherAttendanceByDate,
  editTeacherAttendance,
  getSchoolTeachersAttendanceByDate,
  getAllTeachersAttendanceByDate, // Ensure this is only included once
};
