const router = require("express").Router();
const express = require("express");
const {
  classTeacherRegister,
  classTeacherLogIn,
  getAllClassTeacherDetail, checkClassTeacher, getClassTeacherDetail
} = require("../controllers/classTeacherController");
const { restrictClassTeacherTo, checkForClassTeacherAuthentication } = require("../middleware/auth");
const app = express();

router.post("/login", classTeacherLogIn);
router.get("/:school", getAllClassTeacherDetail);

router.get("/get/details/:id", getClassTeacherDetail);
router.get("/check/:teacherId", checkClassTeacher);
router.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("classTeacherToken");
  res.send({ message: "Class Teacher Logged out successfully" });
});
module.exports = router;
