const express = require("express");
const singleUpload = require("../middleware/multer");
const { parentRegister } = require("../controllers/parentController");
const router = express.Router();

router.route("/register").post(singleUpload, parentRegister);

module.exports = router;
