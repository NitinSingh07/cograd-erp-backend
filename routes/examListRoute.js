const express = require("express");
const {
  examListFind,
  addNewExam,
} = require("../controllers/examListController");
const router = express.Router();

router.get("/", examListFind);
router.post("/addExam", addNewExam);

module.exports = router;
