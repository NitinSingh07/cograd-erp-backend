const express = require("express");
const singleUpload = require("../middleware/multer");
const { parentRegister,parentLogin } = require("../controllers/parentController");
const router = express.Router();

router.route("/register").post(singleUpload, parentRegister);
router.route("/login").post(singleUpload, parentLogin);

module.exports = router;
