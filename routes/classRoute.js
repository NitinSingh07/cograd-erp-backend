const express = require("express");
const {
  ClassCreate,
  classList,
  getClassDetail,
  deleteClass,
} = require("../controllers/classController");
const router = express.Router();

router.post("/create", ClassCreate);
router.get("/classList/:id", classList);
router.get("/classDetail/:id", getClassDetail);
router.delete("/deleteClass/:id", deleteClass);

module.exports = router;
