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
  createTimeTable,
  updateTimeTable,
  getTimetableByClass,
  getTimetableByTeacher,
  getAvailableTeachers,
  getArrangementsBySchoolId,
  getClassPeriodProgress,
} = require("../controllers/classPeriodController");
const router = express.Router();


//Routes realated to timetable
router.post('/timetable', createTimeTable);
router.get('/timetable/:classId',getTimetableByClass)
router.get('/timetable/teacher/:teacherId', getTimetableByTeacher);

//Routes realated to class period
router.post("/", createNewPeriod);
router.get("/allPeriods", getAllPeriods);
router.get("/classPeriodProgress/:schoolId",getClassPeriodProgress)
router.get("/getAll/:teacherId", getClassPeriodByTeacher);
router.put("/:periodId", updatePeriod);
router.delete("/:periodId", deletePeriod);
router.post("/arrangement", createArrangement);
router.get("/arrangement/:teacherId", getArrangementById);
router.get('/arrangements/school/:schoolId', getArrangementsBySchoolId);
router.get("/teachers/available",getAvailableTeachers)
router.put("/arrangement/:teacherId", updateArrangement);
router.delete("/arrangement/periodId",deleteArrangement);


module.exports = router;
