const router = require("express").Router();

const {
  studentRegister,
  studentLogIn,
  getStudentDetail,
  studentList,
  schoolStudentList,
} = require("../controllers/studentController.js");
const singleUpload = require("../middleware/multer.js");

router.post("/register", singleUpload, studentRegister);
router.post("/login", studentLogIn);
router.get("/:id", getStudentDetail);

router.get("/studentList/:id", studentList);
router.get("/get/list", schoolStudentList);

router.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("studentToken");
  res.send({ message: "Logged out successfully" });
});
module.exports = router;
