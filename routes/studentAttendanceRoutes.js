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
router.get("/checkConsecutive/:id", checkConsecutiveAbsences);
router.get("/byCT/:id", getstudentAttendanceOfClass);

router.get("/:studentId/:date", getStudentAttendanceByDate);

router.get("/:date", getstudentAttendanceOfClassAll);


module.exports = router;
