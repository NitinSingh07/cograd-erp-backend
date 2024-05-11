const express = require("express");
const {
  adminLogin,adminRegister
 
} = require("../controllers/admin");
const router = express.Router();

router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("token");
  res.send({ message: "Logged out successfully" });
});

module.exports = router;
