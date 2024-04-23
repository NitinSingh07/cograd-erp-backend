const express = require("express");
const { teacherRegister, teacherLogin } = require("../controllers/teacherController");
const router = express.Router();

router.post("/register", teacherRegister);
router.post("/login", teacherLogin);
router.post("/logout", (req, res) => {
    res.clearCookie("teacherToken");
    res.send({ message: "Logged out successfully" });
});

module.exports = router;
