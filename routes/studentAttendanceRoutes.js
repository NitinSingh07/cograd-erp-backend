// attendanceRoutes.js

const express = require("express");
const router = express.Router();
const {
  takeAttendance,
  updateAttendance,
  getStudentAttendanceByDate,
  getstudentAttendanceOfClass,
  checkConsecutiveAbsences,
  getstudentAttendanceOfClassAll, getStudentAttOfSchool, getStudentAttOfAllSchool
} = require("../controllers/studentAttendanceController");
//login to classTeacher first before taking attendance
router.post("/mark", takeAttendance);
router.put("/update/:date", updateAttendance);

router.get("/checkConsecutive/:id", checkConsecutiveAbsences);
router.get("/byCT/:id", getstudentAttendanceOfClass);

router.get("/:studentId/:date", getStudentAttendanceByDate);

router.get("/:date", getstudentAttendanceOfClassAll);
router.get("/schoolAtt/:date/:id", getStudentAttOfSchool);
router.get("/schoolAttAll/:date/:id", getStudentAttOfAllSchool);



module.exports = router;
