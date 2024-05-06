const router = require("express").Router();

const {
  classTeacherRegister,
  classTeacherLogIn,
  getClassTeacherDetail,checkClassTeacher
} = require("../controllers/classTeacherController");


router.post("/login", classTeacherLogIn);
router.get("/:school", getClassTeacherDetail);
router.get("/check/:teacherId", checkClassTeacher);

module.exports = router;
