const express = require("express");
const router = express.Router();
const { addExpense, getExpensesBySchool,getExpensesBySchoolperDay } = require("../controllers/schoolExpenseController");

router.post("/", addExpense);
router.get("/:schoolId", getExpensesBySchool);
router.get("/:date/:schoolId", getExpensesBySchoolperDay);

module.exports = router;
