const express = require("express");
const router = express.Router();
const {
  ClassCreate,
  classList,
  getClassDetail,
  deleteClass,
} = require("../controllers/classController");

router.post("/create", ClassCreate);
router.get("/get", classList);

//get details of a specific class
router.get("/classDetail/:id", getClassDetail);
// to delete a class//subjects should be there 
router.delete("/deleteClass/:id", deleteClass);

module.exports = router;
