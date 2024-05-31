const express = require("express");
const {
  teacherLogin,
  addTimeline,
  fetchTeacherTimeline,
  getAllTeacherList,getTeacherById
} = require("../controllers/teacherController");
const router = express.Router();

// router.post("/register", teacherRegister);
router.post("/login", teacherLogin);
router.post("/addTimeline/:id", addTimeline);
router.get("/getAllTeachers/:adminId", getAllTeacherList);
router.get("/getTeacherById/:id", getTeacherById);

router.get("/fetchTimeline/:id", fetchTeacherTimeline);
router.post("/logout", (req, res) => {
  res.clearCookie("teacherToken");

  res.send({ message: "Logged out successfully" });
});

module.exports = router;
