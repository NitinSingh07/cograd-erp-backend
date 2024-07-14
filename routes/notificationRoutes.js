const express = require("express");
const router = express.Router();
const { createNotification, getAllNotifications, getNotificationByParentId, getNotificationByTeacherId, getNotificationByClassTeacherId } = require("../controllers/notificationController");

router.post("/", createNotification);
router.get("/", getAllNotifications);
router.get("/parent/:parentId", getNotificationByParentId); // Route for parent notifications
router.get("/teacher/:teacherId", getNotificationByTeacherId); // Route for teacher notifications
router.get("/classTeacher/:classTeacherId", getNotificationByClassTeacherId); // Route for class teacher notifications

module.exports = router;
