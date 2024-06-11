const express = require("express");
const {
  adminLogin,
  adminRegister,
  adminSchoolLogin,
} = require("../controllers/admin");
const router = express.Router();

router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.post("/schoolLogin", adminSchoolLogin);
router.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("adminToken");
  res.send({ message: "Logged out successfully" });
});

module.exports = router;
