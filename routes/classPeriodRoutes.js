const express = require("express");
const {
  createNewPeriod,
  getAllPeriods,
  getPeriodByTeacherAndDay,
  updatePeriod,
  deletePeriod,
} = require("../controllers/classPeriodController");
const router = express.Router();

router.post("/", createNewPeriod);
router.get("/allPeriods", getAllPeriods);
router.get("/getAll/:TeacherID/:Date", getPeriodByTeacherAndDay);
router.put("/", updatePeriod);
router.delete("/", deletePeriod);

module.exports = router;
