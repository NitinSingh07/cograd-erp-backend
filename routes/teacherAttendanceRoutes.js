const express = require("express");
const router = express.Router();
const { 
    takeTeacherAttendance, 
    getTeacherAttendanceByDate, 
    getAllTeachersAttendanceByDate,
    getTeachersBySchool 
} = require("../controllers/teacherAttendanceController");

// Route for marking attendance
router.post("/mark", takeTeacherAttendance);

// Route for getting teachers by school
router.get("/get/:schoolId", getTeachersBySchool);

// Routes for getting teacher attendance
router.get('/:schoolName/:teacherId/:date', getTeacherAttendanceByDate);
router.get('/:schoolName/:date', getAllTeachersAttendanceByDate);

module.exports = router;
