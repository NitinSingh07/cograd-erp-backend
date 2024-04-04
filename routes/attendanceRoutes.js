// attendanceRoutes.js

const express = require("express");
const router = express.Router();
const { takeAttendance, updateAttendance, getStudentList, getStudentAttendanceByDate, getAllStudentsAttendanceByDate } = require("../controllers/attendanceController");

router.post("/mark/:classTeacherId", takeAttendance);
// router.put("/mark/:classTeacherId", updateAttendance); // Use PUT method for updating
router.get('/students/:classTeacherId', getStudentList);
// http://localhost:4000/attendance/attendance/660d9780d4437a2a864c8c02/660d98c9a9792b8374fe794b/2024-04-03T18:30:00.000Z
router.get('/attendance/:classTeacherId/:studentId/:date', getStudentAttendanceByDate);
router.get('/attendance/:classTeacherId/:date', getAllStudentsAttendanceByDate);

module.exports = router;
