const express = require("express");
const {
  createNewTask,
  getAllTasks,
  getTaskByPeriod,
  deleteTask,
  updateTask,
} = require("../controllers/taskController");
const router = express.Router();

router.post("/", createNewTask);
router.get("/alltasks", getAllTasks);
router.get("/task/:PeriodId", getTaskByPeriod);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
