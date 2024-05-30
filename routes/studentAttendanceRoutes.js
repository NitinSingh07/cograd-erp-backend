// attendanceRoutes.js

const express = require("express");
const router = express.Router();
const {
  takeAttendance,
  updateAttendance,
  getStudentAttendanceByDate,
  getstudentAttendanceOfClass,
  checkConsecutiveAbsences,
  getstudentAttendanceOfClassAll
} = require("../controllers/studentAttendanceController");
//login to classTeacher first before taking attendance
router.post("/mark", takeAttendance);
router.get("/:studentId/:date", getStudentAttendanceByDate);
router.get("/getAttendanceByCT", getstudentAttendanceOfClass);
// router.get('/getAttendance-byClassTeacher10', getstudentAttendanceOfClass10);
// New route to check consecutive absences


router.get("/checkConsecutiveAbsences", checkConsecutiveAbsences);

router.get("/:date", getstudentAttendanceOfClassAll);

module.exports = router;
