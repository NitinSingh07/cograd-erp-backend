const express = require("express");
const {
  createNewPeriod,
  getAllPeriods,
  updatePeriod,
  deletePeriod,
  getClassPeriodByTeacher,
  createArrangement,
  getArrangementById,
  updateArrangement,
  deleteArrangement,
} = require("../controllers/classPeriodController");
const router = express.Router();

router.post("/", createNewPeriod);
router.get("/allPeriods", getAllPeriods);
router.get("/getAll/:teacherID", getClassPeriodByTeacher);
router.put("/:periodId", updatePeriod);
router.delete("/:periodId", deletePeriod);
router.post("/arrangement", createArrangement);
router.get("/arrangement/:teacherId", getArrangementById);
router.put("/arrangement/:teacherId", updateArrangement);
router.delete("/arrangement/periodId",deleteArrangement);


module.exports = router;
