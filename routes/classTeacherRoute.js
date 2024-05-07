const router = require("express").Router();

const {
  classTeacherRegister,
  classTeacherLogIn,
  getClassTeacherDetail,checkClassTeacher
} = require("../controllers/classTeacherController");


router.post("/login", classTeacherLogIn);
router.get("/:school", getClassTeacherDetail);
router.get("/check/:teacherId", checkClassTeacher);
router.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("classTeacherToken");
  res.send({ message: "Class Teacher Logged out successfully" });
});
module.exports = router;
