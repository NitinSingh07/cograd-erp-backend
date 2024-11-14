const express = require("express");
const router = express.Router();
const {
  takeTeacherAttendance,
  getTeacherAttendanceByDate,
  getAllTeachersAttendanceByDate,
  getTeachersBySchool,
  editTeacherAttendance,
  getSchoolTeachersAttendanceByDate,
} = require("../controllers/teacherAttendanceByPrincipalController");

const {
  teacherRegister,
  editTeacher,
} = require("../controllers/teacherController");
const {
  classTeacherRegister,
} = require("../controllers/classTeacherController");
const singleUpload = require("../middleware/multer");

//school id will be extracted from the token , you need to do just this for the attendance
//  "statuses": ["p", "a", "p", "p"]
router.post("/mark", takeTeacherAttendance);
router.post("/classTeacherReg", classTeacherRegister);
router.get("/get/:id", getTeachersBySchool);
router.post("/editAttendance", editTeacherAttendance); // Principal-only endpoint
router.get("/:teacherId/:date", getTeacherAttendanceByDate);
router.post("/getByDate", getAllTeachersAttendanceByDate); //for admin
router.post("/getByDate2", getSchoolTeachersAttendanceByDate); //for particular school
router.post("/register", singleUpload, teacherRegister);
router.put("/edit/:teacherId", singleUpload, editTeacher);
// http://localhost:4000/teacherReg/editAttendance

// {
//   "teacherId":"663333266131b27e48c9e5cb",
// "date": "2024-05-03" ,// Example date,
// "status":"a"

// }

module.exports = router;
