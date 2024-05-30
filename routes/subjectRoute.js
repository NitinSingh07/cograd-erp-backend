const express = require("express");
const {
  subjectCreate,
  allSubjects,
  classSubjects,
  freeSubjectList,
} = require("../controllers/subjectController");
const router = express.Router();

router.post("/add", subjectCreate);
router.get("/get/:schoolId", allSubjects);
router.get("/classSubjects/:schoolId/:className", classSubjects);
router.get("/freeSubjects/:schoolId/:id", freeSubjectList);

module.exports = router;
