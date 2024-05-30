const TeacherAttendance = require("../models/teacherAttendanceModel");
const { getTeacher } = require("../service/teacherAuth");
const DateTime = require("luxon").DateTime;


const getTeacherAttendance = async (req, res) => {
  try {
     // Retrieve the teacher's token from cookies and decode it
     const token = req.cookies?.teacherToken;
   
 
     const decodedToken = getTeacher(token);
 
     // If token decoding fails, return an unauthorized response
     if (!decodedToken) {
       return res.status(401).json({ message: "Unauthorized" });
     }
 
     const teacherId = decodedToken.id; // Get teacher ID from the token

    // Fetch attendance records for the teacher
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
    const token = req.cookies?.teacherToken; // Get the teacher token
    const teacherInfo = getTeacher(token); // Validate the teacher

    if (!teacherInfo) {
      return res.status(401).json({ message: "Unauthorized" }); // Unauthorized response
    }

    const { date, status } = req.body; // Get the date and status from the request body
    const teacherId = teacherInfo.id;

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
    const token = req.cookies?.teacherToken;

    const decodedToken = getTeacher(token);

    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const teacherId = decodedToken.id; // Teacher ID

    const { month: targetMonth } = req.body; // Month from request
    const normalizedTargetMonth = targetMonth.toString().padStart(2, "0"); // Ensure leading zero
    const attendanceRecords = await TeacherAttendance.find({
      teacher: teacherId,
    });

    const matchingAttendanceRecords = attendanceRecords.filter((record) => {
      const recordMonth = record.date.split("-")[1]; // Get the month part from the date
      console.log("Record date:", record.date, "| Extracted month:", recordMonth);

      return recordMonth === normalizedTargetMonth; // Ensure they match exactly
    });


    if (matchingAttendanceRecords.length === 0) {
      console.log("No records found for the specified month.");
    }

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
      }
    });

    console.log("Present count:", presentCount, "| Absent count:", absentCount, "| Leave count:", leaveCount);

    res.status(200).json({
      message: "Attendance calculated successfully",
      data: {
        month: normalizedTargetMonth,
        presentCount,
        absentCount,
        leaveCount,
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
