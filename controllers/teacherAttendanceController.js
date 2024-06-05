const TeacherAttendance = require("../models/teacherAttendanceModel");
const { getTeacher } = require("../service/teacherAuth");
const DateTime = require("luxon").DateTime;


const getTeacherAttendance = async (req, res) => {
  try {
    //  // Retrieve the teacher's token from cookies and decode it
    //  const token = req.cookies?.teacherToken;
   
 
    //  const decodedToken = getTeacher(token);
 
    //  // If token decoding fails, return an unauthorized response
    //  if (!decodedToken) {
    //    return res.status(401).json({ message: "Unauthorized" });
    //  }
 
    //  const teacherId = decodedToken.id; // Get teacher ID from the token

    // Fetch attendance records for the teacher
    const teacherId = req.params.teacherId
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const attendanceRecords = await TeacherAttendance.find({
      teacher: teacherId
    });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No attendance records found" }); // Return 404 if no records found
    }

    res.status(200).json({
      message: "Attendance records retrieved successfully",
      data: attendanceRecords,
    });
  } catch (error) {
    console.error("Error retrieving attendance:", error);
    res.status(500).json({ message: "Internal server error" }); // Handle general errors
  }
};

const markSelfAttendance = async (req, res) => {
  try {
    // const token = req.cookies?.teacherToken; // Get the teacher token
    const{ teacherId, date, status} = req.body
    // const teacherInfo = getTeacher(token); // Validate the teacher

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" }); // Unauthorized response
    }

    // Check if attendance already exists for this teacher on the given date
    const existingAttendance = await TeacherAttendance.findOne({
      teacher: teacherId,
      date,
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: `Attendance already marked for ${date}`,
        attendance: existingAttendance, // Include existing attendance in the response
      });
    }

    // Create new attendance record
    const newAttendance = new TeacherAttendance({
      teacher: teacherId,
      date,
      status,
    });

    // Save the new attendance record to the database
    await newAttendance.save();

    // Send a successful response with the new attendance data
    res.status(201).json({
      message: "Attendance marked successfully",
      attendance: newAttendance, // Include the new attendance record in the response
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal server error" }); // General error handling
  }
};

const calculateAttendance = async (req, res) => {
  try {
    const teacherId = req.body.teacherId;
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { month: targetMonth, year: targetYear } = req.body; // Month and year from request


    const normalizedTargetMonth = targetMonth.toString().padStart(2, "0"); // Ensure leading zero if single digit


    const attendanceRecords = await TeacherAttendance.find({ teacher: teacherId });

    const matchingAttendanceRecords = attendanceRecords.filter((record) => {
      const [recordYear, recordMonth] = record.date.split("-"); // Extract the year and month from the date (e.g., '2024-06-05')
   
      return recordMonth === normalizedTargetMonth && recordYear === targetYear.toString(); // Ensure both year and month match exactly
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
        attendanceRecords: matchingAttendanceRecords, // Include attendance data
      },
    });
  } catch (error) {
    console.error("Error calculating attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  markSelfAttendance, calculateAttendance, getTeacherAttendance
  // Other existing exports
};
