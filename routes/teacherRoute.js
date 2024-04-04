const express = require("express");
const { teacherRegister, getTeachersBySchool } = require("../controllers/teacherController");

const router = express.Router();

router.post("/register", teacherRegister);
router.get("/get/:schoolId", getTeachersBySchool);
module.exports = router;
