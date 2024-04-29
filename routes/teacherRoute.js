const express = require("express");
const {
  teacherRegister,
  teacherLogin,
  addTimeline,
  fetchTeacherTimeline,
} = require("../controllers/teacherController");
const router = express.Router();

// router.post("/register", teacherRegister);
router.post("/login", teacherLogin);
router.post("/addTimeline/:id", addTimeline);

router.get("/fetchTimeline/:id", fetchTeacherTimeline);
router.post("/logout", (req, res) => {
  res.clearCookie("teacherToken");

  res.send({ message: "Logged out successfully" });
});

module.exports = router;
