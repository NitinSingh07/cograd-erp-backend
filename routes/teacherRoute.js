const express = require("express");
const { teacherRegister } = require("../controllers/teacherController");
const router = express.Router();

router.post("/register", teacherRegister);

module.exports = router;
