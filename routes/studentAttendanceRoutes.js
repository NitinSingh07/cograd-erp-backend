// attendanceRoutes.js

const express = require("express");
const router = express.Router();
const { takeAttendance, updateAttendance, getStudentList, getStudentAttendanceByDate, 
    getAllStudentsAttendanceByDate,checkConsecutiveAbsences } = require("../controllers/studentAttendanceController");
//login to classTeacher first before taking attendance 
router.post("/mark", takeAttendance);
// router.put("/mark/:classTeacherId", updateAttendance); // Use PUT method for updating
//to get the students list without any attendance
router.get('/studentsList', getStudentList);
// http://localhost:4000/attendance/attendance/660d9780d4437a2a864c8c02/660d98c9a9792b8374fe794b/2024-04-03T18:30:00.000Z
router.get('/:classTeacherId/:studentId/:date', getStudentAttendanceByDate);
router.get('/:classTeacherId/:date', getAllStudentsAttendanceByDate);
// New route to check consecutive absences
router.get("/checkConsecutiveAbsences", checkConsecutiveAbsences);


module.exports = router;
