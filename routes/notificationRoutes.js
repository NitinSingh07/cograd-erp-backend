const express = require("express");
const router = express.Router();
const { createNotification, getAllNotifications } = require("../controllers/notificationController");

router.post("/", createNotification);
router.get("/", getAllNotifications);

module.exports = router;
