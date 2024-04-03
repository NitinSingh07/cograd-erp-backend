const router = require("express").Router();

const {
  studentRegister,
  studentLogIn,
  getStudentDetail,
  studentList,
} = require("../controllers/studentController.js");

router.post("/register", studentRegister);
router.post("/login", studentLogIn);
router.get("/:id", getStudentDetail);
router.get("/studentList/:id", studentList);
module.exports = router;
