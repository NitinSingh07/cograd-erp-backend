const express = require("express");
const {
  allComplains,
  registeredComplains,
  studentComplains,
  parentComplains,
  teacherComplains,
  classTeacherComplains,
} = require("../controllers/complaintBoxController");

const router = express.Router();

router.get("/", allComplains);
router.post("/register", registeredComplains);
router.get("/studentComplain", studentComplains);
router.get("/parentComplain", parentComplains);
router.get("/teacherComplain", teacherComplains);
router.get("/classTeacherComplain", classTeacherComplains);

module.exports = router;
