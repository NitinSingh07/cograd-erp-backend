const express = require("express");
const {
  markSelfAttendance,
} = require("../controllers/teacherAttendanceController");

const router = express.Router();

// Endpoint for teachers to mark their own attendance
router.post("/markSelf", markSelfAttendance);

module.exports = router;
