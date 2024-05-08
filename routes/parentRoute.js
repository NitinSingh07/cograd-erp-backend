const express = require("express");
const singleUpload = require("../middleware/multer");
const {
  parentRegister,
  parentLogin,
  calculateRemainingAmount,
  updateFeesPaid,
  parentDetails,
} = require("../controllers/parentController");
const router = express.Router();

router.route("/register").post(singleUpload, parentRegister);
router.route("/login").post(singleUpload, parentLogin);
router.get("/feesDetails/:id", calculateRemainingAmount);
router.get("/getDetails/:id", parentDetails);

router.post("/updateFees/:id", updateFeesPaid);
router.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("parentToken");
  res.send({ message: "Parent Logged out successfully" });
});
module.exports = router;
