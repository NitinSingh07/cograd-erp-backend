const express = require("express");
const router = express.Router();
const {
  takeTeacherAttendance,
  getTeacherAttendanceByDate,
  getAllTeachersAttendanceByDate,
  getTeachersBySchool,
} = require("../controllers/teacherAttendanceController");
const { teacherRegister } = require("../controllers/teacherController");
//school id will be extracted from the token , you need to do just this for the attendance
//  "statuses": ["p", "a", "p", "p"] 
router.post("/mark", takeTeacherAttendance);

router.get("/get", getTeachersBySchool);

router.get("/:teacherId/:date", getTeacherAttendanceByDate);
router.post("/getByDate", getAllTeachersAttendanceByDate);
router.post("/register", teacherRegister);
module.exports = router;
