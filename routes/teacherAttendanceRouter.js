const express = require("express");
const {
  markSelfAttendance, getTeacherAttendance, calculateAttendance
} = require("../controllers/teacherAttendanceController");

const router = express.Router();

// Endpoint for teachers to mark their own attendance
router.post("/markSelf", markSelfAttendance);
router.post("/individual-attendance", calculateAttendance)

module.exports = router;
