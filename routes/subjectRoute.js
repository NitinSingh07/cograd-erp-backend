const express = require("express");
const {
  subjectCreate,
  allSubjects,
  classSubjects,
  freeSubjectList,
  deleteSubject,
  getSubjectById,
} = require("../controllers/subjectController");
const router = express.Router();

router.post("/add", subjectCreate);
router.get("/get/:schoolId", allSubjects);
router.get("/classSubjects/:schoolId/:className", classSubjects);
router.get("/freeSubjects/:schoolId/:id", freeSubjectList);
router.get("/:subjectId", getSubjectById);
router.delete("/deleteSubject/:id", deleteSubject);

module.exports = router;
