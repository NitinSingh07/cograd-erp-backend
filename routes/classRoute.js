const express = require("express");

const router = express.Router();
const {
  ClassCreate,
  classList,
  getClassDetail,
  deleteClass,updateClassName
} = require("../controllers/classController");

router.post("/create/:id", ClassCreate);
router.get("/get/:id", classList);

//get details of a specific class
router.get("/classDetail/:id", getClassDetail);
// to delete a class//subjects should be there
router.delete("/deleteClass/:id", deleteClass);
router.put("/updateClass/:id", updateClassName);

module.exports = router;
