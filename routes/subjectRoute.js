const express = require("express");
const {
  subjectCreate,
  allSubjects,
  classSubjects,
  freeSubjectList,
} = require("../controllers/subjectController");
const router = express.Router();

router.post("/create", subjectCreate);
router.get("/allSubjects", allSubjects);
router.get("/classSubjects/:id", classSubjects);
router.get("/freeSubjects/:id", freeSubjectList);

module.exports = router; 
