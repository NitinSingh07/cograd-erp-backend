const express = require("express");
const {
  ClassCreate,
  classList,
  getClassDetail,
  deleteClass,
} = require("../controllers/classController");
const router = express.Router();

router.post("/create", ClassCreate);
router.get("/classList", classList);
router.get("/classDetail", getClassDetail);
router.delete("/deleteClass", deleteClass);

module.exports = router;
