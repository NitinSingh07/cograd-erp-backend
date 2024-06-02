const express = require("express");
const singleUpload = require("../middleware/multer");
const {
  parentRegister,
  parentLogin,
  calculateRemainingAmount,
  updateFeesPaid,
  parentDetails,
  parentsList,
  updateStudentFees,
} = require("../controllers/parentController");
const router = express.Router();

router.route("/register").post(singleUpload, parentRegister);
router.route("/login").post(singleUpload, parentLogin);
router.get("/feesDetails/:id", calculateRemainingAmount);
router.get("/parentsList/:id", parentsList);

router.put("/updateStudentFees/:parentId/:studentId", updateStudentFees);

router.post("/updateFees", updateFeesPaid);
router.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("parentToken");
  res.send({ message: "Parent Logged out successfully" });
});
router.get("/getDetails/:id", parentDetails);
module.exports = router;
