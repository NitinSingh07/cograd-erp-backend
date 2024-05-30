const express = require("express");
const {
  allComplains,
  registeredComplains,
  studentComplains,
  parentComplains,
  teacherComplains,
  classTeacherComplains,
  complaintsByDate,
  referComplaint, resolveComplaint, complaintsReferredToTeacher
} = require("../controllers/complaintBoxController");

const cloudinaryUploader = require("../utils/cloudinaryUplaoder");
const upload = require("../utils/multer");
const router = express.Router();

router.get("/", allComplains);
router.get("/complainsByDate", complaintsByDate);
router.post("/register", upload, registeredComplains);
router.get("/studentComplain", studentComplains);
//pass the teacher id in request along with the complaintId
router.post("/referTo", referComplaint);
router.get("/parentComplain", parentComplains);
router.post("/resolve", resolveComplaint);
router.get("/teacherComplain", teacherComplains);
router.get("/classTeacherComplain", classTeacherComplains);
router.get("/referredComplaints", complaintsReferredToTeacher);

module.exports = router;
