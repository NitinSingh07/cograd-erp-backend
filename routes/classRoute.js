const express = require("express");
const router = express.Router();
const {
  ClassCreate,
  classList,
  getClassDetail,
  deleteClass,
} = require("../controllers/classController");
router.post("/create", ClassCreate);
router.get("/classList", classList);

//get details of a specific class
router.get("/classDetail/:id", getClassDetail);
// to delete a class//not working
router.delete("/deleteClass/:id", deleteClass);

module.exports = router;
