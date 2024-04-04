// teacherAttendanceRoutes.js

const express = require("express");
const router = express.Router();
const { takeTeacherAttendance, getTeacherAttendanceByDate, 
    getAllTeachersAttendanceByDate,getTeachersBySchool } = require("../controllers/teacherAttendanceController");
    
//school name and status in the body to mark attendance 
// "schoolName":"660d8dc47c38601f49dcfcaf",
// "status":["a","p"]
router.post("/mark", takeTeacherAttendance);
//below route is same for teacher also 
router.get("/get/:schoolId",getTeachersBySchool)
router.get('/attendance/:schoolName/:teacherId/:date', getTeacherAttendanceByDate);
router.get('/attendance/:schoolName/:date', getAllTeachersAttendanceByDate);

module.exports = router;
