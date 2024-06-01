const express = require("express");
const {
  findResultofStudent,
  addExamResult,
  getClassExamResults,
  editExamResult,
  deleteExamResult,
} = require("../controllers/examResultController");
const router = express.Router();

router.post("/", addExamResult);
router.get("/:id", findResultofStudent);
router.get("/classResult/:classId", getClassExamResults);
router.put("/update/:id", editExamResult);
router.delete(
  "/delete/:examResultId/:classTeacherId/:studentId",
  deleteExamResult
);

module.exports = router;
