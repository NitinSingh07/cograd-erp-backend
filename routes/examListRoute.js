const express = require("express");
const {
  examListFind,
  addNewExam,
  editExam,
  deleteExam,
  findExamById,
} = require("../controllers/examListController");
const router = express.Router();

router.get("/", examListFind);
router.post("/addExam", addNewExam);
router.get("/:id", findExamById);
router.patch("/editExam/:id", editExam);
router.delete("/deleteExam/:id", deleteExam);

module.exports = router;
