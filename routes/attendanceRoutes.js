const express = require("express");
const router = express.Router();
const { takeAttendance, updateAttendance } = require("../controllers/attendanceController");

router.put("/update", updateAttendance); // Add new route for updating attendance

router.post("/mark", takeAttendance);

module.exports = router;
