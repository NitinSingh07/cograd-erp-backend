const express = require("express");
const { schoolRegister, schoolLogIn } = require("../controllers/school");
const router = express.Router();

router.post("/register", schoolRegister);
router.post("/login", schoolLogIn);

module.exports = router;
