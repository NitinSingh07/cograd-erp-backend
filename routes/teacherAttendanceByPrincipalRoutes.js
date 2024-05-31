const express = require("express");
const router = express.Router();
const {
  takeTeacherAttendance,
  getTeacherAttendanceByDate,
  getAllTeachersAttendanceByDate,
  getTeachersBySchool,
  editTeacherAttendance,
  getSchoolTeachersAttendanceByDate
} = require("../controllers/teacherAttendanceByPrincipalController");

const { teacherRegister } = require("../controllers/teacherController");
const {
  classTeacherRegister,
} = require("../controllers/classTeacherController");
//school id will be extracted from the token , you need to do just this for the attendance
//  "statuses": ["p", "a", "p", "p"]
router.post("/mark", takeTeacherAttendance);
router.post("/classTeacherReg", classTeacherRegister);
router.get("/get/:id", getTeachersBySchool);
router.post("/editAttendance", editTeacherAttendance); // Principal-only endpoint
router.get("/:teacherId/:date", getTeacherAttendanceByDate);
router.post("/getByDate", getAllTeachersAttendanceByDate);
router.post("/getByDate2", getSchoolTeachersAttendanceByDate);
router.post("/register", teacherRegister);
// http://localhost:4000/teacherReg/editAttendance

// {
//   "teacherId":"663333266131b27e48c9e5cb",
// "date": "2024-05-03" ,// Example date,
// "status":"a"

// }

module.exports = router;
