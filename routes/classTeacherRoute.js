const router = require("express").Router();

const {
  classTeacherRegister,
  classTeacherLogIn,
  getClassTeacherDetail,
} = require("../controllers/classTeacherController");

router.post("/register", classTeacherRegister);
router.post("/login", classTeacherLogIn);
router.get("/:school", getClassTeacherDetail);
module.exports = router;
