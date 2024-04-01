const router = require('express').Router()

const { studentRegister, studentLogIn, getStudentDetail } = require("../controllers/studentController.js")

router.post('/register', studentRegister);
router.post('/login', studentLogIn);
router.get("/:id", getStudentDetail);
module.exports = router;