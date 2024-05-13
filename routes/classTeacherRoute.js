const router = require("express").Router();

const {
  classTeacherRegister,
  classTeacherLogIn,
  getAllClassTeacherDetail, checkClassTeacher, getClassTeacherDetail
} = require("../controllers/classTeacherController");


router.post("/login", classTeacherLogIn);
router.get("/:school", getAllClassTeacherDetail);
router.get("/get", getClassTeacherDetail);
router.get("/check/:teacherId", checkClassTeacher);
router.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("classTeacherToken");
  res.send({ message: "Class Teacher Logged out successfully" });
});
module.exports = router;
