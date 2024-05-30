const express = require("express");
const {
  subjectCreate,
  allSubjects,
  classSubjects,
  freeSubjectList,
} = require("../controllers/subjectController");
const router = express.Router();

router.post("/add/:schoolId", subjectCreate);
router.get("/get/:schoolId", allSubjects);
router.get("/classSubjects/:schoolId/:id", classSubjects);
router.get("/freeSubjects/:schoolId/:id", freeSubjectList);

module.exports = router;
