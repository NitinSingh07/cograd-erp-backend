const TeacherAttendance = require("../models/teacherAttendanceModel");
const { getTeacher } = require("../service/teacherAuth");
const DateTime = require("luxon").DateTime;
const getTeacherAttendance = async (req, res) => {
  try {
    const token = req.cookies?.teacherToken; // Retrieve the teacher's token from cookies
    const decodedToken = getTeacher(token); // Validate and decode the token

    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" }); // Return 401 if the token is invalid
    }

    const teacherId = decodedToken.id; // Get teacher ID from request parameters
    console.log(teacherId);
    // Fetch attendance records for the teacher
    const attendanceRecords = await TeacherAttendance.find({
      teacher: teacherId
    });
    console.log(attendanceRecords)

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
    // Retrieve the teacher's token from cookies and decode it
    const token = req.cookies?.teacherToken;
    console.log("Teacher token:", token);
    
    const decodedToken = getTeacher(token);
    console.log("Decoded token:", decodedToken);

    // If token decoding fails, return an unauthorized response
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const teacherId = decodedToken.id; // Get teacher ID from the token
    console.log("Teacher ID:", teacherId);

    // Get the target month from the request body
    const { month: targetMonth } = req.body;

    // Retrieve all attendance records for this teacher
    const attendanceRecords = await TeacherAttendance.find({
      teacher: teacherId,
    });


    // Filter records to include only those with a matching month
    const matchingAttendanceRecords = attendanceRecords.filter(record => {
      const dateParts = record.date.split('-'); // Split the date string
      const recordMonth = dateParts[1]; // Extract the month
      
      return recordMonth === targetMonth; // Check if the extracted month matches
    });
    // Initialize counters for present, absent, and leave
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    // Count the status occurrences for matching records
    matchingAttendanceRecords.forEach(record => {
      switch (record.status) {
        case 'p':
          presentCount++;
          break;
        case 'a':
          absentCount++;
          break;
        case 'l':
          leaveCount++;
          break;
      }
    });

    console.log("Present count:", presentCount, "| Absent count:", absentCount, "| Leave count:", leaveCount);

    // Return the results as a JSON response
    res.status(200).json({
      message: "Attendance calculated successfully",
      data: {
        month: targetMonth,
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
