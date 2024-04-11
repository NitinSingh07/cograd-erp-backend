const express = require("express");
const {
  findResultofStudent,
  addExamResult,
  getClassExamResults,
} = require("../controllers/examResultController");
const router = express.Router();

router.post("/", addExamResult);
router.get("/:id", findResultofStudent);
router.get("/classResult/:classId", getClassExamResults);

module.exports = router;
