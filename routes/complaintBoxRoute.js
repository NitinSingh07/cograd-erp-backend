const express = require("express");
const {
  allComplains,
  registeredComplains,
  studentComplains,
  parentComplains,
  teacherComplains,
  classTeacherComplains,
  complaintsByDate,
  referComplaint,
  resolveComplaint,
  complaintsReferredToTeacher,
} = require("../controllers/complaintBoxController");

const cloudinaryUploader = require("../utils/cloudinaryUplaoder");
const upload = require("../utils/multer");
const router = express.Router();

router.get("/:id", allComplains);
router.get("/complainsByDate", complaintsByDate);
router.post("/register", upload, registeredComplains);
router.get("/studentComplain/:id", studentComplains);
//pass the teacher id in request along with the complaintId
router.post("/referTo", referComplaint);
router.get("/parentComplain/:id", parentComplains);
router.post("/resolve", resolveComplaint);
router.get("/teacherComplain/:id", teacherComplains);
router.get("/classTeacherComplain", classTeacherComplains);
router.get("/referredComplaints/:id", complaintsReferredToTeacher);

module.exports = router;
